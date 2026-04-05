from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.services.ai_service import analyze_job_match

router = APIRouter(prefix="/match", tags=["match"])


class MatchRequest(BaseModel):
    resume_text: str
    job_title: str
    job_description: str


@router.post("/analyze")
async def analyze_match(body: MatchRequest):
    if not body.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text is required.")
    if not body.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required.")

    result = await analyze_job_match(
        body.resume_text,
        body.job_title,
        body.job_description,
    )

    return {
        **result,
        "ai_enabled": settings.ai_enabled,
        "using_ollama": settings.use_ollama,
    }


@router.get("/status")
async def ai_status():
    return {
        "ai_enabled": settings.ai_enabled,
        "mode": (
            f"ollama ({settings.ollama_model})" if settings.use_ollama and settings.ai_enabled
            else "claude-api" if settings.ai_enabled
            else "mock"
        ),
        "to_enable_ollama": "Set AI_ENABLED=true and USE_OLLAMA=true in backend/.env",
        "to_enable_claude": "Set AI_ENABLED=true and ANTHROPIC_API_KEY=sk-ant-... in backend/.env",
    }