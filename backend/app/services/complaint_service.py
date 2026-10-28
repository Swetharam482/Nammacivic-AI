import random
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.complaint import Complaint
from app.models.department import Department
from app.models.history import ComplaintStatusHistory
from app.models.verification import ResolutionVerification
from app.models.evidence import EvidenceFile
from app.schemas.complaint import ComplaintCreate
from app.services.duplicate_service import duplicate_service
from app.ai.rule_fallback import assess_priority

CATEGORY_DEPARTMENT_CODES = {
    "STREETLIGHT": "ELEC",
    "GARBAGE": "SWM",
    "SANITATION": "SWM",
    "WATER": "CMWSSB",
    "DRAINAGE": "CMWSSB",
    "ROAD": "ROADS",
    "PUBLIC_PROPERTY": "GEN",
    "ENVIRONMENT": "GEN",
    "ANIMAL": "VET",
    "OTHER": "GEN"
}

def generate_complaint_id(db: Session) -> str:
    """
    Generates a unique, persistent public tracking reference like NC-2026-10001.
    Starts at 10001 for the current calendar year and sequentially assigns next available ID,
    handling any race-condition or duplicate collision reliably.
    """
    year = datetime.now(timezone.utc).year
    prefix = f"NC-{year}-"
    
    # Query all existing complaint IDs with this year's prefix
    existing_cids = db.query(Complaint.complaint_id).filter(
        Complaint.complaint_id.like(f"{prefix}%")
    ).all()
    
    used_numbers = set()
    for (cid,) in existing_cids:
        if cid and cid.startswith(prefix):
            suffix = cid[len(prefix):]
            if suffix.isdigit():
                used_numbers.add(int(suffix))
                
    # Next sequential number starting at 10001
    candidate_num = 10001
    while candidate_num in used_numbers:
        candidate_num += 1
        
    return f"{prefix}{candidate_num:05d}"

class ComplaintService:
    @staticmethod
    def create_complaint(
        db: Session,
        complaint_in: ComplaintCreate,
        citizen_id: Optional[int] = None
    ) -> Complaint:
        # Check for duplicates
        dup_check = duplicate_service.check_for_duplicates(
            db=db,
            category=complaint_in.category,
            description=complaint_in.description,
            location=complaint_in.location,
            landmark=complaint_in.landmark or ""
        )

        is_dup = dup_check["is_duplicate_likely"]
        related_id = dup_check["matches"][0]["complaint_id"] if is_dup else None

        # Title auto-formatting
        title = complaint_in.title
        if not title:
            title = f"{complaint_in.category.capitalize()} issue reported at {complaint_in.location}"

        # Priority calculation
        priority = complaint_in.priority
        priority_reason = complaint_in.priority_reason
        if not priority or priority == "MEDIUM":
            calc_priority, calc_reason = assess_priority(complaint_in.category, complaint_in.description)
            priority = calc_priority
            priority_reason = calc_reason

        # Find matching department
        dept_code = CATEGORY_DEPARTMENT_CODES.get(complaint_in.category.upper(), "GEN")
        dept = db.query(Department).filter(Department.code == dept_code).first()

        max_retries = 5
        for attempt in range(max_retries):
            tracking_id = generate_complaint_id(db)
            try:
                complaint = Complaint(
                    complaint_id=tracking_id,
                    title=title[:200],
                    description=complaint_in.description,
                    category=complaint_in.category.upper(),
                    subcategory=complaint_in.subcategory,
                    priority=priority,
                    priority_reason=priority_reason,
                    classification_method="RULE_BASED",
                    classification_confidence=0.95,
                    status="SUBMITTED",
                    location=complaint_in.location,
                    landmark=complaint_in.landmark,
                    pincode=complaint_in.pincode,
                    duration=complaint_in.duration,
                    language=complaint_in.language or "English",
                    citizen_id=citizen_id,
                    citizen_name=complaint_in.citizen_name,
                    citizen_phone=complaint_in.citizen_phone,
                    department_id=dept.id if dept else None,
                    is_duplicate_flag=is_dup,
                    related_complaint_id=related_id,
                    latitude=complaint_in.latitude,
                    longitude=complaint_in.longitude,
                    geocoded_address=complaint_in.geocoded_address
                )
                db.add(complaint)
                db.flush()

                # Add initial status history record
                history = ComplaintStatusHistory(
                    complaint_id=complaint.id,
                    from_status=None,
                    to_status="SUBMITTED",
                    action_by="CITIZEN",
                    notes="Grievance officially submitted and logged in the civic registry."
                )
                db.add(history)
                db.commit()
                db.refresh(complaint)
                return complaint
            except Exception:
                db.rollback()
                if attempt == max_retries - 1:
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to assign a unique complaint reference. Please retry submission."
                    )

        raise HTTPException(
            status_code=500,
            detail="Failed to assign a unique complaint reference. Please retry submission."
        )

    @staticmethod
    def update_status(
        db: Session,
        complaint: Complaint,
        new_status: str,
        action_by: str,
        notes: Optional[str] = None,
        department_id: Optional[int] = None,
        assigned_officer: Optional[str] = None
    ) -> Complaint:
        old_status = complaint.status

        # Validate lifecycle transitions
        allowed = {
            "SUBMITTED": ["ASSIGNED", "IN_PROGRESS", "RESOLUTION_PENDING_VERIFICATION"],
            "ASSIGNED": ["IN_PROGRESS", "RESOLUTION_PENDING_VERIFICATION"],
            "IN_PROGRESS": ["RESOLUTION_PENDING_VERIFICATION"],
            "RESOLUTION_PENDING_VERIFICATION": ["CLOSED", "REOPENED"],
            "REOPENED": ["IN_PROGRESS", "RESOLUTION_PENDING_VERIFICATION"],
            "CLOSED": ["REOPENED"]
        }

        if new_status not in allowed.get(old_status, []):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status transition from '{old_status}' to '{new_status}'. Allowed: {allowed.get(old_status, [])}"
            )

        complaint.status = new_status
        if department_id:
            complaint.department_id = department_id
        if assigned_officer:
            complaint.assigned_officer = assigned_officer
        if notes and new_status == "RESOLUTION_PENDING_VERIFICATION":
            complaint.resolution_notes = notes
            complaint.resolution_date = datetime.now(timezone.utc)

        history = ComplaintStatusHistory(
            complaint_id=complaint.id,
            from_status=old_status,
            to_status=new_status,
            action_by=action_by,
            notes=notes
        )
        db.add(history)
        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def verify_resolution(
        db: Session,
        complaint: Complaint,
        is_resolved: bool,
        feedback: Optional[str] = None,
        reopen_reason: Optional[str] = None,
        evidence_url: Optional[str] = None
    ) -> Complaint:
        if complaint.status != "RESOLUTION_PENDING_VERIFICATION":
            raise HTTPException(
                status_code=400,
                detail=f"Verification can only be submitted when status is RESOLUTION_PENDING_VERIFICATION (current: {complaint.status})"
            )

        # Save verification record
        verification = ResolutionVerification(
            complaint_id=complaint.id,
            is_resolved=is_resolved,
            citizen_feedback=feedback,
            reopen_reason=reopen_reason,
            verification_evidence_url=evidence_url
        )
        db.add(verification)

        old_status = complaint.status
        if is_resolved:
            new_status = "CLOSED"
            note = f"Citizen verified resolution as satisfactory. Feedback: {feedback or 'None'}"
        else:
            new_status = "REOPENED"
            note = f"Citizen reported issue remains unresolved. Reason: {reopen_reason or 'Issue still persists'}"

        complaint.status = new_status
        history = ComplaintStatusHistory(
            complaint_id=complaint.id,
            from_status=old_status,
            to_status=new_status,
            action_by="CITIZEN",
            notes=note
        )
        db.add(history)
        db.commit()
        db.refresh(complaint)
        return complaint

complaint_service = ComplaintService()
