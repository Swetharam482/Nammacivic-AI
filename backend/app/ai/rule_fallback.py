import re
from typing import Dict, Any, List, Tuple

# Categories definition
CATEGORIES = [
    "ROAD",
    "STREETLIGHT",
    "GARBAGE",
    "WATER",
    "DRAINAGE",
    "SANITATION",
    "PUBLIC_PROPERTY",
    "ENVIRONMENT",
    "ANIMAL",
    "OTHER"
]

# Vocabulary mappings for Tamil, Tanglish, and English
CATEGORY_PATTERNS = {
    "STREETLIGHT": [
        r"street\s*light", r"தெரு\s*விளக்கு", r"விளக்கு", r"light\s*eriyala", r"light\s*velai\s*seiyala",
        r"light\s*podala", r"lamp\s*post", r"electric\s*post", r"dark\s*street", r"streetlight",
        r"bulb\s*eriyala", r"pole", r"kambam", r"மின்\s*கம்பம்"
    ],
    "GARBAGE": [
        r"garbage", r"குப்பை", r"kuppai", r"trash", r"waste", r"waste\s*dump", r"bin\s*overflow",
        r"dustbin", r"kuppa", r"clean\s*panala", r"collect\s*panala", r"cleaning\s*illai",
        r"allala", r"dumping"
    ],
    "ROAD": [
        r"road", r"சாலை", r"ரோடு", r"pothole", r"குழி", r"kuzhi", r"damaged\s*road", r"crater",
        r"tar\s*road", r"street\s*damaged", r"speed\s*breaker", r"salai", r"patch\s*work",
        r"manhole\s*cover", r"asphalt"
    ],
    "DRAINAGE": [
        r"drainage", r"சாக்கடை", r"sewage", r"drain", r"kaalvai", r"saakkadai", r"overflow",
        r"block\s*aayiduchu", r"clogged", r"gutter", r"smell", r"dur\s*naatram", r"sewer"
    ],
    "WATER": [
        r"water", r"தண்ணீர்", r"குடிநீர்", r"kudineer", r"pipe\s*broken", r"leakage", r"pipeline",
        r"water\s*supply", r"thanni\s*varala", r"drinking\s*water", r"contamination", r"no\s*water",
        r"lorry\s*water", r"water\s*cut", r"pipe\s*udanjuruchu"
    ],
    "SANITATION": [
        r"sanitation", r"public\s*toilet", r"சுத்தம்", r"shuttle", r"toilet", r"urinal",
        r"hygiene", r"lavatory", r"kazhivarai", r"கழிவறை"
    ],
    "PUBLIC_PROPERTY": [
        r"bus\s*stop", r"bus\s*shelter", r"park\s*bench", r"community\s*hall", r"footpath",
        r"nadai\s*paadhai", r"நடைபாதை", r"park", r"damaged\s*signboard"
    ],
    "ANIMAL": [
        r"stray\s*dog", r"நாய்கள்", r"naai", r"dogs\s*barking", r"dead\s*animal", r"cattle",
        r"cow\s*traffic", r"monkey\s*trouble", r"stray"
    ],
    "ENVIRONMENT": [
        r"tree\s*fallen", r"maram\s*vilunthathu", r"மரம்", r"branch\s*broken", r"air\s*pollution",
        r"sound\s*pollution", r"burning\s*plastic"
    ]
}

# Duration extraction patterns
DURATION_PATTERNS = [
    (r"(\d+)\s*(days?|naal|naala|naatkal|நாட்கள்|நாள்)", "{0} days"),
    (r"(\d+)\s*(weeks?|vaaram|வாரங்கள்)", "{0} weeks"),
    (r"(\d+)\s*(months?|maasam|மாதங்கள்)", "{0} months"),
    (r"(\d+)\s*(hours?|mani|நேரம்)", "{0} hours"),
    (r"(yesterday|nethu|நேற்று)", "1 day (since yesterday)"),
    (r"(today|innaiku|இன்று)", "Today"),
    (r"(few\s*days|sila\s*naatkal|சில\s*நாட்களாக)", "3-4 days"),
    (r"(one\s*week|oru\s*vaaram|ஒரு\s*வாரம்)", "1 week"),
    (r"(two\s*days|rendu\s*naal|இரண்டு\s*நாட்கள்)", "2 days"),
    (r"(three\s*days|moonu\s*naal|மூன்று\s*நாட்கள்)", "3 days"),
    (r"(long\s*time|romba\s*naala|ரொம்ப\s*நாளா)", "Over a week")
]

# Landmark indicators
LANDMARK_PATTERNS = [
    r"(?:near|opposite|opp|adj|beside|behind|next\s*to|kithe|pakkathula|முன்னால்|எதிரில்|அருகில்)\s+([A-Za-z0-9\s\.\-]{3,40})",
    r"([A-Za-z0-9\s\.\-]{3,35})\s+(?:opposite|opp|near|pakkathula|school|hospital|bus\s*stop|temple|kovil|church|mosque|junction|signal|bridge)"
]

def detect_language(text: str) -> str:
    """Detects whether text is Tamil (script), Tanglish (Tamil in Latin script), or English."""
    # Check for Tamil Unicode range (\u0B80 - \u0BFF)
    tamil_chars = len(re.findall(r"[\u0B80-\u0BFF]", text))
    if tamil_chars > 2:
        return "Tamil"

    # Check for common Tanglish words
    tanglish_words = [
        "enga", "inga", "unga", "streetla", "roadla", "illai", "varala", "iruku", "aayiduchu",
        "panala", "pannunga", "nethu", "innaiku", "romba", "mudiyala", "kuzhi", "kuppai",
        "thanni", "velai", "seiyala", "pakkathula", "opposite", "kitta", "eriyala", "udanjuruchu"
    ]
    words = re.findall(r"\b[a-zA-Z]+\b", text.lower())
    tanglish_count = sum(1 for w in words if w in tanglish_words)
    if tanglish_count >= 1 or any("la" in w and len(w) > 4 for w in words):
        return "Tanglish"

    return "English"

def extract_category(text: str) -> Tuple[str, str, float]:
    """Matches text against category patterns with confidence score."""
    text_lower = text.lower()
    for cat, patterns in CATEGORY_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, text_lower):
                # Subcategory heuristics
                subcat = "GENERAL_ISSUE"
                if cat == "STREETLIGHT":
                    subcat = "NOT_WORKING" if any(w in text_lower for w in ["eriyala", "working", "work", "dark", "podala"]) else "DAMAGED_POLE"
                elif cat == "ROAD":
                    subcat = "POTHOLE" if any(w in text_lower for w in ["pothole", "kuzhi", "குழி", "hole"]) else "SURFACE_DAMAGE"
                elif cat == "GARBAGE":
                    subcat = "UNCOLLECTED_WASTE" if any(w in text_lower for w in ["collect", "allala", "clean", "dump"]) else "OVERFLOWING_BIN"
                elif cat == "DRAINAGE":
                    subcat = "SEWAGE_OVERFLOW" if any(w in text_lower for w in ["overflow", "leak", "smell", "block"]) else "CLOGGED_DRAIN"
                elif cat == "WATER":
                    subcat = "NO_SUPPLY" if any(w in text_lower for w in ["varala", "supply", "cut", "illai"]) else "PIPE_BURST"
                return cat, subcat, 0.95

    return "OTHER", "CIVIC_GRIEVANCE", 0.50

def extract_duration(text: str) -> str:
    """Extracts duration if mentioned."""
    text_lower = text.lower()
    for pat, template in DURATION_PATTERNS:
        match = re.search(pat, text_lower)
        if match:
            if "{0}" in template:
                return template.format(match.group(1))
            return template
    return ""

def extract_location_and_landmark(text: str) -> Tuple[str, str]:
    """Extracts candidate location or landmark."""
    loc = ""
    landmark = ""

    # Look for landmark indicators first
    for pat in LANDMARK_PATTERNS:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            cand = match.group(0).strip(" .,")
            if not any(w in cand.lower() for w in ["street light", "streetlight", "work aagala"]):
                landmark = cand
                break

    # Look for street / area indicators, but avoid "street light" false matches
    cleaned_for_loc = re.sub(r"street\s*light", "", text, flags=re.IGNORECASE)

    area_match = re.search(
        r"\b([A-Za-z0-9\s\.\-]{2,30}\s+(?:Nagar|Colony|Street|Road|Salai|Avenue|Lane|Circle|Main\s*Road|Layout|தெரு|நகர்|சாலை))\b",
        cleaned_for_loc,
        re.IGNORECASE
    )
    if area_match:
        cand = area_match.group(1).strip(" .,")
        words = cand.lower().split()
        generic = {"enga", "namma", "my", "our", "this", "intha", "andha", "oru", "la"}
        meaningful = [w for w in words if w not in generic and w not in ["street", "road", "nagar", "salai", "avenue", "lane", "colony", "layout"]]
        if meaningful:
            loc = cand

    if not loc and not landmark:
        if "school" in text.lower() or "hospital" in text.lower() or "station" in text.lower():
            landmark = text.strip(" .,")

    return loc, landmark

def assess_priority(category: str, description: str) -> Tuple[str, str]:
    """Calculates suggested priority level and reason based on civic urgency rules."""
    desc = description.lower()
    
    # CRITICAL criteria
    if category == "DRAINAGE" and any(w in desc for w in ["hospital", "school", "house", "veedu", "flood", "drinking"]):
        return "CRITICAL", "High public health risk: Sewage overflow near sensitive zone or residential dwellings."
    if category == "ROAD" and any(w in desc for w in ["manhole", "open", "deep", "accident", "cave-in", "collapse"]):
        return "CRITICAL", "Immediate hazard to human life: Open manhole or major road cave-in reported."
    if category == "STREETLIGHT" and any(w in desc for w in ["wire", "spark", "current", "electric shock", "hanging"]):
        return "CRITICAL", "Electrical hazard: Exposed wires or sparking post posing electrocution threat."
    if category == "WATER" and any(w in desc for w in ["smell", "black", "dirty", "contamination", "sewage mix", "illness"]):
        return "CRITICAL", "Severe health risk: Suspected contamination in public drinking water supply."

    # HIGH criteria
    if category in ["DRAINAGE", "WATER"]:
        return "HIGH", "Water or sanitation service interruption impacting daily citizen hygiene."
    if category == "GARBAGE" and any(w in desc for w in ["week", "weeks", "dog", "huge", "stink", "market"]):
        return "HIGH", "Substantial accumulated waste creating pest and epidemic hazard."
    if category == "ROAD" and any(w in desc for w in ["bus", "main road", "large", "traffic", "periya"]):
        return "HIGH", "Pothole on primary transit route hindering vehicular traffic and commuters."
    if category == "ANIMAL" and any(w in desc for w in ["biting", "bite", "aggressive", "rabid"]):
        return "HIGH", "Threat of animal attack or rabies in local residential sector."

    # MEDIUM criteria (standard)
    if category in ["STREETLIGHT", "GARBAGE", "ROAD", "PUBLIC_PROPERTY"]:
        return "MEDIUM", "Standard civic maintenance grievance requiring scheduled local body intervention."

    # LOW criteria
    return "LOW", "Routine public property observation or non-emergency maintenance."

def generate_follow_up(
    missing_fields: List[str], 
    language: str, 
    collected_state: Dict[str, Any]
) -> Tuple[str, bool]:
    """
    Generates the next contextual question in Tamil, Tanglish, or English.
    Returns: (reply_text, is_ready_for_confirmation)
    """
    if not missing_fields:
        # All required info collected! Summarize and ask for confirmation
        cat = collected_state.get("category", "General Civic Issue")
        desc = collected_state.get("description", "")
        loc = collected_state.get("location") or collected_state.get("landmark") or "Mentioned location"
        dur = collected_state.get("duration") or "Recently reported"

        if language == "Tamil":
            reply = (
                f"நன்றி! உங்கள் புகார் விவரங்கள் சேகரிக்கப்பட்டன:\n"
                f"• வகை: {cat}\n"
                f"• விவரம்: {desc}\n"
                f"• இடம்: {loc}\n"
                f"• காலம்: {dur}\n\n"
                f"இந்தப் புகாரைச் சமர்ப்பிக்கலாமா? கீழே உள்ள 'புகாரைச் சமர்ப்பி' பொத்தானை அழுத்தவும் அல்லது 'ஆம்' என பதிலளிக்கவும்."
            )
        elif language == "Tanglish":
            reply = (
                f"Super! Unga complaint details collect aaiduchu:\n"
                f"• Category: {cat}\n"
                f"• Details: {desc}\n"
                f"• Location: {loc}\n"
                f"• Duration: {dur}\n\n"
                f"Indha complaint-ah submit pannalama? Keezha irukkura 'Submit Complaint' button-ah click pannunga or 'Yes' nu type pannunga."
            )
        else:
            reply = (
                f"Thank you! Here is the summary of your grievance:\n"
                f"• Category: {cat}\n"
                f"• Description: {desc}\n"
                f"• Location: {loc}\n"
                f"• Duration: {dur}\n\n"
                f"Would you like to confirm and submit this complaint to the civic department?"
            )
        return reply, True

    # Identify the highest priority missing field
    next_field = missing_fields[0]

    if next_field == "location":
        if language == "Tamil":
            reply = "புரிந்தது. இந்தப் பிரச்சனை இருக்கும் இடம் அல்லது தெருவின் பெயரைச் சொல்ல முடியுமா?"
        elif language == "Tanglish":
            reply = "Purinjithu. Indha problem irukkura area or street name solla mudiyuma?"
        else:
            reply = "Understood. Could you please specify the street name, area, or locality where this issue is located?"
    elif next_field == "landmark":
        if language == "Tamil":
            reply = "இந்தப் பகுதிக்கு அருகில் உள்ள ஏதேனும் அடையாளம் (Landmark - பள்ளி, மருத்துவமனை, கடை) சொல்ல முடியுமா?"
        elif language == "Tanglish":
            reply = "Andha edathukku pakkathula irukkura landmark (school, hospital, or shop) solla mudiyuma?"
        else:
            reply = "Could you provide a nearby landmark (such as a school, bus stop, temple, or shop) to help field teams locate it quickly?"
    elif next_field == "duration":
        if language == "Tamil":
            reply = "இந்தப் பிரச்சனை எத்தனை நாட்களாக நீடிக்கிறது?"
        elif language == "Tanglish":
            reply = "Indha problem ethana naala irukku?"
        else:
            reply = "How long has this issue persisted (e.g. 2 days, 1 week)?"
    else:
        if language == "Tamil":
            reply = "இந்தப் புகாரைப் பற்றி இன்னும் கொஞ்சம் விவரமாகச் சொல்ல முடியுமா?"
        elif language == "Tanglish":
            reply = "Indha complaint pathi innum konjam details solla mudiyuma?"
        else:
            reply = "Could you please provide a few more details about this issue?"

    return reply, False

def process_message_offline(
    user_message: str, 
    existing_state: Dict[str, Any],
    preferred_language: str = "auto"
) -> Dict[str, Any]:
    """
    Main rule-based AI processing function.
    Maintains session state, updates entities, and prompts for next details.
    """
    detected_lang = detect_language(user_message)
    active_lang = detected_lang if preferred_language == "auto" else preferred_language

    state = dict(existing_state) if existing_state else {}

    # Check for confirmation responses
    clean_msg = user_message.strip().lower()
    is_confirming = clean_msg in [
        "yes", "confirm", "submit", "ok", "okay", "aam", "sari", "pannunga", "submit pannunga", "ஆம்", "சரி"
    ]

    if state.get("needs_confirmation") and is_confirming:
        # User confirmed!
        state["is_ready_to_submit"] = True
        state["needs_confirmation"] = False
        return {
            "reply": "உங்கள் புகார் பதிவு செய்ய தயாராக உள்ளது! சமர்ப்பிக்கப்படுகிறது..." if active_lang == "Tamil" else (
                "Unga complaint submit aaga ready aayiruchu! Submitting..." if active_lang == "Tanglish" else
                "Your complaint is confirmed and being submitted to the local body."
            ),
            "draft": state,
            "detected_language": active_lang,
            "is_ready_to_submit": True,
            "needs_confirmation": False
        }

    is_first_turn = not bool(existing_state and existing_state.get("category"))

    # If first message or empty category, extract category and initial description
    if not state.get("category"):
        cat, subcat, conf = extract_category(user_message)
        state["category"] = cat
        state["subcategory"] = subcat
        state["description"] = user_message
        state["classification_confidence"] = conf
        state["classification_method"] = "RULE_BASED"
    else:
        # Append extra info to description if helpful
        if len(user_message.split()) > 3 and user_message.lower() not in state.get("description", "").lower():
            state["description"] = f"{state.get('description', '')}. {user_message}"

    # Extract duration if not already present
    if not state.get("duration"):
        dur = extract_duration(user_message)
        if dur:
            state["duration"] = dur

    # Extract location and landmark if specifically present in text
    loc, landmark = extract_location_and_landmark(user_message)
    if loc and not state.get("location"):
        state["location"] = loc
    if landmark and not state.get("landmark"):
        state["landmark"] = landmark

    # If this is a subsequent follow-up turn and user provided an answer:
    if not is_first_turn:
        missing = existing_state.get("missing_information", [])
        if "location" in missing and not state.get("location"):
            # If user message looks like a location/landmark response
            if len(user_message) > 2 and not any(w in clean_msg for w in ["days", "naal", "weeks", "month"]):
                if "near" in clean_msg or "opposite" in clean_msg or "behind" in clean_msg or "pakkathula" in clean_msg:
                    state["landmark"] = user_message.strip(" .,")
                    state["location"] = user_message.strip(" .,")
                else:
                    state["location"] = user_message.strip(" .,")

        if "duration" in missing and not state.get("duration"):
            dur = extract_duration(user_message)
            if dur:
                state["duration"] = dur
            else:
                duration_units = ["day", "days", "naal", "naala", "week", "weeks", "vaaram", "month", "months", "maasam", "hour", "hours", "mani", "nethu", "innaiku", "yesterday", "today"]
                words = re.findall(r"\b[a-zA-Z0-9]+\b", clean_msg)
                if any(u in words for u in duration_units):
                    state["duration"] = user_message.strip(" .,")

    # Assess priority
    priority, reason = assess_priority(state.get("category", "OTHER"), state.get("description", ""))
    state["priority"] = priority
    state["priority_reason"] = reason
    state["language"] = active_lang

    # Determine remaining missing fields
    missing_fields = []
    if not state.get("location") and not state.get("landmark"):
        missing_fields.append("location")
    if not state.get("duration"):
        missing_fields.append("duration")

    state["missing_information"] = missing_fields

    # Generate follow up
    reply, is_ready = generate_follow_up(missing_fields, active_lang, state)
    state["needs_confirmation"] = is_ready
    state["is_ready_to_submit"] = False

    return {
        "reply": reply,
        "draft": state,
        "detected_language": active_lang,
        "is_ready_to_submit": False,
        "needs_confirmation": is_ready
    }
