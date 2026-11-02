from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from app.core.database import get_db
from app.models.complaint import Complaint
from app.models.department import Department
from app.models.user import User
from app.schemas.complaint import ComplaintResponse, ComplaintListItem
from app.schemas.officer import OfficerStatusUpdateRequest
from app.services.complaint_service import complaint_service
from app.api.deps import get_current_user

router = APIRouter()

def require_officer_role(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["OFFICER", "DEMO_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden. Only authorized municipal officers can access this dashboard."
        )
    return current_user

@router.get("/grievances", response_model=List[ComplaintListItem])
def list_officer_grievances(
    category: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_officer: User = Depends(require_officer_role)
):
    """Lists complaints for municipal officers with comprehensive filtering."""
    query = db.query(Complaint)

    if category and isinstance(category, str) and category.upper() != "ALL":
        query = query.filter(Complaint.category == category.upper())

    if department_id and isinstance(department_id, int):
        query = query.filter(Complaint.department_id == department_id)

    if status_filter and isinstance(status_filter, str) and status_filter.upper() != "ALL":
        query = query.filter(Complaint.status == status_filter.upper())

    if search and isinstance(search, str):
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Complaint.complaint_id.ilike(search_fmt),
                Complaint.title.ilike(search_fmt),
                Complaint.description.ilike(search_fmt),
                Complaint.location.ilike(search_fmt)
            )
        )

    lim = limit if isinstance(limit, int) else 50
    off = offset if isinstance(offset, int) else 0
    complaints = query.order_by(desc(Complaint.created_at)).offset(off).limit(lim).all()

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

@router.get("/grievances/{complaint_id}", response_model=ComplaintResponse)
def get_officer_complaint_detail(
    complaint_id: str,
    db: Session = Depends(get_db),
    current_officer: User = Depends(require_officer_role)
):
    cleaned = complaint_id.strip()
    complaint = None
    if cleaned.isdigit():
        complaint = db.query(Complaint).filter(Complaint.id == int(cleaned)).first()
    if not complaint:
        complaint = db.query(Complaint).filter(Complaint.complaint_id.ilike(cleaned)).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    return ComplaintResponse.model_validate(complaint)

@router.patch("/grievances/{complaint_id}/status", response_model=ComplaintResponse)
def update_grievance_status(
    complaint_id: str,
    update_req: OfficerStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_officer: User = Depends(require_officer_role)
):
    cleaned = complaint_id.strip()
    complaint = None
    if cleaned.isdigit():
        complaint = db.query(Complaint).filter(Complaint.id == int(cleaned)).first()
    if not complaint:
        complaint = db.query(Complaint).filter(Complaint.complaint_id.ilike(cleaned)).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    officer_name = update_req.assigned_officer or current_officer.full_name or "Municipal Officer"

    effective_notes = (
        update_req.remarks or 
        update_req.resolution_notes or 
        update_req.note or 
        update_req.notes or 
        "Official action recorded by municipal authority."
    )

    updated = complaint_service.update_status(
        db=db,
        complaint=complaint,
        new_status=update_req.status.upper(),
        action_by=f"OFFICER ({officer_name})",
        notes=effective_notes,
        department_id=update_req.department_id,
        assigned_officer=officer_name
    )
    return updated
