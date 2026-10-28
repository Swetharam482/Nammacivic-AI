import os
import json
import logging
from typing import Dict, Any, Optional
from app.core.config import settings
from app.ai.rule_fallback import process_message_offline

logger = logging.getLogger(__name__)

class AIEngine:
    def __init__(self):
        self.provider = settings.AI_PROVIDER
        self.gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")

    def process_chat(
        self,
        message: str,
        current_state: Dict[str, Any],
        language_preference: str = "auto"
    ) -> Dict[str, Any]:
        """
        Orchestrates LLM processing with robust rule-based fallback.
        """
        if self.gemini_key and self.provider == "gemini":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)  # type: ignore
                model = genai.GenerativeModel("gemini-1.5-flash")  # type: ignore

                system_prompt = f"""
You are NammaCivic AI, a multilingual civic complaint assistant for Tamil Nadu local bodies.
Supported categories: ROAD, STREETLIGHT, GARBAGE, WATER, DRAINAGE, SANITATION, PUBLIC_PROPERTY, ENVIRONMENT, ANIMAL, OTHER.
Languages supported: Tamil, Tanglish (Tamil in Latin alphabet), English.

Current collected complaint state:
{json.dumps(current_state, ensure_ascii=False)}

User message: "{message}"

Your task:
1. Extract Category, Subcategory, Location, Landmark, Duration.
2. Determine missing required fields (location, duration).
3. If all details present, summarize and ask confirmation.
4. Formulate response in the citizen's language ({language_preference}).
Return JSON ONLY:
{{
  "reply": "friendly assistant reply or follow-up question",
  "category": "category or existing",
  "subcategory": "subcategory",
  "description": "clean summary of grievance",
  "location": "location or null",
  "landmark": "landmark or null",
  "duration": "duration or null",
  "priority": "LOW|MEDIUM|HIGH|CRITICAL",
  "priority_reason": "brief reason",
  "missing_information": ["location", "duration"],
  "needs_confirmation": boolean,
  "detected_language": "Tamil|Tanglish|English"
}}
"""
                response = model.generate_content(system_prompt)
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text[7:-3].strip()
                elif text.startswith("```"):
                    text = text[3:-3].strip()
                parsed = json.loads(text)

                state = dict(current_state)
                for k in ["category", "subcategory", "description", "location", "landmark", "duration", "priority", "priority_reason"]:
                    if parsed.get(k):
                        state[k] = parsed[k]
                state["missing_information"] = parsed.get("missing_information", [])
                state["needs_confirmation"] = parsed.get("needs_confirmation", False)
                state["classification_method"] = "AI_GEMINI"
                state["classification_confidence"] = 0.98

                return {
                    "reply": parsed.get("reply", "Thank you for the update."),
                    "draft": state,
                    "detected_language": parsed.get("detected_language", "English"),
                    "is_ready_to_submit": parsed.get("needs_confirmation", False),
                    "needs_confirmation": parsed.get("needs_confirmation", False)
                }
            except Exception as e:
                logger.warning(f"External LLM invocation failed, falling back to rule-based engine: {e}")

        # Default & resilient fallback
        return process_message_offline(
            user_message=message,
            existing_state=current_state,
            preferred_language=language_preference
        )

ai_engine = AIEngine()
