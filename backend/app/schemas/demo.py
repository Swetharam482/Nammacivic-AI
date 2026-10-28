from typing import Optional
from pydantic import BaseModel, Field

class DemoStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="Target status: ASSIGNED, IN_PROGRESS, RESOLUTION_PENDING_VERIFICATION, CLOSED, REOPENED")
    department_id: Optional[int] = None
    assigned_officer: Optional[str] = None
    resolution_notes: Optional[str] = None
    note: Optional[str] = "Simulated demo authority update"
