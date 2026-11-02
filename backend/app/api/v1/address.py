from fastapi import APIRouter, HTTPException
from app.schemas.address import (
    AddressVerifyRequest,
    AddressVerifyResponse,
    AddressSuggestionRequest,
    AddressSuggestionResponse,
    ReverseGeocodeRequest,
    ReverseGeocodeResponse
)
from app.services.address_service import address_verification_service

router = APIRouter()

@router.post("/verify", response_model=AddressVerifyResponse, summary="Verify address with progressive multi-level fallback")
def verify_address_endpoint(req: AddressVerifyRequest):
    return address_verification_service.verify_address(
        address=req.address,
        landmark=req.landmark,
        door_number=req.door_number,
        street_name=req.street_name,
        area_locality=req.area_locality,
        city_town=req.city_town,
        district=req.district,
        state=req.state or "Tamil Nadu",
        country=req.country or "India",
        country_code=req.country_code or "in"
    )

@router.post("/reverse", response_model=ReverseGeocodeResponse, summary="Reverse geocode map coordinates")
def reverse_geocode_endpoint(req: ReverseGeocodeRequest):
    return address_verification_service.reverse_geocode(
        latitude=req.latitude,
        longitude=req.longitude
    )

@router.post("/suggestions", response_model=AddressSuggestionResponse, summary="Autocomplete address suggestions")
def get_address_suggestions(req: AddressSuggestionRequest):
    return address_verification_service.get_suggestions(
        query=req.query,
        country_code=req.country_code or "in"
    )
