"""
Email service — sending and receiving.

Sending:  Resend API (resend.com)
Receiving: Cloudflare Email Routing → webhook → this service

AI_ENABLED=false → mock auto-replies
AI_ENABLED=true  → Claude API generates contextual replies
"""

import random
import string
from app.config import settings


# ── Address generation ────────────────────────────────────────────────────────

def generate_custom_email(first_name: str) -> str:
    """
    Generate a unique email address for a user.
    Pattern: firstname + 4 random digits @ domain
    e.g. jane4821@getapplyai.com
    """
    if not settings.email_domain:
        return ""

    clean_name = "".join(c.lower() for c in first_name if c.isalpha())[:12] or "user"
    suffix = "".join(random.choices(string.digits, k=4))
    return f"{clean_name}{suffix}@{settings.email_domain}"


# ── Email sending via Resend ──────────────────────────────────────────────────

async def send_email(
    from_address: str,
    to_address: str,
    subject: str,
    body: str,
) -> dict:
    """Send an email via Resend API."""
    if not settings.resend_api_key:
        print(f"[MOCK SEND] To: {to_address} | Subject: {subject}")
        return {"id": "mock-email-id", "mock": True}

    import httpx

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.resend_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": from_address,
                "to": [to_address],
                "subject": subject,
                "text": body,
            },
            timeout=10.0,
        )
        resp.raise_for_status()
        return resp.json()


# ── AI auto-reply ─────────────────────────────────────────────────────────────

async def generate_auto_reply(
    inbound_subject: str,
    inbound_body: str,
    sender_email: str,
    user_name: str,
    job_title: str = "",
    company: str = "",
) -> str:
    """
    Generate a reply to an inbound recruiter email.
    Controlled by AI_ENABLED flag — same pattern as match scoring.
    """
    if settings.ai_enabled:
        return await _real_auto_reply(
            inbound_subject, inbound_body, sender_email,
            user_name, job_title, company
        )
    return _mock_auto_reply(user_name, inbound_subject, job_title, company)


def _mock_auto_reply(
    user_name: str,
    subject: str,
    job_title: str,
    company: str,
) -> str:
    first_name = user_name.split()[0] if user_name else "there"
    role_line = f" regarding the {job_title} role at {company}" if job_title and company else ""

    return (
        f"Hi,\n\n"
        f"Thank you for reaching out{role_line}. "
        f"I appreciate you taking the time to get in touch and I am very interested in learning more.\n\n"
        f"I would love to schedule a call to discuss this opportunity further. "
        f"Please let me know your availability and I will make myself available.\n\n"
        f"Looking forward to connecting.\n\n"
        f"Best regards,\n{first_name}"
    )


async def _real_auto_reply(
    subject: str,
    body: str,
    sender: str,
    user_name: str,
    job_title: str,
    company: str,
) -> str:
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

        prompt = f"""You are helping {user_name} respond to a recruiter email.

INBOUND EMAIL
From: {sender}
Subject: {subject}
Body:
{body[:2000]}

CONTEXT
Job title: {job_title or "unknown"}
Company: {company or "unknown"}
Candidate name: {user_name}

Write a professional, warm, and concise reply on behalf of {user_name}.
- Express genuine interest
- Ask for next steps or a call if appropriate
- Keep it under 150 words
- Do not use generic filler phrases
- Sign off with just the first name

Reply only with the email body text, no subject line."""

        message = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text.strip()

    except Exception as e:
        print(f"Real AI reply failed, using mock: {e}")
        return _mock_auto_reply(user_name, subject, job_title, company)
