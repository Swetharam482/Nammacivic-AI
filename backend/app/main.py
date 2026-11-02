from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from app.core.config import settings
from app.core.database import engine, Base, get_db, check_db_connection
import app.models  # ensure all models are registered with Base

from app.api.v1.auth import router as auth_router
from app.api.v1.chat import router as chat_router
from app.api.v1.complaints import router as complaints_router
from app.api.v1.departments import router as departments_router
from app.api.v1.demo import router as demo_router
from app.api.v1.geocoding import router as geocoding_router
from app.api.v1.address import router as address_router
from app.api.v1.officer import router as officer_router

# Initialize database schema safely
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    import logging
    logging.getLogger(__name__).warning("Database initialization deferred: %s", e)

def _ensure_schema_columns():
    """Ensure newly introduced columns exist in SQLite or PostgreSQL."""
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        with engine.begin() as conn:
            if "complaints" in tables:
                columns = [col["name"] for col in inspector.get_columns("complaints")]
                if "latitude" not in columns:
                    conn.execute(text("ALTER TABLE complaints ADD COLUMN latitude FLOAT"))
                if "longitude" not in columns:
                    conn.execute(text("ALTER TABLE complaints ADD COLUMN longitude FLOAT"))
                if "geocoded_address" not in columns:
                    conn.execute(text("ALTER TABLE complaints ADD COLUMN geocoded_address VARCHAR(500)"))
                if "address_verification_status" not in columns:
                    conn.execute(text("ALTER TABLE complaints ADD COLUMN address_verification_status VARCHAR(50) DEFAULT 'UNVERIFIED'"))
            if "conversation_sessions" in tables:
                conv_columns = [col["name"] for col in inspector.get_columns("conversation_sessions")]
                if "user_id" not in conv_columns:
                    conn.execute(text("ALTER TABLE conversation_sessions ADD COLUMN user_id INTEGER"))
    except Exception:
        pass

_ensure_schema_columns()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Multilingual Voice Chatbot for Local Body Grievance Redressal (College Prototype)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 Routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}/chat", tags=["AI Conversational Assistant"])
app.include_router(complaints_router, prefix=f"{settings.API_V1_STR}/grievances", tags=["Complaints & Tracking"])
app.include_router(departments_router, prefix=f"{settings.API_V1_STR}/departments", tags=["Civic Departments"])
app.include_router(demo_router, prefix=f"{settings.API_V1_STR}/demo", tags=["Demo Authority Workflow"])
app.include_router(geocoding_router, prefix=f"{settings.API_V1_STR}/geocoding", tags=["Geocoding & Location Verification"])
app.include_router(address_router, prefix=f"{settings.API_V1_STR}/address", tags=["Address Verification"])
app.include_router(officer_router, prefix=f"{settings.API_V1_STR}/officer", tags=["Officer Grievance Management"])

@app.get("/api/v1/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    db_info = check_db_connection()
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "database": db_info.get("status", "healthy"),
        "database_dialect": db_info.get("dialect", "unknown"),
        "database_driver": db_info.get("url_driver", "unknown"),
        "version": "1.0.0",
        "prototype_disclaimer": "This is a simulated college prototype for civic grievance management."
    }

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "active",
        "docs": "/docs",
        "health": "/api/v1/health"
    }
