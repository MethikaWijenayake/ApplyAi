from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health, resume, jobs, match
from app.routers.screening import router as screening_router

app = FastAPI(
    title="ApplyAI API",
    version="0.5.0",
    description="AI-powered resume screening and career guidance platform.",
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
app.include_router(screening_router)


@app.get("/")
async def root():
    return {
        "service": "ApplyAI API",
        "version": "0.5.0",
        "ai_enabled": settings.ai_enabled,
        "docs": "/docs",
    }
