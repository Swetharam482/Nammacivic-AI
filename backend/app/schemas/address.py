from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class AddressVerifyRequest(BaseModel):
    address: Optional[str] = Field(None, description="Full or partial composite address string")
    landmark: Optional[str] = Field(None, description="Optional nearby landmark")
    door_number: Optional[str] = Field(None, description="Door, flat, or plot number")
    street_name: Optional[str] = Field(None, description="Street name, road, or avenue")
    area_locality: Optional[str] = Field(None, description="Area, colony, or locality")
    city_town: Optional[str] = Field(None, description="City or Town (e.g., Chennai, Coimbatore)")
    district: Optional[str] = Field(None, description="District name")
    state: Optional[str] = Field("Tamil Nadu", description="State name")
    country: Optional[str] = Field("India", description="Country name")
    pincode: Optional[str] = Field(None, description="Postal / Pincode")
    country_code: Optional[str] = Field("in", description="Country filter code (default 'in')")

class AddressCandidate(BaseModel):
    display_address: str
    latitude: float
    longitude: float
    specificity: str = "street"  # "exact", "street", "landmark", "locality", "city", "town_center"
    osm_id: Optional[int] = None
    place_id: Optional[Any] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    postcode: Optional[str] = None
    formatted_address: Optional[str] = None

class AddressVerifyResponse(BaseModel):
    query: str
    status: str  # "VERIFIED", "MANUAL_CONFIRMED", "NEEDS_CONFIRMATION", "PARTIALLY_MATCHED", "NOT_FOUND", "AMBIGUOUS", "PROVIDER_UNAVAILABLE"
    message: str
    candidates: List[AddressCandidate] = Field(default_factory=list)
    best_match: Optional[AddressCandidate] = None
    default_center: Optional[Dict[str, float]] = None  # {"lat": 13.0827, "lng": 80.2707, "zoom": 13}
    fallback_level: Optional[str] = None  # "exact", "street_locality", "locality_city", "landmark_city", "town_center", "manual"
    provider: str = "Google Maps"
    attribution: Optional[str] = None

class AddressSuggestionRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=200)
    country_code: Optional[str] = "in"

class AddressSuggestionResponse(BaseModel):
    query: str
    suggestions: List[AddressCandidate] = Field(default_factory=list)

class ReverseGeocodeRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)

class ReverseGeocodeResponse(BaseModel):
    formatted_address: str
    display_address: str
    latitude: float
    longitude: float
    door_number: Optional[str] = None
    street: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    postcode: Optional[str] = None
    provider: str = "Google Maps"
    attribution: Optional[str] = None
