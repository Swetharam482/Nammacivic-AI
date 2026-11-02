"""
NammaCivic AI - Dataset-Grounded Retrieval and Conversational Engine
Implements:
- Multi-turn conversation state tracking
- Intent recognition
- 20-category grievance classification
- English, Tamil, Tanglish multi-lingual NLP
- Fuzzy matching & keyword retrieval over Grievance_Examples & Conversation_History
- Context-aware follow-up question generation grounded in dataset
- Missing information detection without repeating questions
"""

import re
import difflib
from typing import Dict, Any, List, Optional, Tuple
from app.services.dataset_service import dataset_service

# Standard 20 civic grievance categories from dataset
CATEGORY_CODES = [
    "ROAD_DAMAGE",
    "STREETLIGHT",
    "GARBAGE",
    "DRAINAGE",
    "SEWAGE",
    "WATER_SHORTAGE",
    "WATER_LEAK",
    "PUBLIC_TOILET",
    "MOSQUITO",
    "STRAY_ANIMAL",
    "ENCROACHMENT",
    "ILLEGAL_DUMPING",
    "FLOODING",
    "PUBLIC_INFRA",
    "PARK",
    "TREE_HAZARD",
    "FOOTPATH",
    "PUBLIC_SAFETY",
    "WATER_QUALITY",
    "OTHER_CIVIC"
]

TANGLISH_VOCAB = {
    "eriyala", "velai", "seiyala", "podala", "pallam", "kuzhi", "kuppai", "kuppa",
    "thanni", "kudineer", "varala", "udanjuruchu", "saakkadai", "naatram", "dur",
    "romba", "naala", "naatkal", "aayiduchu", "enga", "inga", "unga", "streetla",
    "roadla", "illai", "nadakkuranga", "kambam", "pakkathula", "kitta", "ethiril",
    "maram", "vilunthathu", "vetta", "naai", "thollai", "kadi", "kattumana",
    "adappu", "theengi", "nirambi", "valiyuthu", "oorura", "manam", "kaalvai"
}

CONFIRMATION_WORDS = {
    # English
    "yes", "yeah", "yep", "sure", "confirm", "ok", "okay", "correct", "proceed",
    "submit", "go ahead", "fine", "agreed", "i confirm", "all good", "right",
    # Tanglish
    "aama", "aamam", "sari", "seri", "samarpikkalam", "submit pannunga", "seri, proceed pannunga",
    "proceed pannunga", "confirm pannunga", "correcta", "pannunga", "ok pannunga", "correcta irukku",
    # Tamil
    "ஆம்", "சரி", "சமர்ப்பிக்கவும்", "தொடரலாம்", "உறுதி", "உறுதி செய்கிறேன்", "பதிவு செய்",
    "பதிவு செய்யவும்", "சரியாக உள்ளது", "முடிக்கவும்"
}

CANCEL_WORDS = {
    # English
    "no", "nope", "cancel", "reset", "restart", "start over", "stop", "wrong", "change", "edit", "not correct",
    # Tanglish
    "illa", "illai", "vendam", "thappu", "change pannunga", "correct illa", "modify",
    # Tamil
    "இல்லை", "வேண்டாம்", "தவறு", "மாற்று", "ரத்து செய்", "மீட்டமை"
}

DURATION_RULES = [
    (r"(\d+)\s*(days?|naal|naala|naatkal|நாட்கள்|நாள்|நாட்களாக)", r"\1 days"),
    (r"(மூன்று|moonu)\s*(நாட்கள்|நாட்களாக|naal|naala|days)", "3 days"),
    (r"(இரண்டு|ரெண்டு|rendu)\s*(நாட்கள்|நாட்களாக|naal|naala|days)", "2 days"),
    (r"(ஒரு|one)\s*(வாரம்|வாரமாக|vaaram|week)", "1 week"),
    (r"(இரண்டு|ரெண்டு|two)\s*(வாரங்கள்|வாரமாக|weeks)", "2 weeks"),
    (r"(\d+)\s*(weeks?|vaaram|வாரங்கள்|வாரம்|வாரமாக)", r"\1 weeks"),
    (r"(\d+)\s*(months?|maasam|மாதங்கள்|மாதம்)", r"\1 months"),
    (r"(\d+)\s*(hours?|mani|நேரம்|மணி)", r"\1 hours"),
    (r"(yesterday|nethu|நேற்று)", "Since yesterday"),
    (r"(today|innaiku|இன்று)", "Today"),
    (r"(few\s*days|sila\s*naatkal|சில\s*நாட்களாக)", "3-4 days"),
    (r"(long\s*time|romba\s*naala|ரொம்ப\s*நாளா)", "Over a week")
]

LANDMARK_INDICATORS = [
    r"(?:near|opposite|opp|adj|beside|behind|next\s*to|pakkathula|kitta|முன்னால்|எதிரில்|அருகில்)\s+([A-Za-z0-9\s\.\-]{3,50})",
    r"([A-Za-z0-9\s\.\-]{2,30}\s+(?:school|college|hospital|bus\s*stand|bus\s*stop|temple|kovil|church|mosque|junction|signal|bridge|bazaar|market|station|park|theatre|cinema|hall))\s+(?:opposite|opp|near|pakkathula|முன்னால்|எதிரில்|அருகில்)"
]

VAGUE_LOCATION_WORDS = {"house", "my house", "home", "வீடு", "என் வீடு", "here", "inga", "area"}

class DatasetRetrievalEngine:
    def __init__(self):
        self.ds = dataset_service

    def detect_language(self, text: str) -> str:
        """Identifies Tamil (script), Tanglish, or English."""
        tamil_chars = len(re.findall(r"[\u0B80-\u0BFF]", text))
        if tamil_chars >= 2:
            return "Tamil"

        tokens = re.findall(r"\b[a-zA-Z]+\b", text.lower())
        tanglish_count = sum(1 for t in tokens if t in TANGLISH_VOCAB or t.endswith("la") or t.endswith("nga"))
        if tanglish_count >= 1:
            return "Tanglish"

        return "English"

    def detect_intent(self, text: str, current_state: Dict[str, Any]) -> str:
        """Determines the citizen's intent."""
        cleaned = text.strip().lower()

        # Confirmation check when summary is awaiting confirmation
        if current_state.get("needs_confirmation") or current_state.get("is_summary_ready"):
            if any(w in cleaned for w in CONFIRMATION_WORDS):
                return "CONFIRM_SUBMISSION"
            if any(w in cleaned for w in CANCEL_WORDS):
                return "CANCEL_OR_RESET"

        # Direct reset
        if cleaned in ["reset", "restart", "cancel", "clear", "மீட்டமை"]:
            return "CANCEL_OR_RESET"

        # Greetings - handles "hi", "hii", "hello", "hey", "vanakkam", "வணக்கம்", etc.
        if re.match(r"^(hi+|hello+|hey+|hola|vanakkam|வணக்கம்|namaste|good\s*(morning|afternoon|evening)|howdy)\b", cleaned):
            if not any(k in cleaned for k in ["pothole", "road", "light", "garbage", "waste", "drain", "sewage", "water", "leak", "dog", "thanni", "kuppai", "pallam", "பள்ளம்", "விளக்கு", "குப்பை", "சாக்கடை", "தண்ணீர்", "தெரு"]):
                return "GREETING"

        # Check for status query
        if "status" in cleaned or "track" in cleaned or re.search(r"nc-\d{4}-\d+", cleaned):
            return "TRACK_STATUS"

        # General grievance registration
        return "REGISTER_GRIEVANCE"

    def match_grievance_examples(self, text: str, limit: int = 3) -> List[Tuple[Dict[str, Any], float]]:
        """
        Retrieves the most semantically relevant grievance examples from the 226 dataset rows.
        Combines token matching, keywords matching, and sequence similarity across English, Tamil, and Tanglish.
        """
        query = text.strip().lower()
        query_tokens = set(re.findall(r"[\w\u0B80-\u0BFF]+", query))
        if not query_tokens:
            return []

        scored_examples = []
        for ex in self.ds.grievance_examples:
            score = 0.0

            # 1. Keywords match (high weight)
            kw_str = str(ex.get("keywords") or ex.get("Keywords") or "").lower()
            kw_tokens = set(re.findall(r"[\w\u0B80-\u0BFF]+", kw_str))
            common_kw = query_tokens.intersection(kw_tokens)
            if common_kw:
                score += len(common_kw) * 3.5

            lang = str(ex.get("language") or ex.get("Language") or "").lower()
            user_msg = str(ex.get("user_message") or ex.get("User_Message") or "").lower()

            # 2. Match against English example
            eng = str(ex.get("english_example") or (user_msg if lang == "english" else "")).lower()
            if eng:
                eng_tokens = set(re.findall(r"[\w\u0B80-\u0BFF]+", eng))
                score += len(query_tokens.intersection(eng_tokens)) * 2.0

            # 3. Match against Tanglish example
            tang = str(ex.get("tanglish_example") or (user_msg if lang == "tanglish" else "")).lower()
            if tang:
                tang_tokens = set(re.findall(r"[\w\u0B80-\u0BFF]+", tang))
                score += len(query_tokens.intersection(tang_tokens)) * 2.5

            # 4. Match against Tamil example
            tam = str(ex.get("tamil_example") or (user_msg if lang == "tamil" else "")).lower()
            if tam:
                tam_tokens = set(re.findall(r"[\w\u0B80-\u0BFF]+", tam))
                score += len(query_tokens.intersection(tam_tokens)) * 3.0

            # 5. Fuzzy ratio on closest example text
            best_sim = 0.0
            for text_variant in [eng, tang, tam, user_msg]:
                if text_variant:
                    sim = difflib.SequenceMatcher(None, query, text_variant).ratio()
                    if sim > best_sim:
                        best_sim = sim
            score += best_sim * 2.0

            if score > 0.5:
                scored_examples.append((ex, score))

        scored_examples.sort(key=lambda x: x[1], reverse=True)
        return scored_examples[:limit]

    def classify_category(self, text: str, existing_category: Optional[str] = None) -> Tuple[str, str, float, Optional[Dict[str, Any]]]:
        """
        Classifies the grievance into one of the 20 official categories from the dataset.
        Returns: (category_code, department_name, confidence, best_matching_example)
        """
        if existing_category and existing_category in self.ds.categories_by_code:
            dept = self.ds.categories_by_code[existing_category].get("suggested_department", "Civic Redressal")
            return existing_category, dept, 1.0, None

        matches = self.match_grievance_examples(text, limit=5)
        if matches:
            best_ex, top_score = matches[0]
            code = str(best_ex.get("category_code", "OTHER_CIVIC")).strip().upper()
            dept = best_ex.get("suggested_department") or "Civic Redressal"
            conf = min(0.99, 0.65 + (top_score / 20.0))
            return code, dept, conf, best_ex

        # Fallback keyword scan against Categories sheet
        query = text.lower()
        query_tokens = set(re.findall(r"[\w\u0B80-\u0BFF]+", query))
        best_cat = "OTHER_CIVIC"
        best_score = 0
        for cat in self.ds.categories:
            code = cat.get("category_code", "OTHER_CIVIC")
            kw = str(cat.get("keywords", "")).lower()
            kw_tokens = set(re.findall(r"[\w\u0B80-\u0BFF]+", kw))
            match_count = len(query_tokens.intersection(kw_tokens))
            if match_count > best_score:
                best_score = match_count
                best_cat = code

        cat_obj = self.ds.categories_by_code.get(best_cat, {})
        dept = cat_obj.get("suggested_department", "Civic Redressal")
        return best_cat, dept, (0.75 if best_score > 0 else 0.5), None

    def extract_details(self, text: str, state: Dict[str, Any]) -> Dict[str, Any]:
        """Extracts location, landmark, duration, and priority without overwriting existing data."""
        updated = dict(state)

        # 1. Extract duration if not already set
        if not updated.get("duration"):
            for pattern, repl in DURATION_RULES:
                m = re.search(pattern, text, re.IGNORECASE)
                if m:
                    updated["duration"] = re.sub(pattern, repl, m.group(0), flags=re.IGNORECASE)
                    break

        # 2. Extract landmark if not set
        if not updated.get("landmark"):
            for pat in LANDMARK_INDICATORS:
                m = re.search(pat, text, re.IGNORECASE)
                if m:
                    cand = m.group(1).strip().rstrip(".,;:!? ")
                    if cand.lower() in VAGUE_LOCATION_WORDS:
                        # User specified a vague landmark like 'my house'; break so reverse pattern doesn't falsely grab description
                        break
                    updated["landmark"] = cand
                    break

        # 3. Extract or enrich location (avoid false positives like 'street light')
        if not updated.get("location"):
            # Look for street / road / nagar keywords (excluding 'street light' or 'streetlight')
            addr_m = re.search(
                r"([A-Za-z0-9\s,\.\-]{3,60}(?:street(?!\s*light)|road|salai|nagar|colony|avenue|cross|bus\s*stand|bus\s*stop|school|hospital|பகுதி|தெரு(?!\s*விளக்கு)|சாலை|நகர்))",
                text,
                re.IGNORECASE
            )
            if addr_m:
                cand = addr_m.group(1).strip().rstrip(".,;:!? ")
                if cand.lower() not in VAGUE_LOCATION_WORDS and not re.match(r"^(?:street\s*light|streetlight|தெரு\s*விளக்கு)$", cand, re.I):
                    updated["location"] = cand

        # 4. Assess priority based on safety risk keywords in dataset
        if not updated.get("priority") or updated.get("priority") == "MEDIUM":
            lowered = text.lower()
            if any(w in lowered for w in ["fire", "spark", "open wire", "accident", "hospital", "danger", "hazard", "bleeding", "falling", "swimming pool", "ஆபத்து", "விபத்து", "உயிருக்கு"]):
                updated["priority"] = "CRITICAL"
                updated["priority_reason"] = "Immediate public safety or hazard detected."
            elif any(w in lowered for w in ["dark", "school", "bus stand", "crater", "overflow", "stagnant", "children", "skid", "இருட்டு", "பள்ளி"]):
                updated["priority"] = "HIGH"
                updated["priority_reason"] = "High transit / public vulnerability area."
            else:
                updated["priority"] = "MEDIUM"

        return updated

    def compute_missing_information(self, state: Dict[str, Any], best_ex: Optional[Dict[str, Any]] = None) -> List[str]:
        """Calculates missing required information fields based on dataset rules."""
        missing = []
        loc = (state.get("location") or "").strip().lower()
        lm = (state.get("landmark") or "").strip().lower()

        # Check if location is missing or too vague
        if not loc and not lm:
            missing.append("location")
        elif loc in VAGUE_LOCATION_WORDS and not lm:
            missing.append("location")

        if not state.get("duration"):
            missing.append("duration")

        return missing

    def generate_response(
        self,
        user_message: str,
        current_state: Dict[str, Any],
        language_preference: str = "auto"
    ) -> Dict[str, Any]:
        """
        Main dialogue generation entry point.
        Uses intent recognition, category classification, dataset example retrieval,
        and multi-stage conversation history patterns.
        """
        state = dict(current_state or {})
        detected_lang = self.detect_language(user_message)
        lang = detected_lang if language_preference == "auto" else language_preference
        if language_preference in ["ta", "Tamil"]:
            lang = "Tamil"
        elif language_preference in ["tanglish", "Tanglish"]:
            lang = "Tanglish"
        elif language_preference in ["en", "English"]:
            lang = "English"

        intent = self.detect_intent(user_message, state)

        # 1. Handlers for Non-Grievance Intents
        if intent == "GREETING":
            if lang == "Tamil":
                reply = "வணக்கம்! நம்ம சிவிக் AI-க்கு நல்வரவு. உங்கள் பகுதியில் உள்ள சாலை பழுது, தெருவிளக்கு, குப்பை, குடிநீர் போன்ற குறைகளைத் தெரிவிக்கலாம். என்ன உதவி வேண்டும்?"
            elif lang == "Tanglish":
                reply = "Vanakkam! NammaCivic AI-ku welcome. Unga area-la road damage, streetlight, kuppai, thanni problem edhaavathu irundha sollunga. Help panren."
            else:
                reply = "Hello! Welcome to NammaCivic AI. I am your municipal grievance redressal assistant. You can report civic issues like potholes, streetlights, garbage, water supply, or drainage. How can I help you today?"

            return {
                "reply": reply,
                "draft": state,
                "detected_language": lang,
                "is_summary_ready": False,
                "needs_confirmation": False,
                "should_read_aloud": True
            }

        if intent == "CANCEL_OR_RESET":
            if lang == "Tamil":
                reply = "உரையாடல் மீட்டமைக்கப்பட்டது. உங்கள் புதிய குறையை விவரிக்கலாம்."
            elif lang == "Tanglish":
                reply = "Conversation reset aayiduchu. Unga pudhiya complaintai ippo sollalaam."
            else:
                reply = "Your conversation has been reset. You may describe a new civic complaint."

            return {
                "reply": reply,
                "draft": {
                    "category": None,
                    "description": None,
                    "location": None,
                    "landmark": None,
                    "duration": None,
                    "priority": "MEDIUM",
                    "missing_information": [],
                    "needs_confirmation": False,
                    "is_ready_to_submit": False
                },
                "detected_language": lang,
                "is_summary_ready": False,
                "needs_confirmation": False,
                "should_read_aloud": True
            }

        if intent == "CONFIRM_SUBMISSION":
            state["is_ready_to_submit"] = True
            state["needs_confirmation"] = True

            if lang == "Tamil":
                reply = "உங்கள் உறுதிப்படுத்தல் பெறப்பட்டது! புகார் இப்போது நகராட்சி அமைப்பில் பதிவு செய்யப்படுகிறது..."
            elif lang == "Tanglish":
                reply = "Unga confirmation eduthukitaachu! Complaint ippo municipal database-la record aagudhu..."
            else:
                reply = "Thank you! Your confirmation is received. Registering your complaint in the civic system..."

            return {
                "reply": reply,
                "draft": state,
                "detected_language": lang,
                "is_summary_ready": True,
                "needs_confirmation": True,
                "is_ready_to_submit": True,
                "should_read_aloud": True
            }

        # 2. Grievance Workflow Processing
        # Classify category using dataset retrieval
        cat_code, dept_name, confidence, best_ex = self.classify_category(user_message, state.get("category"))
        state["category"] = cat_code
        state["suggested_department"] = dept_name
        state["classification_confidence"] = confidence

        # Description
        if not state.get("description"):
            state["description"] = user_message.strip()
        elif user_message.strip().lower() not in state["description"].lower():
            state["description"] += f" | {user_message.strip()}"

        # Extract details (location, landmark, duration, priority)
        state = self.extract_details(user_message, state)

        # If user directly answered a location or landmark question (when location was missing):
        if not state.get("location") and "location" in (current_state or {}).get("missing_information", []):
            cleaned_m = user_message.strip()
            if cleaned_m.lower() not in VAGUE_LOCATION_WORDS and not re.search(r"\b(street\s*light|streetlight|pothole|குப்பை|drainage)\b", cleaned_m, re.I):
                state["location"] = cleaned_m

        # Compute missing info
        missing = self.compute_missing_information(state, best_ex)
        state["missing_information"] = missing

        # 3. Formulate Context-Aware Reply Grounded in Dataset
        # If all required information is gathered, show summary and ask for citizen confirmation!
        if not missing:
            state["needs_confirmation"] = True
            state["is_summary_ready"] = True
            state["missing_information"] = []

            loc_str = state.get('location') or state.get('landmark') or 'Reported Area'
            cat_label = self.ds.categories_by_code.get(cat_code, {}).get("category", cat_code)

            if lang == "Tamil":
                reply = (
                    f"நன்றி. உங்கள் குறையின் விவரங்கள்:\n"
                    f"• துறை: {dept_name}\n"
                    f"• பிரிவு: {cat_label}\n"
                    f"• இடம்: {loc_str}\n"
                    f"• காலம்: {state.get('duration', 'சில நாட்கள்')}\n"
                    f"• முன்னுரிமை: {state.get('priority', 'MEDIUM')}\n\n"
                    f"இந்த விவரங்கள் சரியா? 'ஆம்' என பதிலளித்து உறுதிப்படுத்தவும்."
                )
            elif lang == "Tanglish":
                reply = (
                    f"Romba nandri. Unga grievance details:\n"
                    f"• Department: {dept_name}\n"
                    f"• Category: {cat_label}\n"
                    f"• Location: {loc_str}\n"
                    f"• Duration: {state.get('duration', 'A few days')}\n"
                    f"• Priority: {state.get('priority', 'MEDIUM')}\n\n"
                    f"Indha details correct-a irukka? 'Yes' nu sollunga submit pannalam."
                )
            else:
                reply = (
                    f"Thank you. I have summarized your complaint details:\n"
                    f"• Category: {cat_label}\n"
                    f"• Suggested Department: {dept_name}\n"
                    f"• Location: {loc_str}\n"
                    f"• Duration: {state.get('duration', 'A few days')}\n"
                    f"• Priority: {state.get('priority', 'MEDIUM')}\n\n"
                    f"Please confirm if the above information is accurate (Reply 'Yes' or 'Confirm')."
                )

            return {
                "reply": reply,
                "draft": state,
                "detected_language": lang,
                "is_summary_ready": True,
                "needs_confirmation": True,
                "should_read_aloud": True
            }

        # Otherwise, ask for missing details using retrieved follow-ups from Grievance_Examples
        state["needs_confirmation"] = False
        state["is_summary_ready"] = False

        if "location" in missing:
            # Generate location follow-up in citizen language
            cat_name = self.ds.categories_by_code.get(cat_code, {}).get('category', 'civic issue')
            if lang == "Tamil":
                reply = f"உங்கள் {cat_name} புகார் குறித்து நடவடிக்கை எடுக்க, எந்த தெரு அல்லது அருகிலுள்ள அடையாளத்தைச் சொல்ல முடியுமா?"
            elif lang == "Tanglish":
                if cat_code == "STREETLIGHT":
                    reply = "உங்கள் பகுதியில் தெருவிளக்கு எரியவில்லையா? எந்த தெரு அல்லது அருகிலுள்ள அடையாளத்தைச் சொல்ல முடியுமா?"
                else:
                    reply = f"Indha {cat_code.lower().replace('_', ' ')} issue-ku action edukka, entha street or nearest landmark sollunga?"
            else:
                if cat_code == "ROAD_DAMAGE":
                    reply = "I can help you report a road damage issue. Which area or locality is the pothole located in?"
                else:
                    reply = f"I can assist you with this {cat_name}. What is the exact street name or nearby landmark?"

        elif "duration" in missing:
            if lang == "Tamil":
                reply = "இந்த பிரச்சனை எத்தனை நாட்களாக நீடிக்கிறது? (எ.கா: 2 நாட்கள், 1 வாரம்)"
            elif lang == "Tanglish":
                reply = "Indha issue ethanai naala irukku? (E.g.: 2 days, 1 week)"
            else:
                reply = "How long has this issue been persisting? (e.g., 2 days, 1 week)"

        else:
            q = (best_ex.get("follow_up_2") if best_ex else None) or "Could you share additional specific details to dispatch the field team?"
            if lang == "Tamil":
                reply = f"கூடுதல் தகவல் தர முடியுமா? {q}"
            elif lang == "Tanglish":
                reply = f"Konjam extra details sollunga: {q}"
            else:
                reply = q

        return {
            "reply": reply,
            "draft": state,
            "detected_language": lang,
            "is_summary_ready": False,
            "needs_confirmation": False,
            "should_read_aloud": True
        }

retrieval_engine = DatasetRetrievalEngine()
