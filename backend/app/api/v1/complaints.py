from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status as http_status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func
from app.core.database import get_db
from app.core.config import settings
from app.models.complaint import Complaint
from app.models.evidence import EvidenceFile
from app.models.user import User
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintListItem,
    DuplicateCheckResponse
)
from app.schemas.verification import VerificationSubmitRequest
from app.services.complaint_service import complaint_service
from app.services.duplicate_service import duplicate_service
from app.services.storage_service import save_evidence_file
from app.api.deps import get_current_user_optional, get_current_user

router = APIRouter()

@router.post("", response_model=ComplaintResponse, status_code=http_status.HTTP_201_CREATED)
def submit_complaint(
    complaint_in: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    citizen_id = current_user.id if current_user else None
    citizen_name = complaint_in.citizen_name or (current_user.full_name if current_user else "Citizen")
    citizen_phone = complaint_in.citizen_phone or (current_user.phone_number if current_user else None)

    complaint_in.citizen_name = citizen_name
    complaint_in.citizen_phone = citizen_phone

    complaint = complaint_service.create_complaint(
        db=db,
        complaint_in=complaint_in,
        citizen_id=citizen_id
    )

    return complaint

@router.get("", response_model=List[ComplaintListItem])
def list_complaints(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    my_only: bool = Query(False),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(Complaint)

    if my_only:
        if not current_user:
            raise HTTPException(
                status_code=http_status.HTTP_401_UNAUTHORIZED,
                detail="Must be logged in to view your complaints."
            )
        query = query.filter(Complaint.citizen_id == current_user.id)

    if category and category != "ALL":
        query = query.filter(Complaint.category == category.upper())

    if status and status != "ALL":
        query = query.filter(Complaint.status == status.upper())

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Complaint.complaint_id.ilike(search_fmt),
                Complaint.title.ilike(search_fmt),
                Complaint.description.ilike(search_fmt),
                Complaint.location.ilike(search_fmt)
            )
        )

    complaints = query.order_by(desc(Complaint.created_at)).offset(offset).limit(limit).all()

    items = []
    for c in complaints:
        items.append(ComplaintListItem(
            id=c.id,
            complaint_id=c.complaint_id,
            title=c.title,
            category=c.category,
            priority=c.priority,
            status=c.status,
            location=c.location,
            landmark=c.landmark,
            duration=c.duration,
            created_at=c.created_at,
            updated_at=c.updated_at,
            department_name=c.department.name if c.department else None,
            is_citizen_verified=bool(c.status == "CLOSED" and any(v.is_resolved for v in c.verifications))
        ))
    return items

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: str, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    cleaned = complaint_id.strip()
    complaint = None
    if cleaned.isdigit():
        complaint = db.query(Complaint).filter(Complaint.id == int(cleaned)).first()
    if not complaint:
        # Case-insensitive normalized matching
        complaint = db.query(Complaint).filter(
            func.upper(Complaint.complaint_id) == cleaned.upper()
        ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail=f"Complaint with ID '{cleaned}' was not found in the civic registry."
        )

    # Privacy protection for public tracking references:
    # Only the complaint owner or municipal staff can see unmasked citizen contact info
    is_owner = current_user and current_user.id == complaint.citizen_id
    is_staff = current_user and current_user.role in ["OFFICER", "DEMO_ADMIN"]

    res_dict = ComplaintResponse.model_validate(complaint).model_dump()
    if not is_owner and not is_staff:
        if res_dict.get("citizen_phone"):
            raw_phone = str(res_dict["citizen_phone"]).strip()
            res_dict["citizen_phone"] = ("*" * max(len(raw_phone) - 4, 3)) + raw_phone[-4:] if len(raw_phone) > 4 else "****"
        if res_dict.get("citizen_name"):
            parts = res_dict["citizen_name"].split()
            res_dict["citizen_name"] = parts[0] + " (Citizen)" if parts else "Citizen"

    return ComplaintResponse(**res_dict)

@router.post("/{complaint_id}/evidence")
def upload_complaint_evidence(
    complaint_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    cleaned = complaint_id.strip()
    complaint = db.query(Complaint).filter(
        or_(
            func.upper(Complaint.complaint_id) == cleaned.upper(),
            Complaint.id == (int(cleaned) if cleaned.isdigit() else -1)
        )
    ).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    saved = save_evidence_file(file)

    evidence = EvidenceFile(
        complaint_id=complaint.id,
        file_name=saved["file_name"],
        original_name=saved["original_name"],
        file_path=saved["file_path"],
        file_url=saved["file_url"],
        file_size=saved["file_size"],
        content_type=saved["content_type"]
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    return {
        "message": "Evidence file uploaded successfully",
        "file_url": saved["file_url"],
        "file_name": saved["file_name"]
    }

@router.get("/evidence-files/{filename}")
def serve_evidence_file(filename: str):
    file_path = settings.UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@router.post("/{complaint_id}/verify-resolution", response_model=ComplaintResponse)
def citizen_verify_resolution(
    complaint_id: str,
    verify_req: VerificationSubmitRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    cleaned = complaint_id.strip()
    complaint = db.query(Complaint).filter(
        or_(
            func.upper(Complaint.complaint_id) == cleaned.upper(),
            Complaint.id == (int(cleaned) if cleaned.isdigit() else -1)
        )
    ).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # If complaint is linked to a registered citizen, protect verification
    if complaint.citizen_id:
        if not current_user:
            raise HTTPException(
                status_code=http_status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required. Please log in as the reporting citizen to verify resolution."
            )
        if current_user.id != complaint.citizen_id and current_user.role not in ["OFFICER", "DEMO_ADMIN"]:
            raise HTTPException(
                status_code=http_status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to verify or alter the status of complaints filed by another citizen."
            )

    updated = complaint_service.verify_resolution(
        db=db,
        complaint=complaint,
        is_resolved=verify_req.is_resolved,
        feedback=verify_req.citizen_feedback,
        reopen_reason=verify_req.reopen_reason,
        evidence_url=verify_req.verification_evidence_url
    )
    return updated

@router.post("/check-duplicates", response_model=DuplicateCheckResponse)
def check_duplicates_endpoint(
    category: str = Query(...),
    description: str = Query(...),
    location: str = Query(...),
    landmark: Optional[str] = Query(""),
    db: Session = Depends(get_db)
):
    result = duplicate_service.check_for_duplicates(
        db=db,
        category=category,
        description=description,
        location=location,
        landmark=landmark or ""
    )
    return DuplicateCheckResponse(**result)
