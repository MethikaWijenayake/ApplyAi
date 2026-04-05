"""
Auto-apply routes.
POST /apply/submit — trigger auto-apply for a job
GET  /apply/status/{job_application_id} — check apply status
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from supabase import create_client

from app.config import settings
from app.services.autoapply_service import auto_apply

router = APIRouter(prefix="/apply", tags=["apply"])


def get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


class ApplyRequest(BaseModel):
    user_id: str
    job_url: str
    job_title: str
    company: str
    job_description: str = ""


@router.post("/submit")
async def submit_application(body: ApplyRequest, background_tasks: BackgroundTasks):
    """
    Trigger auto-apply for a job. Runs in background.
    Creates a job_applications row immediately with status 'applied',
    then updates it with the result.
    """
    supabase = get_supabase()

    # Get user info
    user_result = supabase.table("users").select("full_name, email").eq("id", body.user_id).single().execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")

    user = user_result.data
    user_name = user.get("full_name", "")
    user_email = user.get("email", "")

    # Get resume data
    resume_result = supabase.table("resumes").select("parsed_json").eq("user_id", body.user_id).order("uploaded_at", desc=True).limit(1).execute()
    resume_data = {}
    if resume_result.data:
        resume_data = resume_result.data[0].get("parsed_json") or {}

    # Create job_applications row immediately
    app_result = supabase.table("job_applications").insert({
        "user_id": body.user_id,
        "job_title": body.job_title,
        "company": body.company,
        "job_url": body.job_url,
        "job_description": body.job_description,
        "status": "applied",
        "auto_applied": True,
        "apply_method": "auto",
        "apply_result": "pending",
    }).execute()

    if not app_result.data:
        raise HTTPException(status_code=500, detail="Failed to create application record")

    application_id = app_result.data[0]["id"]

    # Run apply in background
    background_tasks.add_task(
        _run_auto_apply,
        application_id=application_id,
        job_url=body.job_url,
        job_title=body.job_title,
        company=body.company,
        resume_data=resume_data,
        user_email=user_email,
        user_name=user_name,
    )

    return {
        "application_id": application_id,
        "status": "pending",
        "message": "Auto-apply started. Check status at /apply/status/{application_id}",
    }


async def _run_auto_apply(
    application_id: str,
    job_url: str,
    job_title: str,
    company: str,
    resume_data: dict,
    user_email: str,
    user_name: str,
):
    """Background task that runs Playwright and updates the DB with result."""
    supabase = get_supabase()

    result = await auto_apply(
        job_url=job_url,
        job_title=job_title,
        company=company,
        resume_data=resume_data,
        user_email=user_email,
        user_name=user_name,
    )

    supabase.table("job_applications").update({
        "apply_result": result["status"],
        "apply_method": result.get("method", "auto"),
        "apply_error": result.get("error"),
        "status": "applied" if result["status"] == "success" else "applied",
    }).eq("id", application_id).execute()

    print(f"[APPLY] {job_title} at {company}: {result['status']}")


@router.get("/status/{application_id}")
async def get_apply_status(application_id: str):
    """Check the status of an auto-apply attempt."""
    supabase = get_supabase()
    result = supabase.table("job_applications").select("*").eq("id", application_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Application not found")
    return result.data