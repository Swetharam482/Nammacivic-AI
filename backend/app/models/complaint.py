from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import Integer, String, DateTime, Text, Boolean, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.department import Department
    from app.models.evidence import EvidenceFile
    from app.models.history import ComplaintStatusHistory
    from app.models.verification import ResolutionVerification

class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    complaint_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # ROAD, STREETLIGHT, etc.
    subcategory: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    priority: Mapped[str] = mapped_column(String(20), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    priority_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    classification_method: Mapped[str] = mapped_column(String(50), default="RULE_BASED")
    classification_confidence: Mapped[float] = mapped_column(Float, default=1.0)

    # Status: SUBMITTED -> ASSIGNED -> IN_PROGRESS -> RESOLUTION_PENDING_VERIFICATION -> CLOSED / REOPENED
    status: Mapped[str] = mapped_column(String(50), default="SUBMITTED", index=True, nullable=False)

    location: Mapped[str] = mapped_column(String(255), nullable=False)
    landmark: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    ward_or_zone: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    duration: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    language: Mapped[str] = mapped_column(String(50), default="English")

    # Geocoding data from OpenStreetMap Nominatim
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    geocoded_address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Citizen relation (optional if guest or registered)
    citizen_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    citizen_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    citizen_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Civic Department assignment
    department_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_officer: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Resolution fields
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolution_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Duplicate detection flag
    is_duplicate_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    related_complaint_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    citizen: Mapped[Optional[User]] = relationship("User", back_populates="complaints")
    department: Mapped[Optional[Department]] = relationship("Department", back_populates="complaints")
    evidence_files: Mapped[List[EvidenceFile]] = relationship("EvidenceFile", back_populates="complaint", cascade="all, delete-orphan")
    status_history: Mapped[List[ComplaintStatusHistory]] = relationship("ComplaintStatusHistory", back_populates="complaint", cascade="all, delete-orphan", order_by="ComplaintStatusHistory.created_at.asc()")
    verifications: Mapped[List[ResolutionVerification]] = relationship("ResolutionVerification", back_populates="complaint", cascade="all, delete-orphan", order_by="ResolutionVerification.verified_at.asc()")
