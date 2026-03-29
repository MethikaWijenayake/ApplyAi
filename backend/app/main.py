from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health, resume, jobs, match

app = FastAPI(
    title="ApplyAI API",
    version="0.2.0",
    description="AI-powered resume parsing, job matching, and auto-apply backend.",
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


@app.get("/")
async def root():
    return {
        "service": "ApplyAI API",
        "version": "0.2.0",
        "ai_enabled": settings.ai_enabled,
        "docs": "/docs",
    }
