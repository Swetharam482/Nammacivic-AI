from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.complaint import Complaint
from app.models.department import Department
from app.schemas.complaint import ComplaintResponse, ComplaintListItem
from app.schemas.demo import DemoStatusUpdateRequest
from app.services.complaint_service import complaint_service

from app.models.user import User
from app.api.deps import get_current_user_optional

router = APIRouter()

def require_demo_authority_access(
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # If authenticated as a CITIZEN, forbid access
    if current_user and current_user.role == "CITIZEN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Citizens are not authorized to perform administrative or demonstration authority actions. Access is restricted to municipal officers and evaluators."
        )
    return current_user

@router.get("/complaints", response_model=List[ComplaintListItem])
def list_demo_complaints(
    db: Session = Depends(get_db),
    _auth = Depends(require_demo_authority_access)
):
    """Returns all complaints for demo authority administration."""
    complaints = db.query(Complaint).order_by(desc(Complaint.created_at)).all()
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

@router.post("/complaints/{complaint_id}/status", response_model=ComplaintResponse)
def demo_update_complaint_status(
    complaint_id: str,
    update_req: DemoStatusUpdateRequest,
    db: Session = Depends(get_db),
    _auth = Depends(require_demo_authority_access)
):
    """
    Simulated civic authority action to advance status:
    ASSIGNED -> IN_PROGRESS -> RESOLUTION_PENDING_VERIFICATION (with resolution proof notes).
    """
    cleaned = complaint_id.strip()
    complaint = None
    if cleaned.isdigit():
        complaint = db.query(Complaint).filter(Complaint.id == int(cleaned)).first()
    if not complaint:
        complaint = db.query(Complaint).filter(
            Complaint.complaint_id.ilike(cleaned)
        ).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    officer_name = update_req.assigned_officer or "Simulated GCC Field Engineer (Demo)"

    updated = complaint_service.update_status(
        db=db,
        complaint=complaint,
        new_status=update_req.status,
        action_by=f"DEMO_AUTHORITY ({officer_name})",
        notes=update_req.resolution_notes or update_req.note,
        department_id=update_req.department_id,
        assigned_officer=officer_name
    )
    return updated

