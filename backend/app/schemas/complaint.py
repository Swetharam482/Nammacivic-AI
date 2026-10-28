from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class StatusHistoryResponse(BaseModel):
    id: int
    from_status: Optional[str]
    to_status: str
    action_by: str
    notes: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EvidenceResponse(BaseModel):
    id: int
    file_name: str
    original_name: str
    file_url: str
    file_size: int
    content_type: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResolutionVerificationResponse(BaseModel):
    id: int
    is_resolved: bool
    citizen_feedback: Optional[str]
    reopen_reason: Optional[str]
    verification_evidence_url: Optional[str]
    verified_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DepartmentResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str]
    helpline: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class ComplaintCreate(BaseModel):
    title: Optional[str] = None
    description: str = Field(..., min_length=5)
    category: str = Field(..., min_length=2)
    subcategory: Optional[str] = None
    priority: Optional[str] = "MEDIUM"
    priority_reason: Optional[str] = None
    location: str = Field(..., min_length=2)
    landmark: Optional[str] = None
    pincode: Optional[str] = None
    duration: Optional[str] = None
    citizen_name: Optional[str] = None
    citizen_phone: Optional[str] = None
    language: Optional[str] = "English"
    evidence_urls: Optional[List[str]] = Field(default_factory=list)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geocoded_address: Optional[str] = None

class ComplaintListItem(BaseModel):
    id: int
    complaint_id: str
    title: str
    category: str
    priority: str
    status: str
    location: str
    landmark: Optional[str]
    duration: Optional[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    department_name: Optional[str] = None
    is_citizen_verified: bool = False

    model_config = ConfigDict(from_attributes=True)

class ComplaintResponse(BaseModel):
    id: int
    complaint_id: str
    title: str
    description: str
    category: str
    subcategory: Optional[str]
    priority: str
    priority_reason: Optional[str]
    classification_method: str
    classification_confidence: float
    status: str
    location: str
    landmark: Optional[str]
    pincode: Optional[str]
    ward_or_zone: Optional[str]
    duration: Optional[str]
    language: str
    citizen_id: Optional[int]
    citizen_name: Optional[str]
    citizen_phone: Optional[str]
    department_id: Optional[int]
    department: Optional[DepartmentResponse] = None
    assigned_officer: Optional[str]
    resolution_notes: Optional[str]
    resolution_date: Optional[datetime]
    is_duplicate_flag: bool
    related_complaint_id: Optional[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geocoded_address: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    status_history: List[StatusHistoryResponse] = Field(default_factory=list)
    evidence_files: List[EvidenceResponse] = Field(default_factory=list)
    verifications: List[ResolutionVerificationResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

class DuplicateMatch(BaseModel):
    complaint_id: str
    title: str
    category: str
    location: str
    similarity_score: float
    created_at: datetime

class DuplicateCheckResponse(BaseModel):
    is_duplicate_likely: bool
    highest_score: float
    matches: List[DuplicateMatch] = Field(default_factory=list)
    message: str
