"""
NammaCivic AI - Comprehensive Address Verification & Geolocation Service
Implements multi-level progressive geocoding fallback:
Level 1: Full Composite Address (Door + Street + Locality + City + District + State)
Level 2: Street + Locality + City + District
Level 3: Street + City + District
Level 4: Locality + City + District
Level 5: Landmark + City + District
Level 6: City/Town + District (e.g., Sulur, Coimbatore -> finds Sulur, Coimbatore!)
Level 7: Town/District Center Pin Drop with Reverse Geocoding
"""

import logging
from typing import Dict, Any, List, Optional, Tuple
from app.services.geocoding_service import geocoding_service
from app.schemas.address import (
    AddressCandidate, 
    AddressVerifyResponse, 
    AddressSuggestionResponse,
    ReverseGeocodeResponse
)

logger = logging.getLogger(__name__)

# Coordinates and zoom levels for major cities, taluks, and districts across Tamil Nadu
TAMIL_NADU_DISTRICT_CENTERS: Dict[str, Dict[str, Any]] = {
    # Major Taluks & Municipalities
    "sulur": {"lat": 11.0268, "lng": 77.1258, "zoom": 14},
    "tambaram": {"lat": 12.9249, "lng": 80.1000, "zoom": 13},
    "avadi": {"lat": 13.1147, "lng": 80.1018, "zoom": 13},
    "pollachi": {"lat": 10.6609, "lng": 77.0048, "zoom": 13},
    "hosur": {"lat": 12.7409, "lng": 77.8253, "zoom": 13},
    "mettupalayam": {"lat": 11.3000, "lng": 76.9500, "zoom": 13},
    "annur": {"lat": 11.2333, "lng": 77.1333, "zoom": 13},
    
    # 38 Districts of Tamil Nadu
    "coimbatore": {"lat": 11.0168, "lng": 76.9558, "zoom": 13},
    "chennai": {"lat": 13.0827, "lng": 80.2707, "zoom": 13},
    "madurai": {"lat": 9.9252, "lng": 78.1198, "zoom": 13},
    "tiruchirappalli": {"lat": 10.7905, "lng": 78.7047, "zoom": 13},
    "trichy": {"lat": 10.7905, "lng": 78.7047, "zoom": 13},
    "salem": {"lat": 11.6643, "lng": 78.1460, "zoom": 13},
    "tirunelveli": {"lat": 8.7139, "lng": 77.7567, "zoom": 13},
    "tiruppur": {"lat": 11.1085, "lng": 77.3411, "zoom": 13},
    "erode": {"lat": 11.3410, "lng": 77.7172, "zoom": 13},
    "vellore": {"lat": 12.9165, "lng": 79.1325, "zoom": 13},
    "chengalpattu": {"lat": 12.6841, "lng": 79.9836, "zoom": 13},
    "kanchipuram": {"lat": 12.8342, "lng": 79.7036, "zoom": 13},
    "tiruvallur": {"lat": 13.1432, "lng": 79.9079, "zoom": 13},
    "dindigul": {"lat": 10.3673, "lng": 77.9803, "zoom": 13},
    "thanjavur": {"lat": 10.7870, "lng": 79.1378, "zoom": 13},
    "ranipet": {"lat": 12.9272, "lng": 79.3330, "zoom": 13},
    "cuddalore": {"lat": 11.7480, "lng": 79.7714, "zoom": 13},
    "villupuram": {"lat": 11.9401, "lng": 79.4861, "zoom": 13},
    "nagapattinam": {"lat": 10.7672, "lng": 79.8449, "zoom": 13},
    "kanyakumari": {"lat": 8.0883, "lng": 77.5385, "zoom": 13},
    "thoothukudi": {"lat": 8.7642, "lng": 78.1348, "zoom": 13},
    "karur": {"lat": 10.9601, "lng": 78.0766, "zoom": 13},
    "namakkal": {"lat": 11.2189, "lng": 78.1674, "zoom": 13},
    "sivaganga": {"lat": 9.8433, "lng": 78.4809, "zoom": 13},
    "pudukkottai": {"lat": 10.3797, "lng": 78.8208, "zoom": 13},
    "krishnagiri": {"lat": 12.5186, "lng": 78.2137, "zoom": 13},
    "dharmapuri": {"lat": 12.1211, "lng": 78.1582, "zoom": 13},
    "ariyalur": {"lat": 11.1401, "lng": 79.0786, "zoom": 13},
    "perambalur": {"lat": 11.2342, "lng": 78.8820, "zoom": 13},
    "tiruvannamalai": {"lat": 12.2253, "lng": 79.0747, "zoom": 13},
    "ramanathapuram": {"lat": 9.3639, "lng": 78.8395, "zoom": 13},
    "theni": {"lat": 10.0104, "lng": 77.4768, "zoom": 13},
    "virudhunagar": {"lat": 9.5680, "lng": 77.9624, "zoom": 13},
    "tenkasi": {"lat": 8.9594, "lng": 77.3150, "zoom": 13},
    "mayiladuthurai": {"lat": 11.1075, "lng": 79.6522, "zoom": 13},
    "kallakurichi": {"lat": 11.7383, "lng": 78.9639, "zoom": 13},
    "tirupathur": {"lat": 12.4960, "lng": 78.5678, "zoom": 13},
    "nilgiris": {"lat": 11.4102, "lng": 76.6950, "zoom": 13},
    "ooty": {"lat": 11.4102, "lng": 76.6950, "zoom": 13},
    "default": {"lat": 11.0168, "lng": 76.9558, "zoom": 12}  # Default Coimbatore/neutral Tamil Nadu center
}

def get_town_center(town_or_city: Optional[str], district: Optional[str] = None) -> Dict[str, Any]:
    """Finds town center coordinates by town, taluk, or district."""
    # 1. Check town/city directly
    if town_or_city:
        t_clean = town_or_city.strip().lower()
        for key, center in TAMIL_NADU_DISTRICT_CENTERS.items():
            if key == t_clean or key in t_clean or t_clean in key:
                return center

    # 2. Check district directly
    if district:
        d_clean = district.strip().lower()
        for key, center in TAMIL_NADU_DISTRICT_CENTERS.items():
            if key == d_clean or key in d_clean or d_clean in key:
                return center

    # 3. Dynamic lookup via geocoder for town if not in static dict
    lookup_target = town_or_city or district
    if lookup_target and len(lookup_target.strip()) >= 3:
        try:
            res = geocoding_service.lookup_address(f"{lookup_target.strip()}, Tamil Nadu", limit=1)
            if res.status == "success" and res.matches:
                m = res.matches[0]
                return {"lat": m.latitude, "lng": m.longitude, "zoom": 14}
        except Exception:
            pass

    return TAMIL_NADU_DISTRICT_CENTERS["default"]

def is_location_in_target_region(match_address: str, target_city: Optional[str], target_district: Optional[str]) -> bool:
    """Verifies location is in India/Tamil Nadu and related to target city/district."""
    addr_lower = match_address.lower()
    is_india = "india" in addr_lower or "tamil nadu" in addr_lower
    if not is_india:
        return False
    # If target city or district specified, check relevance
    if target_city and target_city.lower() in addr_lower:
        return True
    if target_district and target_district.lower() in addr_lower:
        return True
    return True


class AddressVerificationService:
    def verify_address(
        self, 
        address: Optional[str] = None, 
        landmark: Optional[str] = None, 
        door_number: Optional[str] = None,
        street_name: Optional[str] = None,
        area_locality: Optional[str] = None,
        city_town: Optional[str] = None,
        district: Optional[str] = None,
        state: Optional[str] = "Tamil Nadu",
        country: Optional[str] = "India",
        country_code: str = "in"
    ) -> AddressVerifyResponse:
        """
        Executes multi-level progressive address geocoding fallback:
        1. Full address (Door + Street + Locality + City + District + State + Country)
        2. Street + Locality + City + District
        3. Street + City + District
        4. Locality + City + District
        5. Landmark + City + District
        6. City/Town + District (e.g. Sulur, Coimbatore)
        7. Town Center fallback with manual map pin confirmation
        """
        clean_door = (door_number or "").strip()
        clean_street = (street_name or "").strip()
        clean_area = (area_locality or "").strip()
        clean_city = (city_town or "").strip()
        clean_district = (district or "").strip()
        clean_state = (state or "Tamil Nadu").strip()
        clean_country = (country or "India").strip()
        clean_landmark = (landmark or "").strip()
        composite_address = (address or "").strip()

        # Step 0: Determine town center
        effective_town = clean_city or clean_district or "Coimbatore"
        town_center = get_town_center(clean_city, clean_district)

        # Build progressive search queries in order of highest to lowest specificity
        progressive_queries: List[Tuple[str, str, str]] = []  # (query_string, fallback_level, specificity)

        # Level 1: Full Composite query
        if composite_address:
            progressive_queries.append((composite_address, "exact", "exact"))
        else:
            full_parts = [clean_door, clean_street, clean_area, clean_city, clean_district, clean_state, clean_country]
            full_str = ", ".join([p for p in full_parts if p])
            if full_str:
                progressive_queries.append((full_str, "exact", "exact"))

        # Level 2: Street + Locality + City + District
        if clean_street and clean_area and (clean_city or clean_district):
            parts2 = [clean_street, clean_area, clean_city, clean_district, clean_state]
            progressive_queries.append((", ".join([p for p in parts2 if p]), "street_locality", "street"))

        # Level 3: Street + City + District
        if clean_street and (clean_city or clean_district):
            parts3 = [clean_street, clean_city, clean_district, clean_state]
            progressive_queries.append((", ".join([p for p in parts3 if p]), "street_city", "street"))

        # Level 4: Locality + City + District
        if clean_area and (clean_city or clean_district):
            parts4 = [clean_area, clean_city, clean_district, clean_state]
            progressive_queries.append((", ".join([p for p in parts4 if p]), "locality_city", "locality"))

        # Level 5: Landmark + City + District
        if clean_landmark and (clean_city or clean_district):
            parts5 = [clean_landmark, clean_city, clean_district, clean_state]
            progressive_queries.append((", ".join([p for p in parts5 if p]), "landmark_city", "landmark"))

        # Level 6: City/Town + District (e.g. Sulur, Coimbatore, Tamil Nadu)
        if clean_city:
            parts6 = [clean_city, clean_district, clean_state, clean_country]
            progressive_queries.append((", ".join([p for p in parts6 if p]), "city_town", "city"))
        elif clean_district:
            progressive_queries.append((f"{clean_district}, {clean_state}, {clean_country}", "city_town", "district"))

        last_provider = "Google Maps"
        last_attribution = None

        # Execute progressive search
        for query_str, fallback_level, expected_spec in progressive_queries:
            if not query_str or len(query_str.strip()) < 3:
                continue

            geo_res = geocoding_service.lookup_address(query_str, country_code=country_code, limit=3)
            last_provider = geo_res.provider
            last_attribution = geo_res.attribution

            if geo_res.status == "success" and geo_res.matches:
                valid_candidates: List[AddressCandidate] = []
                for m in geo_res.matches:
                    if is_location_in_target_region(m.display_address, clean_city, clean_district):
                        valid_candidates.append(AddressCandidate(
                            display_address=m.display_address,
                            latitude=m.latitude,
                            longitude=m.longitude,
                            specificity=expected_spec,
                            place_id=m.place_id,
                            osm_id=m.osm_id,
                            city=m.city or clean_city,
                            district=clean_district,
                            state=m.state or clean_state,
                            postcode=m.postcode,
                            formatted_address=m.display_address
                        ))

                if valid_candidates:
                    top_match = valid_candidates[0]
                    # Assign verification status based on match level
                    if fallback_level in ("exact", "street_locality", "street_city"):
                        assigned_status = "NEEDS_CONFIRMATION"
                        msg = f"Located on {clean_street or 'street'} in {clean_city or clean_district}. Please confirm your location on the map."
                    elif fallback_level in ("locality_city", "landmark_city"):
                        assigned_status = "NEEDS_CONFIRMATION"
                        msg = f"Matched locality near {clean_area or clean_landmark} in {clean_city or clean_district}. Please review the map pin and click 'Confirm Location'."
                    else:
                        # Matched town/city (e.g., Sulur, Coimbatore)
                        assigned_status = "NEEDS_CONFIRMATION"
                        msg = f"Map centered on {clean_city or clean_district}. Please tap on the map or drag the pin to your exact grievance street and confirm."

                    return AddressVerifyResponse(
                        query=query_str,
                        status=assigned_status,
                        fallback_level=fallback_level,
                        default_center={"lat": top_match.latitude, "lng": top_match.longitude, "zoom": 15},
                        message=msg,
                        candidates=valid_candidates,
                        best_match=top_match,
                        provider=last_provider,
                        attribution=last_attribution
                    )

        # Level 7: Town Center Fallback (Coordinates derived from clean_city / clean_district)
        town_name = clean_city or clean_district or "your area"
        return AddressVerifyResponse(
            query=composite_address or f"{clean_street}, {clean_area}, {clean_city}",
            status="NEEDS_CONFIRMATION",
            fallback_level="town_center",
            default_center=town_center,
            message=f"Exact address not found automatically. Map is centered on {town_name}. Tap on the map to place your pin and click 'Confirm Location'.",
            candidates=[],
            best_match=None,
            provider=last_provider,
            attribution=last_attribution
        )

    def reverse_geocode(self, latitude: float, longitude: float) -> ReverseGeocodeResponse:
        """Reverse geocodes a manually clicked or dragged map pin."""
        rev_data = geocoding_service.reverse_geocode(latitude, longitude)
        if rev_data:
            formatted = rev_data.get("formatted_address") or f"Location at {latitude:.5f}, {longitude:.5f}"
            return ReverseGeocodeResponse(
                formatted_address=formatted,
                display_address=formatted,
                latitude=latitude,
                longitude=longitude,
                door_number=rev_data.get("door_number"),
                street=rev_data.get("street"),
                area=rev_data.get("area"),
                city=rev_data.get("city"),
                district=rev_data.get("district"),
                state=rev_data.get("state"),
                postcode=rev_data.get("postcode"),
                provider=rev_data.get("provider", "Google Maps"),
                attribution=rev_data.get("attribution")
            )

        fallback_addr = f"Selected Map Location ({latitude:.5f}, {longitude:.5f})"
        return ReverseGeocodeResponse(
            formatted_address=fallback_addr,
            display_address=fallback_addr,
            latitude=latitude,
            longitude=longitude,
            provider="Civic Geolocation",
            attribution=None
        )

    def get_suggestions(self, query: str, country_code: str = "in") -> AddressSuggestionResponse:
        res = geocoding_service.search_address(query, country_code=country_code, limit=5)
        suggestions: List[AddressCandidate] = []
        for m in res.matches:
            suggestions.append(AddressCandidate(
                display_address=m.display_address,
                latitude=m.latitude,
                longitude=m.longitude,
                city=m.city,
                state=m.state,
                postcode=m.postcode,
                place_id=m.place_id,
                osm_id=m.osm_id
            ))
        return AddressSuggestionResponse(query=query, suggestions=suggestions)


address_verification_service = AddressVerificationService()
