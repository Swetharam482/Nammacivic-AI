import os
import urllib.parse
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BASE_DIR.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "NammaCivic AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nammacivic-super-secret-development-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database: can be configured via DATABASE_URL or POSTGRES_* environment variables
    DATABASE_URL: str = ""
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""
    POSTGRES_PORT: int = 5432

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    # File Uploads
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_FILE_SIZE_MB: int = 5
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "webp", "pdf"]

    # AI Config
    AI_PROVIDER: str = "fallback"  # "fallback", "gemini", "openai"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Geocoding Config (OpenStreetMap Nominatim - Free, No Google Maps API Key or Billing required)
    GEOCODING_PROVIDER: str = "nominatim"
    NOMINATIM_BASE_URL: str = "https://nominatim.openstreetmap.org"
    NOMINATIM_USER_AGENT: str = "NammaCivicAI/1.0 (academic-civic-redressal-prototype; contact: student-demo@nammacivic.local)"
    GEOCODING_COUNTRY_CODE: str = "in"
    GEOCODING_CACHE_TTL_SECONDS: int = 86400
    GEOCODING_TIMEOUT_SECONDS: float = 6.0

    model_config = {
        "env_file": [str(ROOT_DIR / ".env"), str(BASE_DIR / ".env"), ".env"],
        "case_sensitive": True,
        "extra": "ignore"
    }

    def __init__(self, **values):
        super().__init__(**values)
        # Determine database URL resolution order
        if not self.DATABASE_URL:
            env_url = os.getenv("DATABASE_URL")
            if env_url and env_url.strip():
                self.DATABASE_URL = env_url.strip()
            elif self.POSTGRES_DB or os.getenv("POSTGRES_DB"):
                db_name = self.POSTGRES_DB or os.getenv("POSTGRES_DB", "Nammacivic AI")
                user = urllib.parse.quote_plus(self.POSTGRES_USER or os.getenv("POSTGRES_USER", "postgres"))
                pwd = urllib.parse.quote_plus(self.POSTGRES_PASSWORD or os.getenv("POSTGRES_PASSWORD", ""))
                server = self.POSTGRES_SERVER or os.getenv("POSTGRES_SERVER", "localhost")
                port = self.POSTGRES_PORT or os.getenv("POSTGRES_PORT", "5432")
                # Ensure database name is URL-safe (e.g. spaces encoded as %20)
                encoded_db = urllib.parse.quote(db_name)
                self.DATABASE_URL = f"postgresql+psycopg2://{user}:{pwd}@{server}:{port}/{encoded_db}"
            else:
                self.DATABASE_URL = f"sqlite:///{BASE_DIR / 'nammacivic.db'}"

settings = Settings()

# Ensure uploads directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
