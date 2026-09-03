from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = ""
    zitadel_issuer: str = ""
    zitadel_jwks_uri: str = ""
    zitadel_audience: str = ""
    zitadel_required_role: str = ""

    email_api: str = ""
    api_key: str = ""

    app_secret: str = "dev-only-secret-change-me"
    pengawas_session_minutes: int = 15
    pengawas_max_failed: int = 5
    pengawas_lock_minutes: int = 15
    cors_origins: str = "http://localhost:3000"


settings = Settings()