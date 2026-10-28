from typing import Optional
from pydantic import BaseModel, Field

class VerificationSubmitRequest(BaseModel):
    is_resolved: bool  # True if citizen agrees fixed, False if issue remains
    citizen_feedback: Optional[str] = None
    reopen_reason: Optional[str] = None
    verification_evidence_url: Optional[str] = None
