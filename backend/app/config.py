from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = ""
    supabase_service_role_key: str = ""
    frontend_url: str = "http://localhost:3000"

    # ── AI feature flag ───────────────────────────────────────────────────────
    # false = mock responses everywhere (default)
    # true  = real Claude API (requires anthropic_api_key)
    ai_enabled: bool = False
    anthropic_api_key: str = ""

    # ── Phase 4 ───────────────────────────────────────────────────────────────
    # Custom email domain — e.g. "getapplyai.com"
    email_domain: str = ""
    # Resend API key for sending email
    resend_api_key: str = ""
    # Secret to verify inbound Cloudflare email webhooks
    email_webhook_secret: str = ""

    # ── Phase 3 ───────────────────────────────────────────────────────────────
    jsearch_api_key: str = ""


settings = Settings()
