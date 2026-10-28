from typing import Optional, List
from pydantic import BaseModel, Field

class ComplaintDraftState(BaseModel):
    category: Optional[str] = None
    subcategory: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    landmark: Optional[str] = None
    duration: Optional[str] = None
    priority: Optional[str] = "MEDIUM"
    priority_reason: Optional[str] = None
    language: Optional[str] = "English"
    missing_information: List[str] = Field(default_factory=list)
    needs_confirmation: bool = False
    is_ready_to_submit: bool = False

class ChatMessageRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1)
    language: Optional[str] = "auto"  # "auto", "ta", "en", "tanglish"

class ChatMessageResponse(BaseModel):
    session_id: str
    reply: str
    draft: ComplaintDraftState
    detected_language: str
    is_summary_ready: bool = False
    should_read_aloud: bool = True

class ResetChatResponse(BaseModel):
    session_id: str
    message: str
    draft: ComplaintDraftState
