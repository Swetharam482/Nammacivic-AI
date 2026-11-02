import os
import json
import logging
from typing import Dict, Any, Optional
from app.core.config import settings
from app.ai.dataset_retrieval import retrieval_engine

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
        Orchestrates LLM processing grounded in NammaCivic_AI_Grievance_Dataset_1000.xlsx
        with deterministic dataset retrieval fallback.
        """
        # In test mode or when provider is fallback, use fast dataset retrieval directly
        if os.getenv("TESTING") == "1" or self.provider != "gemini" or not self.gemini_key:
            return retrieval_engine.generate_response(
                user_message=message,
                current_state=current_state,
                language_preference=language_preference
            )
        # 1. Retrieve top matching examples from attached dataset
        matched_examples = retrieval_engine.match_grievance_examples(message, limit=3)
        retrieved_context = []
        for ex, score in matched_examples:
            retrieved_context.append({
                "category_code": ex.get("category_code"),
                "category": ex.get("category"),
                "suggested_department": ex.get("suggested_department"),
                "sample_english": ex.get("english_example"),
                "sample_tanglish": ex.get("tanglish_example"),
                "sample_tamil": ex.get("tamil_example"),
                "follow_up_1": ex.get("follow_up_1"),
                "follow_up_2": ex.get("follow_up_2")
            })

        # 2. If Gemini is configured, invoke it with grounding in retrieved dataset examples
        if self.gemini_key and self.provider == "gemini":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)  # type: ignore
                model = genai.GenerativeModel("gemini-1.5-flash")  # type: ignore

                system_prompt = f"""
You are NammaCivic AI, a multilingual civic complaint assistant for Tamil Nadu local bodies.
Primary knowledge source: NammaCivic AI Grievance Dataset (20 official categories).
Supported Categories:
ROAD_DAMAGE, STREETLIGHT, GARBAGE, DRAINAGE, SEWAGE, WATER_SHORTAGE, WATER_LEAK,
PUBLIC_TOILET, MOSQUITO, STRAY_ANIMAL, ENCROACHMENT, ILLEGAL_DUMPING, FLOODING,
PUBLIC_INFRA, PARK, TREE_HAZARD, FOOTPATH, PUBLIC_SAFETY, WATER_QUALITY, OTHER_CIVIC.

Retrieved Relevant Dataset Examples:
{json.dumps(retrieved_context, ensure_ascii=False, indent=2)}

Current collected complaint state:
{json.dumps(current_state, ensure_ascii=False)}

User message: "{message}"

Your task:
1. Extract or maintain Category (from the 20 official categories), Location, Landmark, Duration.
2. Determine missing required fields (location, duration).
3. If all details present, summarize and ask confirmation.
4. Formulate contextual response in the citizen's detected language ({language_preference}) grounded in the dataset follow-up questions.
Return JSON ONLY:
{{
  "reply": "friendly assistant reply or follow-up question",
  "category": "one of the 20 category codes",
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
                for k in ["category", "description", "location", "landmark", "duration", "priority", "priority_reason"]:
                    if parsed.get(k):
                        state[k] = parsed[k]
                state["missing_information"] = parsed.get("missing_information", [])
                state["needs_confirmation"] = parsed.get("needs_confirmation", False)
                state["classification_method"] = "AI_GEMINI_GROUNDED"
                state["classification_confidence"] = 0.98

                cat_code = state.get("category", "OTHER_CIVIC")
                cat_info = retrieval_engine.ds.categories_by_code.get(cat_code, {})
                state["suggested_department"] = cat_info.get("suggested_department", "Civic Redressal")

                return {
                    "reply": parsed.get("reply", "Thank you for the update."),
                    "draft": state,
                    "detected_language": parsed.get("detected_language", "English"),
                    "is_ready_to_submit": parsed.get("needs_confirmation", False),
                    "needs_confirmation": parsed.get("needs_confirmation", False),
                    "is_summary_ready": parsed.get("needs_confirmation", False),
                    "should_read_aloud": True
                }
            except Exception as e:
                logger.warning(f"External LLM invocation failed, falling back to dataset retrieval engine: {e}")

        # 3. Default and robust retrieval engine grounded in Excel dataset
        return retrieval_engine.generate_response(
            user_message=message,
            current_state=current_state,
            language_preference=language_preference
        )

ai_engine = AIEngine()
