import httpx
from fastapi import APIRouter, HTTPException, Query

from app.config import settings

router = APIRouter(prefix="/jobs", tags=["jobs"])

JSEARCH_URL = "https://jsearch.p.rapidapi.com/search"


@router.get("/search")
async def search_jobs(
    query: str = Query(..., description="Job title and keywords"),
    location: str = Query("", description="City, state or country"),
    page: int = Query(1, ge=1),
    num_pages: int = Query(1, ge=1, le=3),
):
    """
    Search for jobs via JSearch API (RapidAPI).
    Requires JSEARCH_API_KEY in backend/.env
    """
    if not settings.jsearch_api_key:
        raise HTTPException(
            status_code=503,
            detail="JSEARCH_API_KEY not configured. Add it to backend/.env",
        )

    search_query = f"{query} {location}".strip()

    headers = {
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
        "x-rapidapi-key": settings.jsearch_api_key,
    }

    params = {
        "query": search_query,
        "page": str(page),
        "num_pages": str(num_pages),
        "date_posted": "all",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(JSEARCH_URL, headers=headers, params=params)
            resp.raise_for_status()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="JSearch API timed out.")
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"JSearch API error: {e.response.text[:200]}",
            )

    data = resp.json()
    jobs_raw = data.get("data", [])

    # Normalize to a clean shape
    jobs = []
    for j in jobs_raw:
        jobs.append({
            "job_id": j.get("job_id", ""),
            "title": j.get("job_title", ""),
            "company": j.get("employer_name", ""),
            "location": _format_location(j),
            "employment_type": j.get("job_employment_type", ""),
            "is_remote": j.get("job_is_remote", False),
            "description": j.get("job_description", "")[:500],
            "description_full": j.get("job_description", ""),
            "salary_min": j.get("job_min_salary"),
            "salary_max": j.get("job_max_salary"),
            "salary_currency": j.get("job_salary_currency", "USD"),
            "salary_period": j.get("job_salary_period", ""),
            "apply_link": j.get("job_apply_link", ""),
            "posted_at": j.get("job_posted_at_datetime_utc", ""),
            "logo": j.get("employer_logo", ""),
        })

    return {"jobs": jobs, "total": len(jobs), "query": search_query}


def _format_location(j: dict) -> str:
    parts = []
    city = j.get("job_city", "")
    state = j.get("job_state", "")
    country = j.get("job_country", "")
    if city:
        parts.append(city)
    if state:
        parts.append(state)
    elif country:
        parts.append(country)
    return ", ".join(parts) if parts else "Remote" if j.get("job_is_remote") else "Unknown"
