"""
Mock AI service.

Every function here has the same signature it will have when wired to
the real Claude API.  Set USE_MOCK_AI=false in .env to switch.
"""

from app.config import settings


# ── Resume parsing ───────────────────────────────────────────────────────────

async def parse_resume(text: str) -> dict:
    """Extract structured data from raw resume text."""
    if not settings.use_mock_ai:
        # TODO Phase 2: call Claude API
        raise NotImplementedError("Real AI not wired yet")

    return {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "+1 415 555 0102",
        "summary": "Software engineer with 5 years of experience in Python and TypeScript.",
        "skills": ["Python", "TypeScript", "React", "FastAPI", "PostgreSQL", "Docker"],
        "experience": [
            {
                "company": "Acme Corp",
                "title": "Senior Software Engineer",
                "start": "2021-03",
                "end": "present",
                "bullets": [
                    "Led migration of monolith to microservices, reducing p95 latency by 40%.",
                    "Mentored 3 junior engineers.",
                ],
            }
        ],
        "education": [
            {
                "institution": "UC Berkeley",
                "degree": "BS Computer Science",
                "year": 2019,
            }
        ],
    }


# ── Job matching ─────────────────────────────────────────────────────────────

async def score_job_match(resume_json: dict, job_description: str) -> dict:
    """Return a match score + skill gaps for a resume ↔ job pair."""
    if not settings.use_mock_ai:
        raise NotImplementedError("Real AI not wired yet")

    return {
        "match_score": 82,
        "matched_skills": ["Python", "FastAPI", "PostgreSQL"],
        "skill_gaps": ["Kubernetes", "Terraform"],
        "recommendations": [
            "Add a Kubernetes side-project to your resume.",
            "Highlight your database optimisation work more prominently.",
        ],
        "summary": "Strong backend match. Brush up on infrastructure tooling to be competitive.",
    }


# ── Interview prep ───────────────────────────────────────────────────────────

async def generate_interview_question(
    job_title: str, resume_json: dict, previous_messages: list
) -> str:
    """Return the next mock interview question."""
    if not settings.use_mock_ai:
        raise NotImplementedError("Real AI not wired yet")

    questions = [
        f"Tell me about yourself and why you're interested in the {job_title} role.",
        "Describe a technically challenging project you led end-to-end.",
        "How do you approach debugging a production issue at 2 AM?",
        "Where do you see yourself in three years?",
    ]
    idx = len(previous_messages) // 2  # one question per exchange
    return questions[min(idx, len(questions) - 1)]


# ── Email drafting ───────────────────────────────────────────────────────────

async def draft_followup_email(
    job_title: str, company: str, days_since_apply: int
) -> str:
    """Draft a polite follow-up email for a pending application."""
    if not settings.use_mock_ai:
        raise NotImplementedError("Real AI not wired yet")

    return (
        f"Subject: Following up — {job_title} application\n\n"
        f"Hi [Hiring Manager],\n\n"
        f"I applied for the {job_title} position at {company} {days_since_apply} days ago "
        f"and wanted to briefly follow up. I'm very excited about this opportunity and "
        f"would love to chat about how my background could be a great fit.\n\n"
        f"Please let me know if there's anything else you need from me.\n\n"
        f"Best,\n[Your name]"
    )
