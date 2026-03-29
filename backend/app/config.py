from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = ""
    supabase_service_role_key: str = ""
    frontend_url: str = "http://localhost:3000"

    # ── AI toggle ────────────────────────────────────────────────────────────
    # Set AI_ENABLED=true in your .env (or Render/Railway env vars) to use
    # the real Claude API. Everything else stays the same.
    ai_enabled: bool = False

    # Required when ai_enabled=true
    anthropic_api_key: str = ""

    # Phase 3 — JSearch (RapidAPI)
    jsearch_api_key: str = ""

    # Phase 4+ — optional
    resend_api_key: str = ""


settings = Settings()
