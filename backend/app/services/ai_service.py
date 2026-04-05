"""
AI service — all AI features go through this file.

Three modes controlled by environment variables:
  AI_ENABLED=false              → mock responses (default, free, instant)
  AI_ENABLED=true, USE_OLLAMA=true  → local Ollama (free, runs on your PC)
  AI_ENABLED=true, USE_OLLAMA=false → Claude API (requires ANTHROPIC_API_KEY)

To switch modes, only .env changes are needed — no code changes.
"""

from app.config import settings


async def _call_ai(prompt: str, max_tokens: int = 1024) -> str:
    """
    Route to Ollama or Claude depending on settings.
    Single function so all features use the same toggle.
    """
    if settings.use_ollama:
        return await _call_ollama(prompt, max_tokens)
    return await _call_claude(prompt, max_tokens)


async def _call_ollama(prompt: str, max_tokens: int = 1024) -> str:
    """Call local Ollama API."""
    import httpx

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{settings.ollama_base_url}/api/generate",
            json={
                "model": settings.ollama_model,
                "prompt": prompt,
                "stream": False,
                "options": {"num_predict": max_tokens},
            },
        )
        resp.raise_for_status()
        return resp.json()["response"].strip()


async def _call_claude(prompt: str, max_tokens: int = 1024) -> str:
    """Call Anthropic Claude API."""
    import anthropic

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text.strip()


# ── Resume → Job match ────────────────────────────────────────────────────────

async def analyze_job_match(resume_text: str, job_title: str, job_description: str) -> dict:
    if settings.ai_enabled:
        return await _real_analyze_job_match(resume_text, job_title, job_description)
    return _mock_analyze_job_match()


def _mock_analyze_job_match() -> dict:
    return {
        "match_score": 78,
        "strengths": ["Python", "Data Analysis", "Problem Solving", "Communication"],
        "skill_gaps": ["SQL", "Tableau", "Cloud Infrastructure"],
        "recommendations": [
            "Complete a SQL fundamentals course on Coursera or Udemy.",
            "Build a Tableau portfolio project to demonstrate visualization skills.",
            "Get AWS Cloud Practitioner certified to strengthen your cloud knowledge.",
        ],
        "summary": "Strong analytical profile with solid programming skills. Closing the SQL and visualization gap would make you highly competitive for this role.",
        "ai_powered": False,
    }


async def _real_analyze_job_match(
    resume_text: str, job_title: str, job_description: str
) -> dict:
    import json

    prompt = f"""You are an expert technical recruiter and career coach.

Analyze how well this resume matches the job description below.

JOB TITLE: {job_title}

JOB DESCRIPTION:
{job_description[:3000]}

RESUME:
{resume_text[:3000]}

Respond with ONLY a valid JSON object in this exact format (no markdown, no explanation):
{{
  "match_score": <integer 0-100>,
  "strengths": [<list of 3-5 skills the candidate has that match>],
  "skill_gaps": [<list of 2-4 important missing skills>],
  "recommendations": [<list of 2-3 specific actionable steps>],
  "summary": "<2 sentence overall assessment>"
}}"""

    try:
        text = await _call_ai(prompt, max_tokens=1024)

        # Strip markdown fences if present
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]

        result = json.loads(text.strip())
        result["ai_powered"] = True
        result["model"] = settings.ollama_model if settings.use_ollama else "claude-sonnet"
        return result

    except Exception as e:
        print(f"AI match failed, falling back to mock: {e}")
        result = _mock_analyze_job_match()
        result["error"] = str(e)
        return result


# ── Interview prep ────────────────────────────────────────────────────────────

async def generate_interview_question(
    job_title: str, resume_json: dict, previous_messages: list
) -> str:
    if not settings.ai_enabled:
        questions = [
            f"Tell me about yourself and why you are interested in the {job_title} role.",
            "Describe a technically challenging project you led end-to-end.",
            "How do you approach debugging a production issue under pressure?",
            "Where do you see yourself in three years?",
        ]
        idx = len(previous_messages) // 2
        return questions[min(idx, len(questions) - 1)]

    skills = resume_json.get("skills", [])
    prompt = f"""You are conducting a job interview for a {job_title} position.
The candidate has these skills: {', '.join(skills[:10])}.
Previous messages in this interview: {len(previous_messages)}.

Ask ONE specific, relevant interview question. 
Make it progressively harder if there have been previous messages.
Return only the question, nothing else."""

    try:
        return await _call_ai(prompt, max_tokens=150)
    except Exception:
        return f"Tell me about your experience relevant to the {job_title} role."


# ── Email auto-reply ──────────────────────────────────────────────────────────

async def generate_email_reply(
    subject: str, body: str, user_name: str, job_title: str, company: str
) -> str:
    if not settings.ai_enabled:
        first = user_name.split()[0] if user_name else "there"
        role = f" regarding the {job_title} position at {company}" if job_title else ""
        return (
            f"Hi,\n\nThank you for reaching out{role}. "
            f"I am very interested and would love to discuss further. "
            f"Please let me know your availability for a call.\n\n"
            f"Best regards,\n{first}"
        )

    prompt = f"""Write a professional reply to this recruiter email on behalf of {user_name}.

Subject: {subject}
Email: {body[:1000]}

Job: {job_title} at {company}

Write a warm, concise reply (under 120 words). Sign off with just the first name.
Return only the email body, no subject line."""

    try:
        return await _call_ai(prompt, max_tokens=200)
    except Exception as e:
        print(f"Email reply AI failed: {e}")
        first = user_name.split()[0] if user_name else "there"
        return f"Hi,\n\nThank you for reaching out. I would love to connect.\n\nBest,\n{first}"