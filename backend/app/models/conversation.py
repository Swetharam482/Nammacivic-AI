from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional, List
import json
from sqlalchemy import Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class ConversationSession(Base):
    __tablename__ = "conversation_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    language: Mapped[str] = mapped_column(String(50), default="English")
    
    # JSON field storing current draft state:
    # { category, subcategory, description, location, landmark, duration, priority, missing_information, needs_confirmation }
    state_json: Mapped[str] = mapped_column(Text, default="{}")

    # If submitted, links to the finalized complaint_id
    final_complaint_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default=None)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    messages: Mapped[List["ConversationMessage"]] = relationship("ConversationMessage", back_populates="session", cascade="all, delete-orphan", order_by="ConversationMessage.created_at.asc()")

    def get_state(self) -> dict:
        try:
            return json.loads(self.state_json) if self.state_json else {}
        except Exception:
            return {}

    def set_state(self, state_dict: dict):
        self.state_json = json.dumps(state_dict)

class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(100), ForeignKey("conversation_sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    sender: Mapped[str] = mapped_column(String(20), nullable=False)  # "user" or "assistant"
    message_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    session: Mapped["ConversationSession"] = relationship("ConversationSession", back_populates="messages")
