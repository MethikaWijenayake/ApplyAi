"""
HR Screening routes:
  POST /screening/postings           — create a job posting
  GET  /screening/postings           — list HR's job postings
  GET  /screening/postings/{id}      — get single posting with candidates
  POST /screening/postings/{id}/upload — upload a candidate resume
  POST /screening/postings/{id}/screen  — run AI screening on all candidates
  GET  /screening/postings/{id}/results — get ranked results
  DELETE /screening/candidates/{id}  — remove a candidate
"""

import io
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel
from supabase import create_client

from app.config import settings
from app.services.resume_parser import extract_text, extract_email, extract_name, extract_skills, extract_sections, parse_experience_section, parse_education_section
from app.services.screening_service import screen_candidate, rank_candidates

router = APIRouter(prefix="/screening", tags=["screening"])

MAX_FILE_SIZE = 5 * 1024 * 1024


def get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


# ── Job postings ──────────────────────────────────────────────────────────────

class CreatePostingRequest(BaseModel):
    user_id: str
    title: str
    description: str
    requirements: str = ""
    department: str = ""
    location: str = ""


@router.post("/postings")
async def create_posting(body: CreatePostingRequest):
    supabase = get_supabase()
    result = supabase.table("job_postings").insert({
        "created_by": body.user_id,
        "title": body.title,
        "description": body.description,
        "requirements": body.requirements,
        "department": body.department,
        "location": body.location,
    }).execute()
    return result.data[0]


@router.get("/postings")
async def list_postings(user_id: str):
    supabase = get_supabase()
    result = supabase.table("job_postings").select("*, candidate_resumes(count)").eq("created_by", user_id).order("created_at", desc=True).execute()
    return result.data


@router.get("/postings/{posting_id}")
async def get_posting(posting_id: str):
    supabase = get_supabase()
    posting = supabase.table("job_postings").select("*").eq("id", posting_id).single().execute()
    if not posting.data:
        raise HTTPException(status_code=404, detail="Job posting not found")

    candidates = supabase.table("candidate_resumes").select("id, candidate_name, candidate_email, uploaded_at").eq("job_posting_id", posting_id).order("uploaded_at").execute()

    return {
        **posting.data,
        "candidates": candidates.data or [],
    }


# ── Candidate upload ──────────────────────────────────────────────────────────

@router.post("/postings/{posting_id}/upload")
async def upload_candidate(
    posting_id: str,
    user_id: str,
    file: UploadFile = File(...),
):
    supabase = get_supabase()

    # Verify posting exists
    posting = supabase.table("job_postings").select("id, title").eq("id", posting_id).single().execute()
    if not posting.data:
        raise HTTPException(status_code=404, detail="Job posting not found")

    filename = file.filename or ""
    content_type = file.content_type or ""
    is_pdf = filename.lower().endswith(".pdf") or "pdf" in content_type
    is_docx = filename.lower().endswith(".docx") or "wordprocessingml" in content_type

    if not (is_pdf or is_docx):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum 5 MB.")

    # Extract text
    try:
        raw_text = extract_text(file_bytes, content_type, filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not extract text: {e}")

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="No text found. Is this a scanned PDF?")

    # Parse fields
    candidate_name = extract_name(raw_text)
    candidate_email = extract_email(raw_text)
    skills = extract_skills(raw_text)
    sections = extract_sections(raw_text)
    exp_text = sections.get("work experience") or sections.get("experience") or ""
    edu_text = sections.get("education") or ""

    parsed_json = {
        "name": candidate_name,
        "email": candidate_email,
        "skills": skills,
        "work_experience": parse_experience_section(exp_text) if exp_text else [],
        "education": parse_education_section(edu_text) if edu_text else [],
        "raw_text": raw_text,
    }

    # Upload file to Supabase Storage
    storage_path = f"{user_id}/{posting_id}/{filename}"
    supabase.storage.from_("candidate-resumes").upload(
        storage_path, file_bytes, {"content-type": content_type, "upsert": "true"}
    )
    file_url_data = supabase.storage.from_("candidate-resumes").get_public_url(storage_path)

    # Save to DB
    result = supabase.table("candidate_resumes").insert({
        "job_posting_id": posting_id,
        "uploaded_by": user_id,
        "candidate_name": candidate_name or filename,
        "candidate_email": candidate_email,
        "file_url": file_url_data,
        "parsed_text": raw_text,
        "parsed_json": parsed_json,
    }).execute()

    return {
        "id": result.data[0]["id"],
        "candidate_name": candidate_name or filename,
        "candidate_email": candidate_email,
    }


# ── AI screening ──────────────────────────────────────────────────────────────

@router.post("/postings/{posting_id}/screen")
async def run_screening(posting_id: str, user_id: str):
    """
    Run AI screening on all candidates for this job posting.
    Scores, ranks, and saves results to screening_results table.
    """
    supabase = get_supabase()

    posting = supabase.table("job_postings").select("*").eq("id", posting_id).single().execute()
    if not posting.data:
        raise HTTPException(status_code=404, detail="Job posting not found")

    posting_data = posting.data
    job_title = posting_data["title"]
    job_description = posting_data["description"] + "\n" + (posting_data.get("requirements") or "")

    candidates = supabase.table("candidate_resumes").select("*").eq("job_posting_id", posting_id).execute()
    if not candidates.data:
        raise HTTPException(status_code=400, detail="No candidates uploaded yet.")

    # Screen each candidate
    all_results = []
    for candidate in candidates.data:
        resume_text = candidate.get("parsed_text") or ""
        candidate_name = candidate.get("candidate_name") or "Unknown"

        result = await screen_candidate(
            resume_text=resume_text,
            candidate_name=candidate_name,
            job_title=job_title,
            job_description=job_description,
        )

        all_results.append({
            "candidate_resume_id": candidate["id"],
            "candidate_name": candidate_name,
            **result,
        })

    # Rank all candidates
    ranked = await rank_candidates(all_results)

    # Save to screening_results (upsert)
    for r in ranked:
        supabase.table("screening_results").upsert({
            "job_posting_id": posting_id,
            "candidate_resume_id": r["candidate_resume_id"],
            "match_score": r["match_score"],
            "strengths": r.get("strengths", []),
            "skill_gaps": r.get("skill_gaps", []),
            "recommendations": r.get("recommendations", []),
            "bias_flags": r.get("bias_flags", []),
            "summary": r.get("summary", ""),
            "rank": r["rank"],
        }, on_conflict="job_posting_id,candidate_resume_id").execute()

    return {
        "screened": len(ranked),
        "results": ranked,
    }


@router.get("/postings/{posting_id}/results")
async def get_results(posting_id: str):
    supabase = get_supabase()

    results = supabase.table("screening_results").select(
        "*, candidate_resumes(candidate_name, candidate_email, uploaded_at)"
    ).eq("job_posting_id", posting_id).order("rank").execute()

    return results.data or []


@router.delete("/candidates/{candidate_id}")
async def delete_candidate(candidate_id: str):
    supabase = get_supabase()
    supabase.table("candidate_resumes").delete().eq("id", candidate_id).execute()
    return {"deleted": candidate_id}