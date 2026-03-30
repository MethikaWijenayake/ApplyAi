from fastapi import APIRouter

router = APIRouter(prefix="/jobs", tags=["jobs"])

# Job search is handled by the Next.js API route (/api/jobs/search)
# which calls JSearch directly to avoid CORS issues.
# This router is kept as a placeholder for future server-side job features.

@router.get("/ping")
async def ping():
    return {"status": "ok", "service": "jobs"}