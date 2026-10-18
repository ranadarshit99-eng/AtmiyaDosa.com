import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    """
    Application Settings loaded from environment variables and .env
    """
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Server Configuration
    PORT: int = Field(default=5000, description="Port the FastAPI server listens on")
    HOST: str = Field(default="0.0.0.0", description="Host address")
    ENVIRONMENT: str = Field(default="development", description="Environment: development | production")
    APP_NAME: str = "Atmiya Dosa Hub POS Engine"
    API_PREFIX: str = "/api"

    # Security & JWT
    JWT_SECRET: str = Field(default="atmiya_dosa_hub_petlad_secure_jwt_key_2026", description="Secret key for signing JWTs")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 12

    # Webhook HMAC Secret
    PETPOOJA_WEBHOOK_SECRET: str = Field(default="petpooja_hmac_secret_atmiya_petlad_2026", description="HMAC secret for Petpooja webhooks")

    # Supabase Cloud Configuration
    SUPABASE_URL: str = Field(default="https://cwdsurzzcvsrycklkhrz.supabase.co")
    SUPABASE_ANON_KEY: str = Field(default="")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="")
    SUPABASE_DB_URL: str = Field(default="")

    # Razorpay Payment Gateway
    RAZORPAY_KEY_ID: str = Field(default="")
    RAZORPAY_KEY_SECRET: str = Field(default="")

    # CORS Allowed Origins
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:5000"
    )

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

settings = Settings()
