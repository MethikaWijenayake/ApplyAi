"""
HR Resume Screening Service

Screens candidate resumes against a job description.
Returns match score, skill gaps, strengths, and bias flags.

AI modes (controlled by AI_ENABLED + USE_OLLAMA in .env):
  false     → mock responses
  true+ollama → local Ollama
  true+claude → Claude API
"""

import json
from app.config import settings
from app.services.ai_service import _call_ai


# ── Bias detection word lists ─────────────────────────────────────────────────
# Based on Gaucher et al. (2011) gender-coded language in job ads

MASCULINE_CODED = [
    "aggressive", "ambitious", "analytical", "assertive", "autonomous",
    "competitive", "decisive", "determined", "dominant", "driven",
    "independent", "leader", "ninja", "outspoken", "rockstar", "strong",
]

FEMININE_CODED = [
    "collaborative", "committed", "communal", "compassionate", "connected",
    "cooperative", "dependable", "empathetic", "interpersonal", "loyal",
    "nurturing", "pleasant", "polite", "responsible", "supportive", "warm",
]

PRESTIGE_INSTITUTIONS = [
    "mit", "stanford", "harvard", "oxford", "cambridge", "caltech",
    "princeton", "yale", "columbia", "imperial college",
]


def detect_bias_flags(resume_text: str, job_description: str) -> list[dict]:
    """
    Check for potential bias indicators.
    Returns a list of flags with type, detail, and severity.
    Based on: Dastin (2018), Raghavan et al. (2020)
    """
    flags = []
    resume_lower = resume_text.lower()
    job_lower = job_description.lower()

    # Check job description for gendered language
    masc_found = [w for w in MASCULINE_CODED if w in job_lower]
    fem_found = [w for w in FEMININE_CODED if w in job_lower]

    if len(masc_found) >= 3:
        flags.append({
            "type": "gendered_language",
            "severity": "medium",
            "detail": f"Job description contains {len(masc_found)} masculine-coded words: {', '.join(masc_found[:4])}. May discourage female applicants (Gaucher et al., 2011).",
        })

    if len(fem_found) >= 3:
        flags.append({
            "type": "gendered_language",
            "severity": "low",
            "detail": f"Job description contains {len(fem_found)} feminine-coded words: {', '.join(fem_found[:4])}.",
        })

    # Check for prestige institution bias
    prestige_in_jd = any(inst in job_lower for inst in PRESTIGE_INSTITUTIONS)
    prestige_in_resume = any(inst in resume_lower for inst in PRESTIGE_INSTITUTIONS)
    if prestige_in_jd and not prestige_in_resume:
        flags.append({
            "type": "institution_bias",
            "severity": "medium",
            "detail": "Job description references elite institutions. Candidate does not have a prestige credential. Raghavan et al. (2020) found this correlates with demographic disparities.",
        })

    # Check for experience requirement vs years mentioned
    import re
    years_req = re.search(r"(\d+)\+?\s*years?\s*(of\s+)?experience", job_lower)
    years_in_resume = re.findall(r"(\d{4})\s*[-–]\s*(\d{4}|present|current)", resume_lower)
    if years_req and years_in_resume:
        req_years = int(years_req.group(1))
        # Rough estimate of candidate's years from resume date ranges
        total_years = 0
        for start, end in years_in_resume:
            end_year = 2024 if end.lower() in ("present", "current") else int(end)
            total_years = max(total_years, end_year - int(start))
        if total_years < req_years * 0.8:
            flags.append({
                "type": "experience_threshold",
                "severity": "low",
                "detail": f"Job requires {req_years}+ years. Candidate resume suggests ~{total_years} years. Strict cutoffs can exclude capable candidates (Sánchez-Monedero et al., 2020).",
            })

    return flags


# ── Mock screening ────────────────────────────────────────────────────────────

def _mock_screen(candidate_name: str) -> dict:
    import random
    score = random.randint(52, 91)
    return {
        "match_score": score,
        "strengths": ["Python", "Data Analysis", "Team Collaboration", "Problem Solving"],
        "skill_gaps": ["SQL", "Cloud Infrastructure", "System Design"],
        "recommendations": [
            "Complete a SQL course to address the most critical gap.",
            "Add cloud project experience (AWS or GCP) to strengthen the application.",
        ],
        "summary": f"Solid candidate with strong foundational skills. Score: {score}/100. Key gap is in database and cloud experience.",
        "ai_powered": False,
    }


# ── Real AI screening ─────────────────────────────────────────────────────────

async def screen_candidate(
    resume_text: str,
    candidate_name: str,
    job_title: str,
    job_description: str,
) -> dict:
    """
    Screen a single candidate resume against a job description.
    Returns match score, strengths, skill gaps, recommendations,
    summary, bias flags, and ai_powered flag.
    """
    # Bias detection always runs regardless of AI mode
    bias_flags = detect_bias_flags(resume_text, job_description)

    if not settings.ai_enabled:
        result = _mock_screen(candidate_name)
        result["bias_flags"] = bias_flags
        return result

    prompt = f"""You are an expert, unbiased HR recruiter conducting resume screening.

JOB TITLE: {job_title}

JOB DESCRIPTION:
{job_description[:2500]}

CANDIDATE RESUME:
{resume_text[:2500]}

Evaluate this candidate fairly, focusing on demonstrated skills and potential,
not just keyword matching (Ferrara et al., 2019).

Respond with ONLY valid JSON, no markdown:
{{
  "match_score": <integer 0-100>,
  "strengths": [<3-5 specific skills or qualities this candidate has that match>],
  "skill_gaps": [<2-4 specific gaps between candidate profile and job requirements>],
  "recommendations": [<2-3 specific actionable suggestions for the candidate>],
  "summary": "<2-3 sentence fair assessment of overall fit>"
}}"""

    try:
        text = await _call_ai(prompt, max_tokens=1024)

        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]

        result = json.loads(text.strip())
        result["ai_powered"] = True
        result["bias_flags"] = bias_flags
        return result

    except Exception as e:
        print(f"Screening AI failed for {candidate_name}, using mock: {e}")
        result = _mock_screen(candidate_name)
        result["bias_flags"] = bias_flags
        result["error"] = str(e)
        return result


async def rank_candidates(results: list[dict]) -> list[dict]:
    """
    Sort candidates by match_score descending and assign rank.
    Ties broken by number of skill gaps (fewer = better rank).
    """
    sorted_results = sorted(
        results,
        key=lambda r: (r.get("match_score", 0), -len(r.get("skill_gaps", []))),
        reverse=True,
    )
    for i, r in enumerate(sorted_results):
        r["rank"] = i + 1
    return sorted_results
