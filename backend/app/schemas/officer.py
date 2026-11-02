from typing import Optional
from pydantic import BaseModel, Field

class OfficerStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="Target lifecycle status")
    department_id: Optional[int] = None
    assigned_officer: Optional[str] = None
    remarks: Optional[str] = Field(None, description="Official status remarks or resolution notes")
    note: Optional[str] = None
    notes: Optional[str] = None
    resolution_notes: Optional[str] = None

    model_config = {"extra": "ignore"}
