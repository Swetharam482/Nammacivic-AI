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

# Initialize database schema
Base.metadata.create_all(bind=engine)

def _ensure_schema_columns():
    """Ensure newly introduced geocoding columns exist in SQLite or PostgreSQL."""
    try:
        inspector = inspect(engine)
        if "complaints" in inspector.get_table_names():
            columns = [col["name"] for col in inspector.get_columns("complaints")]
            with engine.begin() as conn:
                if "latitude" not in columns:
                    conn.execute(text("ALTER TABLE complaints ADD COLUMN latitude FLOAT"))
                if "longitude" not in columns:
                    conn.execute(text("ALTER TABLE complaints ADD COLUMN longitude FLOAT"))
                if "geocoded_address" not in columns:
                    conn.execute(text("ALTER TABLE complaints ADD COLUMN geocoded_address VARCHAR(500)"))
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
