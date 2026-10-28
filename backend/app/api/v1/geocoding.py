from typing import Optional
from fastapi import APIRouter, Query, HTTPException, status
from app.schemas.geocoding import GeocodeQuery, GeocodeResponse
from app.services.geocoding_service import geocoding_service

router = APIRouter()

@router.get("/search", response_model=GeocodeResponse, summary="Search address via OpenStreetMap Nominatim")
def search_address_get(
    q: str = Query(..., min_length=1, max_length=300, description="Address, street, area, or landmark to look up"),
    country_code: Optional[str] = Query("in", description="Country code filter (defaults to India 'in')")
):
    """
    Looks up matching civic addresses using free OpenStreetMap Nominatim service.
    - No Google Maps API key or billing required.
    - Returns up to 3 candidate matches with display address, latitude, and longitude.
    - Rate limited to maximum 1 req/sec in accordance with OSM Nominatim usage policy.
    - Cached transparently to avoid redundant requests.
    - Personal info (phone, email) is automatically stripped.
    """
    clean_q = q.strip()
    if not clean_q or len(clean_q) < 2:
        return GeocodeResponse(
            query=q,
            provider="OpenStreetMap Nominatim",
            matches=[],
            status="no_results",
            message="Please provide a more descriptive street, area, or landmark name.",
            from_cache=False
        )

    return geocoding_service.lookup_address(
        address=clean_q,
        country_code=country_code,
        limit=3
    )


@router.post("/search", response_model=GeocodeResponse, summary="Search address via OpenStreetMap Nominatim (POST)")
def search_address_post(req: GeocodeQuery):
    """
    POST variant for address lookup via OpenStreetMap Nominatim.
    Accepts JSON body: { "address": "Anna Nagar 4th Main Road", "country_code": "in" }
    """
    clean_addr = req.address.strip()
    if not clean_addr or len(clean_addr) < 2:
        return GeocodeResponse(
            query=req.address,
            provider="OpenStreetMap Nominatim",
            matches=[],
            status="no_results",
            message="Please provide a more descriptive street, area, or landmark name.",
            from_cache=False
        )

    return geocoding_service.lookup_address(
        address=clean_addr,
        country_code=req.country_code or "in",
        limit=3
    )
