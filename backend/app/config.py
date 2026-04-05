from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = ""
    supabase_service_role_key: str = ""
    frontend_url: str = "http://localhost:3000"

    # ── AI feature flag ───────────────────────────────────────────────────────
    # false = mock responses everywhere (default)
    # true  = real AI (Claude API or Ollama depending on use_ollama)
    ai_enabled: bool = False
    anthropic_api_key: str = ""

    # ── Ollama (local AI — free, runs on your PC) ─────────────────────────────
    # Set use_ollama=true to use local Ollama instead of Claude API
    # 1. Install from ollama.com
    # 2. Run: ollama pull llama3.2
    # 3. Set use_ollama=true and ai_enabled=true in .env
    use_ollama: bool = False
    ollama_model: str = "llama3.2"
    ollama_base_url: str = "http://localhost:11434"

    # ── Phase 4 ───────────────────────────────────────────────────────────────
    email_domain: str = ""
    resend_api_key: str = ""
    email_webhook_secret: str = ""

    # ── Phase 3 ───────────────────────────────────────────────────────────────
    jsearch_api_key: str = ""


settings = Settings()