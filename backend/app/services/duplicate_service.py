import re
from datetime import datetime, timedelta, timezone
from typing import List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from app.models.complaint import Complaint

def normalize_text(text: str) -> str:
    """Lowercases, removes punctuation, and strips whitespace."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return " ".join(text.split())

def calculate_jaccard_similarity(text1: str, text2: str) -> float:
    """Calculates token overlap (Jaccard index)."""
    tokens1 = set(normalize_text(text1).split())
    tokens2 = set(normalize_text(text2).split())
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return len(intersection) / len(union)

def location_overlap_score(loc1: str, loc2: str, land1: str = "", land2: str = "") -> float:
    """Scores geographical proximity based on area/street name matching."""
    s1 = f"{normalize_text(loc1)} {normalize_text(land1)}"
    s2 = f"{normalize_text(loc2)} {normalize_text(land2)}"
    return calculate_jaccard_similarity(s1, s2)

class DuplicateDetectionService:
    SIMILARITY_THRESHOLD = 0.55
    TIME_WINDOW_DAYS = 30

    @classmethod
    def check_for_duplicates(
        cls,
        db: Session,
        category: str,
        description: str,
        location: str,
        landmark: str = ""
    ) -> Dict[str, Any]:
        """
        Scans active complaints in the last 30 days with the same category
        and computes similarity across description and location.
        """
        since_date = datetime.now(timezone.utc) - timedelta(days=cls.TIME_WINDOW_DAYS)

        # Query active complaints in same category within time window
        candidates = db.query(Complaint).filter(
            Complaint.category == category,
            Complaint.status.in_(["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLUTION_PENDING_VERIFICATION", "REOPENED"]),
            Complaint.created_at >= since_date
        ).all()

        matches = []
        highest_score = 0.0

        for cand in candidates:
            # Description similarity (weight 0.45)
            desc_sim = calculate_jaccard_similarity(description, cand.description)
            # Location similarity (weight 0.55)
            loc_sim = location_overlap_score(location, cand.location, landmark, cand.landmark or "")

            combined_score = (desc_sim * 0.45) + (loc_sim * 0.55)

            if combined_score >= cls.SIMILARITY_THRESHOLD:
                if combined_score > highest_score:
                    highest_score = combined_score
                matches.append({
                    "complaint_id": cand.complaint_id,
                    "title": cand.title,
                    "category": cand.category,
                    "location": cand.location,
                    "similarity_score": round(combined_score, 2),
                    "created_at": cand.created_at
                })

        # Sort matches by similarity score descending
        matches.sort(key=lambda m: m["similarity_score"], reverse=True)

        is_duplicate = len(matches) > 0
        message = ""
        if is_duplicate:
            top = matches[0]
            message = (
                f"Notice: A similar grievance (#{top['complaint_id']}) was recently reported at '{top['location']}'. "
                f"You may still proceed with submitting your grievance if this is a recurring or distinct incident."
            )
        else:
            message = "No matching grievances found nearby. Proceeding with registration."

        return {
            "is_duplicate_likely": is_duplicate,
            "highest_score": round(highest_score, 2),
            "matches": matches[:3],  # top 3 matches
            "message": message
        }

duplicate_service = DuplicateDetectionService()
