import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.core.config import settings

def save_evidence_file(file: UploadFile) -> dict:
    """Validates and saves uploaded evidence file locally."""
    # Check extension
    filename = file.filename or "evidence.jpg"
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File extension '{ext}' not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Generate unique stored filename
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    file_path = settings.UPLOAD_DIR / unique_filename

    # Save to disk
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Check size
    file_size = file_path.stat().st_size
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB"
        )

    file_url = f"/api/v1/grievances/evidence-files/{unique_filename}"
    return {
        "file_name": unique_filename,
        "original_name": filename,
        "file_path": str(file_path),
        "file_url": file_url,
        "file_size": file_size,
        "content_type": file.content_type or "application/octet-stream"
    }
