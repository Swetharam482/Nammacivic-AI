from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class GeocodeQuery(BaseModel):
    address: str = Field(..., min_length=2, max_length=300, description="Address or landmark to geocode")
    country_code: Optional[str] = Field("in", description="Country filter code (e.g. 'in' for India)")

class GeocodeMatch(BaseModel):
    display_address: str = Field(..., description="Full display address from OpenStreetMap Nominatim")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    place_id: Optional[int] = None
    osm_type: Optional[str] = None
    osm_id: Optional[int] = None
    category: Optional[str] = None
    type: Optional[str] = None
    importance: Optional[float] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postcode: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class GeocodeResponse(BaseModel):
    query: str
    provider: str = "OpenStreetMap Nominatim"
    attribution: str = "Location data © OpenStreetMap contributors (ODbL 1.0)"
    matches: List[GeocodeMatch] = Field(default_factory=list, description="Up to 3 matching locations")
    message: str
    status: str = "success"  # "success", "no_results", "service_unavailable", "rate_limited", "invalid_input"
    from_cache: bool = False

    model_config = ConfigDict(from_attributes=True)

class ConfirmedLocation(BaseModel):
    display_address: str
    latitude: float
    longitude: float
    place_id: Optional[int] = None
    landmark: Optional[str] = None
