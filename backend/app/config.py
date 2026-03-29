from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = ""
    supabase_service_role_key: str = ""
    frontend_url: str = "http://localhost:3000"

    # Feature flags
    use_mock_ai: bool = True

    # Phase 2+ — optional until needed
    anthropic_api_key: str = ""
    jsearch_api_key: str = ""
    resend_api_key: str = ""


settings = Settings()
