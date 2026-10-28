from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.complaint import Complaint

class ResolutionVerification(Base):
    __tablename__ = "resolution_verifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    complaint_id: Mapped[int] = mapped_column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    is_resolved: Mapped[bool] = mapped_column(Boolean, nullable=False)  # True = Citizen confirmed resolved, False = Issue remains
    citizen_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reopen_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verification_evidence_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    verified_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    complaint: Mapped[Complaint] = relationship("Complaint", back_populates="verifications")
