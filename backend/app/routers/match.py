from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.services.ai_service import match_resume_to_job

router = APIRouter(prefix="/match", tags=["match"])


class MatchRequest(BaseModel):
    resume_text: str
    job_description: str
    job_id: str | None = None


class MatchResponse(BaseModel):
    match_score: int
    strengths: list[str]
    skill_gaps: list[str]
    recommendations: list[str]
    summary: str
    ai_enabled: bool


@router.post("/resume-to-job", response_model=MatchResponse)
async def match_resume_to_job_endpoint(body: MatchRequest):
    """
    Match a resume against a job description.

    AI_ENABLED=false → returns mock data instantly (default)
    AI_ENABLED=true  → calls Claude API for real analysis
    """
    if not body.resume_text.strip():
        raise HTTPException(status_code=400, detail="resume_text is required.")
    if not body.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description is required.")

    try:
        result = await match_resume_to_job(body.resume_text, body.job_description)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI matching failed: {str(e)}",
        )

    return {**result, "ai_enabled": settings.ai_enabled}
