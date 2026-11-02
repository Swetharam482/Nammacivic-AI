import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.conversation import ConversationSession, ConversationMessage
from app.models.complaint import Complaint
from app.models.user import User
from app.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    ComplaintDraftState,
    ResetChatResponse,
    ChatConfirmSubmissionRequest
)
from app.schemas.complaint import ComplaintCreate, ComplaintResponse
from app.services.complaint_service import complaint_service
from app.ai.engine import ai_engine
from app.api.deps import get_current_user, get_current_user_optional

router = APIRouter()

def _process_message(
    req: ChatMessageRequest,
    db: Session,
    current_user: Optional[User] = None
) -> ChatMessageResponse:
    session_id = req.session_id
    session = None
    if session_id:
        session = db.query(ConversationSession).filter(ConversationSession.session_id == session_id).first()

    if not session:
        session_id = str(uuid.uuid4())
        session = ConversationSession(
            session_id=session_id,
            user_id=current_user.id if current_user else None,
            language=req.language or "auto",
            state_json="{}"
        )
        db.add(session)
        db.commit()
        db.refresh(session)
    elif current_user and not session.user_id:
        session.user_id = current_user.id
        db.commit()

    # Record citizen message
    user_msg = ConversationMessage(
        session_id=session.session_id,
        sender="user",
        message_text=req.message
    )
    db.add(user_msg)

    # Process through AI engine (grounded in attached dataset)
    current_state = session.get_state()
    ai_result = ai_engine.process_chat(
        message=req.message,
        current_state=current_state,
        language_preference=req.language or "auto"
    )

    updated_draft = ai_result["draft"]
    reply_text = ai_result["reply"]

    # Save assistant message
    asst_msg = ConversationMessage(
        session_id=session.session_id,
        sender="assistant",
        message_text=reply_text
    )
    db.add(asst_msg)

    # Save session state
    session.set_state(updated_draft)
    session.language = ai_result["detected_language"]
    db.commit()

    return ChatMessageResponse(
        session_id=session.session_id,
        reply=reply_text,
        draft=ComplaintDraftState(**updated_draft),
        detected_language=ai_result["detected_language"],
        is_summary_ready=updated_draft.get("needs_confirmation", False),
        should_read_aloud=True
    )

@router.post("", response_model=ChatMessageResponse)
def handle_chat_message(
    req: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    return _process_message(req, db, current_user)

@router.post("/message", response_model=ChatMessageResponse)
def handle_chat_message_alias(
    req: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    return _process_message(req, db, current_user)

@router.get("/session/{session_id}")
def get_chat_session_by_id(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ConversationSession).filter(ConversationSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Conversation session not found")

    messages = [
        {"sender": m.sender, "text": m.message_text, "created_at": m.created_at}
        for m in session.messages
    ]
    return {
        "session_id": session.session_id,
        "user_id": session.user_id,
        "language": session.language,
        "draft": session.get_state(),
        "final_complaint_id": session.final_complaint_id,
        "messages": messages
    }

@router.post("/confirm-submission", response_model=ComplaintResponse)
def confirm_chatbot_submission(
    req: ChatConfirmSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Finalizes and commits a citizen grievance through the verified chatbot workflow.
    Validates authentication, session state, required fields, and generates unique complaint ID.
    """
    session = db.query(ConversationSession).filter(ConversationSession.session_id == req.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Conversation session not found")

    if session.final_complaint_id:
        # Prevent duplicate submissions from the same session
        existing = db.query(Complaint).filter(Complaint.complaint_id == session.final_complaint_id).first()
        if existing:
            return existing

    draft = session.get_state()
    category = draft.get("category")
    description = draft.get("description")
    location = draft.get("location") or draft.get("landmark")

    if not category or not description or not location:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incomplete grievance details. Please provide category, description, and location through the assistant before confirming."
        )

    # Build ComplaintCreate input
    title = f"{category.replace('_', ' ').title()} Issue at {location}"
    complaint_in = ComplaintCreate(
        title=title[:200],
        description=description,
        category=category,
        subcategory=draft.get("subcategory"),
        priority=draft.get("priority", "MEDIUM"),
        priority_reason=draft.get("priority_reason"),
        location=location,
        landmark=draft.get("landmark"),
        duration=draft.get("duration"),
        citizen_name=current_user.full_name,
        citizen_phone=current_user.phone_number,
        language=draft.get("language") or session.language or "English",
        latitude=req.latitude or draft.get("latitude"),
        longitude=req.longitude or draft.get("longitude"),
        geocoded_address=req.geocoded_address or draft.get("geocoded_address")
    )

    complaint = complaint_service.create_complaint(
        db=db,
        complaint_in=complaint_in,
        citizen_id=current_user.id
    )

    if req.address_verification_status:
        complaint.address_verification_status = req.address_verification_status
        db.commit()

    # Link session to created complaint
    session.final_complaint_id = complaint.complaint_id
    session.user_id = current_user.id
    db.commit()
    db.refresh(complaint)

    return complaint

@router.post("/{session_id}/reset", response_model=ResetChatResponse)
def reset_chat_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ConversationSession).filter(ConversationSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Conversation session not found")

    session.set_state({})
    session.final_complaint_id = None
    db.commit()

    return ResetChatResponse(
        session_id=session_id,
        message="Conversation session has been reset. You may start describing a new complaint.",
        draft=ComplaintDraftState()
    )

@router.get("/{session_id}")
def get_chat_session_legacy(session_id: str, db: Session = Depends(get_db)):
    return get_chat_session_by_id(session_id, db)
