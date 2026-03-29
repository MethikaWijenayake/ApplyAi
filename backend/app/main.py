from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health, resume, jobs

app = FastAPI(
    title="ApplyAI API",
    version="0.1.0",
    description="AI-powered resume parsing, job matching, and auto-apply backend.",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(resume.router)
app.include_router(jobs.router)


@app.get("/")
async def root():
    return {
        "service": "ApplyAI API",
        "version": "0.1.0",
        "mock_ai": settings.use_mock_ai,
        "docs": "/docs",
    }
