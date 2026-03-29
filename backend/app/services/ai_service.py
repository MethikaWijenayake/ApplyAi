"""
AI Service — Resume matching, interview prep, email drafting.

TOGGLE:
  AI_ENABLED=false  →  returns hardcoded mock responses instantly (default)
  AI_ENABLED=true   →  calls real Claude API

To enable real AI:
  1. Set AI_ENABLED=true in backend/.env
  2. Set ANTHROPIC_API_KEY=sk-ant-... in backend/.env
  3. Restart uvicorn
  No code changes needed.
"""

from app.config import settings


# ── Resume ↔ Job matching ─────────────────────────────────────────────────────

MOCK_MATCH_RESPONSE = {
    "match_score": 78,
    "strengths": ["Python", "Data Analysis", "FastAPI", "PostgreSQL"],
    "skill_gaps": ["SQL", "Tableau", "Kubernetes"],
    "recommendations": [
        "Complete a SQL course on Coursera or Mode Analytics",
        "Build a Tableau dashboard using a public dataset",
        "Add a Kubernetes side-project or certification to your resume",
    ],
    "summary": (
        "Strong backend and data engineering fit. "
        "Brushing up on BI tooling and orchestration will make you highly competitive."
    ),
}


async def match_resume_to_job(resume_text: str, job_description: str) -> dict:
    """
    Compare a resume against a job description.
    Returns match_score, strengths, skill_gaps, recommendations, summary.
    """
    if not settings.ai_enabled:
        return MOCK_MATCH_RESPONSE

    # ── Real Claude API ───────────────────────────────────────────────────────
    import anthropic

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    prompt = f"""You are an expert technical recruiter and career coach.

Analyze how well this resume matches the job description and return a JSON object with exactly these keys:
- match_score: integer 0-100 representing overall fit
- strengths: list of strings — skills/experiences from the resume that match the job well
- skill_gaps: list of strings — skills required by the job that are missing or weak in the resume
- recommendations: list of 2-4 actionable strings — specific steps the candidate can take to improve their fit
- summary: one sentence summary of the overall fit

RESUME:
{resume_text[:3000]}

JOB DESCRIPTION:
{job_description[:2000]}

Return ONLY valid JSON. No markdown, no explanation."""

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    import json
    raw = message.content[0].text.strip()
    return json.loads(raw)


# ── Interview prep ────────────────────────────────────────────────────────────

async def generate_interview_question(
    job_title: str, resume_text: str, previous_messages: list
) -> str:
    if not settings.ai_enabled:
        questions = [
            f"Tell me about yourself and why you're excited about the {job_title} role.",
            "Walk me through the most technically complex project you've owned end-to-end.",
            "How do you handle a production incident at 2 AM when you're the only one on-call?",
            "Where do you see yourself in three years?",
        ]
        idx = min(len(previous_messages) // 2, len(questions) - 1)
        return questions[idx]

    import anthropic
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    history = "\n".join(
        f"{m['role'].upper()}: {m['content']}" for m in previous_messages[-6:]
    )

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=256,
        messages=[{
            "role": "user",
            "content": (
                f"You are conducting a job interview for a {job_title} position.\n"
                f"Resume summary: {resume_text[:500]}\n"
                f"Conversation so far:\n{history}\n\n"
                "Ask the next interview question. Return only the question, nothing else."
            ),
        }],
    )
    return message.content[0].text.strip()


# ── Follow-up email ───────────────────────────────────────────────────────────

async def draft_followup_email(
    job_title: str, company: str, days_since_apply: int
) -> str:
    if not settings.ai_enabled:
        return (
            f"Subject: Following up — {job_title} application\n\n"
            f"Hi [Hiring Manager],\n\n"
            f"I applied for the {job_title} position at {company} "
            f"{days_since_apply} days ago and wanted to briefly follow up. "
            f"I'm very excited about this opportunity and would love to discuss "
            f"how my background could be a great fit.\n\n"
            f"Please let me know if there's anything else you need from me.\n\n"
            f"Best,\n[Your name]"
        )

    import anthropic
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=300,
        messages=[{
            "role": "user",
            "content": (
                f"Write a short, professional follow-up email for a {job_title} "
                f"application at {company} sent {days_since_apply} days ago. "
                "Include a subject line. Be concise and genuine. "
                "Return only the email text."
            ),
        }],
    )
    return message.content[0].text.strip()
