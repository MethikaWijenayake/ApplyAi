from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai_service import score_job_match

router = APIRouter(prefix="/jobs", tags=["jobs"])


class MatchRequest(BaseModel):
    resume_json: dict
    job_description: str


@router.post("/match")
async def match_job(body: MatchRequest):
    """
    Score a resume against a job description.
    Returns mock data until Phase 3.
    """
    result = await score_job_match(body.resume_json, body.job_description)
    return result
