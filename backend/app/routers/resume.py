from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.resume_parser import (
    extract_email,
    extract_name,
    extract_phone,
    extract_sections,
    extract_skills,
    extract_text,
    parse_education_section,
    parse_experience_section,
)

router = APIRouter(prefix="/resume", tags=["resume"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    """
    Accept a PDF or DOCX resume upload.
    Returns structured JSON: name, email, phone, skills,
    work_experience, education, raw_text.
    """
    filename = file.filename or ""
    content_type = file.content_type or ""

    is_pdf = filename.lower().endswith(".pdf") or "pdf" in content_type
    is_docx = filename.lower().endswith(".docx") or "wordprocessingml" in content_type

    if not (is_pdf or is_docx):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum size is 5 MB.",
        )

    try:
        raw_text = extract_text(file_bytes, content_type, filename)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Could not extract text from file: {str(e)}",
        )

    if not raw_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No text could be extracted. Is the PDF scanned/image-only?",
        )

    name = extract_name(raw_text)
    email = extract_email(raw_text)
    phone = extract_phone(raw_text)
    skills = extract_skills(raw_text)
    sections = extract_sections(raw_text)

    exp_text = (
        sections.get("work experience")
        or sections.get("experience")
        or sections.get("employment")
        or ""
    )
    work_experience = parse_experience_section(exp_text) if exp_text else []

    edu_text = sections.get("education") or sections.get("academic") or ""
    education = parse_education_section(edu_text) if edu_text else []

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "work_experience": work_experience,
        "education": education,
        "raw_text": raw_text,
        "sections_found": list(sections.keys()),
    }

