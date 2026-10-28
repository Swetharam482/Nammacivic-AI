import time
from unittest.mock import patch, MagicMock
import httpx
import pytest
from app.services.geocoding_service import (
    NominatimGeocodingProvider,
    GeocodingService,
    MockGeocodingProvider,
    sanitize_geocoding_query,
    GeocodingCache
)
from app.schemas.geocoding import GeocodeMatch, GeocodeResponse


# 1. Tests for Query Privacy Sanitization
def test_sanitize_geocoding_query_removes_pii():
    raw_query = "My name is Priya, phone +91 9876543210, email citizen@example.com, address: Anna Nagar 2nd Avenue"
    sanitized = sanitize_geocoding_query(raw_query)
    
    assert "+91 9876543210" not in sanitized
    assert "9876543210" not in sanitized
    assert "citizen@example.com" not in sanitized
    assert "Anna Nagar 2nd Avenue" in sanitized


def test_sanitize_geocoding_query_empty_or_short():
    assert sanitize_geocoding_query("") == ""
    assert sanitize_geocoding_query("   ") == ""
    assert sanitize_geocoding_query("a") == "a"


# 2. Test for Caching Layer
def test_geocoding_cache_hits_and_misses():
    cache = GeocodingCache(default_ttl_seconds=10)
    assert cache.get("Anna Nagar", "in") is None

    sample_resp = GeocodeResponse(
        query="Anna Nagar",
        provider="OpenStreetMap Nominatim",
        attribution="Location data © OpenStreetMap contributors (ODbL 1.0)",
        matches=[
            GeocodeMatch(
                display_address="Anna Nagar, Chennai, Tamil Nadu, India",
                latitude=13.0850,
                longitude=80.2101
            )
        ],
        message="Found 1 matching location.",
        status="success",
        from_cache=False
    )
    cache.set("Anna Nagar", sample_resp, "in")

    hit = cache.get("anna nagar", "in")
    assert hit is not None
    assert hit.from_cache is True
    assert hit.matches[0].latitude == 13.0850


# 3. Test for Successful Single Match via Nominatim Provider
def test_nominatim_single_successful_match():
    provider = NominatimGeocodingProvider()
    mock_osm_response = [
        {
            "place_id": 12345,
            "osm_type": "way",
            "osm_id": 67890,
            "lat": "13.085025",
            "lon": "80.210142",
            "display_name": "4th Main Road, Anna Nagar West, Chennai, Tamil Nadu, 600040, India",
            "category": "highway",
            "type": "residential",
            "importance": 0.65,
            "address": {
                "road": "4th Main Road",
                "suburb": "Anna Nagar West",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "postcode": "600040",
                "country": "India",
                "country_code": "in"
            }
        }
    ]

    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_osm_response
        mock_get.return_value = mock_resp

        result = provider.geocode("4th Main Road, Anna Nagar", country_code="in", limit=3)

        assert result.status == "success"
        assert len(result.matches) == 1
        assert result.matches[0].latitude == 13.085025
        assert result.matches[0].longitude == 80.210142
        assert "Anna Nagar West" in result.matches[0].display_address
        assert result.matches[0].city == "Chennai"
        assert result.matches[0].postcode == "600040"
        assert "OpenStreetMap" in result.attribution


# 4. Test for Multiple Results Capped at Maximum 3
def test_nominatim_multiple_results_capped_at_three():
    provider = NominatimGeocodingProvider()
    # Provide 5 mock results from OSM
    mock_osm_response = [
        {
            "place_id": i,
            "lat": f"13.0{i}",
            "lon": f"80.2{i}",
            "display_name": f"Location {i}, Chennai, Tamil Nadu, India",
            "address": {"city": "Chennai", "state": "Tamil Nadu"}
        }
        for i in range(1, 6)
    ]

    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_osm_response
        mock_get.return_value = mock_resp

        result = provider.geocode("Main Road, Chennai", country_code="in", limit=3)

        assert result.status == "success"
        assert len(result.matches) == 3  # Strictly capped at 3
        assert result.matches[0].display_address == "Location 1, Chennai, Tamil Nadu, India"
        assert result.matches[2].display_address == "Location 3, Chennai, Tamil Nadu, India"


# 5. Test for No Results Found (Citizen allowed to edit / provide landmark, not rejected)
def test_nominatim_no_results():
    provider = NominatimGeocodingProvider()
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = []
        mock_get.return_value = mock_resp

        result = provider.geocode("Nonexistent Unknown Alien Colony 9999", country_code="in")

        assert result.status == "no_results"
        assert len(result.matches) == 0
        assert "landmark" in result.message.lower() or "edit" in result.message.lower()


# 6. Test for Service Errors (503 / Network Error / Timeout Handled Gracefully)
def test_nominatim_service_error_503():
    provider = NominatimGeocodingProvider()
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 503
        mock_get.return_value = mock_resp

        result = provider.geocode("Anna Nagar", country_code="in")

        assert result.status == "service_error"
        assert len(result.matches) == 0
        assert "manual address" in result.message.lower()


def test_nominatim_service_timeout_handled_gracefully():
    provider = NominatimGeocodingProvider()
    with patch("httpx.Client.get") as mock_get:
        mock_get.side_effect = httpx.TimeoutException("Connection timed out")

        result = provider.geocode("Anna Nagar", country_code="in")

        assert result.status == "service_unavailable"
        assert len(result.matches) == 0
        assert "timed out" in result.message.lower() or "submit directly" in result.message.lower()


def test_nominatim_rate_limit_429_handled_gracefully():
    provider = NominatimGeocodingProvider()
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 429
        mock_get.return_value = mock_resp

        result = provider.geocode("Anna Nagar", country_code="in")

        assert result.status == "rate_limited"
        assert len(result.matches) == 0
        assert "busy" in result.message.lower() or "proceed" in result.message.lower()


# 7. Test Country Code Parameter Sent to OpenStreetMap
def test_nominatim_country_code_parameter():
    provider = NominatimGeocodingProvider(country_code="in")
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = []
        mock_get.return_value = mock_resp

        provider.geocode("Velachery", country_code="in")

        mock_get.assert_called_once()
        _, kwargs = mock_get.call_args
        assert kwargs["params"]["countrycodes"] == "in"
        assert kwargs["params"]["format"] == "jsonv2"
        assert kwargs["headers"]["User-Agent"] is not None


# 8. API Endpoint Tests via FastAPI TestClient
def test_api_geocoding_search_get(client):
    with patch("app.services.geocoding_service.geocoding_service.lookup_address") as mock_lookup:
        mock_lookup.return_value = GeocodeResponse(
            query="Anna Nagar",
            provider="OpenStreetMap Nominatim",
            attribution="Location data © OpenStreetMap contributors (ODbL 1.0)",
            matches=[
                GeocodeMatch(
                    display_address="Anna Nagar, Chennai, Tamil Nadu, 600040, India",
                    latitude=13.0850,
                    longitude=80.2101,
                    city="Chennai",
                    state="Tamil Nadu",
                    postcode="600040"
                )
            ],
            message="Found 1 matching location.",
            status="success",
            from_cache=False
        )

        resp = client.get("/api/v1/geocoding/search?q=Anna+Nagar")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert len(data["matches"]) == 1
        assert data["matches"][0]["latitude"] == 13.0850
        assert "OpenStreetMap" in data["attribution"]


def test_api_geocoding_search_post(client):
    with patch("app.services.geocoding_service.geocoding_service.lookup_address") as mock_lookup:
        mock_lookup.return_value = GeocodeResponse(
            query="Velachery Main Road",
            provider="OpenStreetMap Nominatim",
            attribution="Location data © OpenStreetMap contributors (ODbL 1.0)",
            matches=[
                GeocodeMatch(
                    display_address="Velachery Main Road, Chennai, Tamil Nadu, 600042, India",
                    latitude=12.9815,
                    longitude=80.2180,
                    city="Chennai",
                    state="Tamil Nadu",
                    postcode="600042"
                )
            ],
            message="Found 1 matching location.",
            status="success",
            from_cache=False
        )

        resp = client.post("/api/v1/geocoding/search", json={"address": "Velachery Main Road", "country_code": "in"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert data["matches"][0]["longitude"] == 80.2180


# 9. Test Complaint Submission with Confirmed Geocoded Coordinates
def test_complaint_submission_with_geocoded_coordinates(client):
    payload = {
        "title": "Streetlight failure on 4th Main Road",
        "description": "Three continuous streetlights are dark and causing serious hazard.",
        "category": "STREETLIGHT",
        "location": "4th Main Road, Anna Nagar West",
        "landmark": "Near School",
        "duration": "2 days",
        "latitude": 13.085025,
        "longitude": 80.210142,
        "geocoded_address": "4th Main Road, Anna Nagar West, Chennai, Tamil Nadu, 600040, India"
    }

    res = client.post("/api/v1/grievances", json=payload)
    assert res.status_code == 201
    created = res.json()
    assert created["latitude"] == 13.085025
    assert created["longitude"] == 80.210142
    assert created["geocoded_address"] == "4th Main Road, Anna Nagar West, Chennai, Tamil Nadu, 600040, India"


# 10. Test Complaint Submission Without Geocoded Match (Must Not Reject Genuine Complaints)
def test_complaint_submission_without_geocoded_match(client):
    # If no match found, citizen submits with manual location and landmark
    payload = {
        "title": "Garbage dump near village pond",
        "description": "Uncollected domestic garbage dumping along the pond bund road.",
        "category": "GARBAGE",
        "location": "Unnamed village interior lane",
        "landmark": "Next to Mariamman Temple Pond",
        "duration": "5 days",
        "latitude": None,
        "longitude": None
    }

    res = client.post("/api/v1/grievances", json=payload)
    assert res.status_code == 201
    created = res.json()
    assert created["status"] == "SUBMITTED"
    assert created["location"] == "Unnamed village interior lane"
    assert created["landmark"] == "Next to Mariamman Temple Pond"
    assert created["latitude"] is None
