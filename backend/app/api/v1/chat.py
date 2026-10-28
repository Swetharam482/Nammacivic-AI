import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.conversation import ConversationSession, ConversationMessage
from app.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    ComplaintDraftState,
    ResetChatResponse
)
from app.ai.engine import ai_engine

router = APIRouter()

@router.post("", response_model=ChatMessageResponse)
def handle_chat_message(
    req: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    session_id = req.session_id
    session = None
    if session_id:
        session = db.query(ConversationSession).filter(ConversationSession.session_id == session_id).first()

    if not session:
        session_id = str(uuid.uuid4())
        session = ConversationSession(
            session_id=session_id,
            language=req.language or "auto",
            state_json="{}"
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # Record citizen message
    user_msg = ConversationMessage(
        session_id=session.session_id,
        sender="user",
        message_text=req.message
    )
    db.add(user_msg)

    # Process through AI engine
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
def get_chat_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ConversationSession).filter(ConversationSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = [
        {"sender": m.sender, "text": m.message_text, "created_at": m.created_at}
        for m in session.messages
    ]
    return {
        "session_id": session.session_id,
        "language": session.language,
        "draft": session.get_state(),
        "messages": messages
    }
