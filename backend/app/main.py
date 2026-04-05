from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health, resume, jobs, match
from app.routers.email_router import router as email_router
from app.routers.apply import router as apply_router

app = FastAPI(
    title="ApplyAI API",
    version="0.4.0",
    description="AI-powered resume parsing, job matching, auto-apply, and email automation.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(match.router)
app.include_router(email_router)
app.include_router(apply_router)


@app.get("/")
async def root():
    return {
        "service": "ApplyAI API",
        "version": "0.4.0",
        "ai_enabled": settings.ai_enabled,
        "email_domain": settings.email_domain or "not configured",
        "docs": "/docs",
    }