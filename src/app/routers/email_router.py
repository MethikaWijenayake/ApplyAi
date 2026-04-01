"""
Email routes:
  POST /email/inbound  — Cloudflare Email Routing webhook
  POST /email/assign   — Assign custom email to a user on signup
"""

import hashlib
import hmac
import json
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request
from pydantic import BaseModel
from supabase import create_client

from app.config import settings
from app.services.email_service import generate_custom_email, send_email, generate_auto_reply

router = APIRouter(prefix="/email", tags=["email"])


def get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


# ── Assign custom email ───────────────────────────────────────────────────────

class AssignEmailRequest(BaseModel):
    user_id: str
    full_name: str


@router.post("/assign")
async def assign_email(body: AssignEmailRequest):
    """
    Called after signup to assign a custom email address.
    Idempotent — won't overwrite if one already exists.
    """
    if not settings.email_domain:
        return {"custom_email": None, "message": "EMAIL_DOMAIN not configured"}

    supabase = get_supabase()

    # Check if already assigned
    existing = supabase.table("users").select("custom_email").eq("id", body.user_id).single().execute()
    if existing.data and existing.data.get("custom_email"):
        return {"custom_email": existing.data["custom_email"]}

    first_name = body.full_name.split()[0] if body.full_name else "user"
    custom_email = generate_custom_email(first_name)

    # Make sure it's unique
    for _ in range(5):
        check = supabase.table("users").select("id").eq("custom_email", custom_email).execute()
        if not check.data:
            break
        custom_email = generate_custom_email(first_name)

    supabase.table("users").update({"custom_email": custom_email}).eq("id", body.user_id).execute()

    return {"custom_email": custom_email}


# ── Inbound email webhook ─────────────────────────────────────────────────────

@router.post("/inbound")
async def inbound_email(request: Request, background_tasks: BackgroundTasks):
    """
    Receives inbound email webhooks from Cloudflare Email Routing.
    Cloudflare sends a POST with JSON containing the parsed email.

    Webhook payload shape (Cloudflare Email Workers format):
    {
      "from": "recruiter@company.com",
      "to": "jane4821@getapplyai.com",
      "subject": "Re: Software Engineer application",
      "text": "Hi Jane, thanks for applying...",
      "html": "...",
      "headers": {...}
    }
    """
    # Verify webhook secret if configured
    if settings.email_webhook_secret:
        signature = request.headers.get("X-Webhook-Secret", "")
        if not hmac.compare_digest(signature, settings.email_webhook_secret):
            raise HTTPException(status_code=401, detail="Invalid webhook secret")

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    from_email = payload.get("from", "")
    to_email = payload.get("to", "")
    subject = payload.get("subject", "(no subject)")
    body = payload.get("text", payload.get("body", ""))

    if not to_email:
        raise HTTPException(status_code=400, detail="Missing 'to' field")

    # Process in background so webhook returns fast
    background_tasks.add_task(
        _process_inbound_email, from_email, to_email, subject, body
    )

    return {"status": "received"}


async def _process_inbound_email(
    from_email: str, to_email: str, subject: str, body: str
):
    """Background task: save email and send auto-reply."""
    supabase = get_supabase()

    # Find user by custom email
    user_result = supabase.table("users").select("id, full_name, email").eq("custom_email", to_email).execute()

    if not user_result.data:
        print(f"[EMAIL] No user found for address: {to_email}")
        return

    user = user_result.data[0]
    user_id = user["id"]
    user_name = user.get("full_name", "")

    # Try to find related job application by matching subject keywords
    job_app = None
    apps_result = supabase.table("job_applications").select("id, job_title, company").eq("user_id", user_id).order("applied_at", desc=True).limit(10).execute()

    if apps_result.data:
        subject_lower = subject.lower()
        for app in apps_result.data:
            title = (app.get("job_title") or "").lower()
            company = (app.get("company") or "").lower()
            if title and title in subject_lower or company and company in subject_lower:
                job_app = app
                break
        if not job_app:
            job_app = apps_result.data[0]  # fallback to most recent

    job_app_id = job_app["id"] if job_app else None
    job_title = job_app["job_title"] if job_app else ""
    company = job_app["company"] if job_app else ""

    # Save to email_threads
    supabase.table("email_threads").insert({
        "user_id": user_id,
        "job_application_id": job_app_id,
        "from_email": from_email,
        "subject": subject,
        "body": body,
        "direction": "inbound",
    }).execute()

    # Update last_reply_at on the application
    if job_app_id:
        supabase.table("job_applications").update({
            "last_reply_at": "now()",
            "status": "viewed",
        }).eq("id", job_app_id).execute()

    # Generate and send auto-reply
    reply_body = await generate_auto_reply(
        inbound_subject=subject,
        inbound_body=body,
        sender_email=from_email,
        user_name=user_name,
        job_title=job_title,
        company=company,
    )

    reply_subject = subject if subject.startswith("Re:") else f"Re: {subject}"

    send_result = await send_email(
        from_address=to_email,  # reply from the user's custom address
        to_address=from_email,
        subject=reply_subject,
        body=reply_body,
    )

    # Save outbound reply to email_threads
    supabase.table("email_threads").insert({
        "user_id": user_id,
        "job_application_id": job_app_id,
        "from_email": to_email,
        "subject": reply_subject,
        "body": reply_body,
        "direction": "outbound",
    }).execute()

    print(f"[EMAIL] Processed inbound from {from_email} → replied to {from_email}")
