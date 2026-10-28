import re
import time
import threading
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Tuple
import httpx
from app.core.config import settings
from app.schemas.geocoding import GeocodeMatch, GeocodeResponse

# Sensitive data patterns to strip before sending to external geocoding service
PHONE_REGEX = re.compile(r'(?:\+?91[\s\-]?)?[6-9]\d{9}|\b\d{10}\b')
EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
AADHAAR_REGEX = re.compile(r'\b\d{4}\s?\d{4}\s?\d{4}\b')
CONVERSATIONAL_PREFIXES = re.compile(
    r'^(?:my\s+(?:address|location|place)\s+is|i\s+live\s+at|located\s+at|near\s+by|enga\s+area|enga\s+street)\s*[:,\-]?\s*',
    re.IGNORECASE
)

OSM_ATTRIBUTION = "Location data © OpenStreetMap contributors (ODbL 1.0)"

def sanitize_geocoding_query(query: str) -> str:
    """
    Sanitizes citizen address input to respect Nominatim policy:
    - Strips personal and confidential information (phone, email, ID numbers)
    - Strips conversational filler prefixes
    - Cleans extra whitespace and special characters
    """
    if not query:
        return ""
    
    cleaned = query.strip()
    # Remove emails and phone numbers
    cleaned = EMAIL_REGEX.sub("", cleaned)
    cleaned = PHONE_REGEX.sub("", cleaned)
    cleaned = AADHAAR_REGEX.sub("", cleaned)
    
    # Remove conversational filler prefixes
    cleaned = CONVERSATIONAL_PREFIXES.sub("", cleaned)
    
    # Clean up repeated punctuation or spaces
    cleaned = re.sub(r'[\r\n\t]+', ' ', cleaned)
    cleaned = re.sub(r'[,;\-]{2,}', ', ', cleaned)
    cleaned = re.sub(r'\s{2,}', ' ', cleaned)
    return cleaned.strip(" ,.-")


class GeocodingCache:
    """
    Thread-safe in-memory cache with TTL.
    Nominatim policy requires caching repeated lookups to avoid redundant requests.
    """
    def __init__(self, default_ttl_seconds: int = 86400):
        self._cache: Dict[str, Tuple[GeocodeResponse, float]] = {}
        self._lock = threading.Lock()
        self._default_ttl = default_ttl_seconds

    def _normalize_key(self, query: str, country_code: Optional[str]) -> str:
        cc = (country_code or "in").strip().lower()
        q = re.sub(r'\s+', ' ', query.strip().lower())
        return f"{cc}::{q}"

    def get(self, query: str, country_code: Optional[str] = None) -> Optional[GeocodeResponse]:
        key = self._normalize_key(query, country_code)
        now = time.time()
        with self._lock:
            if key in self._cache:
                response, expires_at = self._cache[key]
                if now < expires_at:
                    # Return copy with from_cache = True
                    cached_copy = response.model_copy(deep=True)
                    cached_copy.from_cache = True
                    return cached_copy
                else:
                    del self._cache[key]
        return None

    def set(self, query: str, response: GeocodeResponse, country_code: Optional[str] = None, ttl_seconds: Optional[int] = None):
        key = self._normalize_key(query, country_code)
        ttl = ttl_seconds if ttl_seconds is not None else self._default_ttl
        expires_at = time.time() + ttl
        with self._lock:
            # Store with from_cache = False in store
            stored = response.model_copy(deep=True)
            stored.from_cache = False
            self._cache[key] = (stored, expires_at)

    def clear(self):
        with self._lock:
            self._cache.clear()

    def size(self) -> int:
        with self._lock:
            return len(self._cache)


class BaseGeocodingProvider(ABC):
    """
    Abstract interface for geocoding providers.
    Enables swapping out OpenStreetMap Nominatim for another provider in future if needed.
    """
    @abstractmethod
    def geocode(
        self, 
        query: str, 
        country_code: Optional[str] = "in", 
        limit: int = 3
    ) -> GeocodeResponse:
        pass


class NominatimGeocodingProvider(BaseGeocodingProvider):
    """
    Official OpenStreetMap Nominatim geocoding provider.
    Fully adheres to OSM Nominatim Usage Policy:
    - Maximum 1 request per second enforced via thread-safe rate limiter
    - Identifiable custom User-Agent with project identity & contact info
    - OpenStreetMap attribution returned in all responses
    - Format: JSON (jsonv2)
    - Country code filtering (default: India 'in')
    - Maximum 3 matches returned
    - Non-blocking error handling for timeouts and network failures
    """
    _last_request_time: float = 0.0
    _rate_limit_lock = threading.Lock()

    def __init__(
        self,
        base_url: Optional[str] = None,
        user_agent: Optional[str] = None,
        country_code: Optional[str] = None,
        timeout_seconds: Optional[float] = None
    ):
        self.base_url = (base_url or settings.NOMINATIM_BASE_URL).rstrip("/")
        self.user_agent = user_agent or settings.NOMINATIM_USER_AGENT
        self.country_code = country_code or settings.GEOCODING_COUNTRY_CODE
        self.timeout_seconds = timeout_seconds or settings.GEOCODING_TIMEOUT_SECONDS

    def _wait_for_rate_limit(self):
        """
        Enforce Nominatim usage policy: maximum 1 request per second.
        """
        with NominatimGeocodingProvider._rate_limit_lock:
            now = time.time()
            elapsed = now - NominatimGeocodingProvider._last_request_time
            if elapsed < 1.0:
                time.sleep(1.0 - elapsed)
            NominatimGeocodingProvider._last_request_time = time.time()

    def geocode(
        self, 
        query: str, 
        country_code: Optional[str] = "in", 
        limit: int = 3
    ) -> GeocodeResponse:
        effective_country = country_code or self.country_code
        clean_query = sanitize_geocoding_query(query)

        if not clean_query or len(clean_query) < 2:
            return GeocodeResponse(
                query=query,
                provider="OpenStreetMap Nominatim",
                attribution=OSM_ATTRIBUTION,
                matches=[],
                status="no_results",
                message="The provided address is too short. Please provide a street name, area, or landmark.",
                from_cache=False
            )

        # Enforce maximum 1 req/sec before calling upstream Nominatim
        self._wait_for_rate_limit()

        params = {
            "q": clean_query,
            "format": "jsonv2",
            "limit": min(max(1, limit), 3),  # Return a maximum of 3 possible matches
            "addressdetails": 1,
            "accept-language": "en,ta"
        }

        if effective_country:
            params["countrycodes"] = effective_country.lower()

        headers = {
            "User-Agent": self.user_agent,
            "Accept": "application/json"
        }

        search_url = f"{self.base_url}/search"

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                resp = client.get(search_url, params=params, headers=headers)

                if resp.status_code == 429:
                    return GeocodeResponse(
                        query=clean_query,
                        provider="OpenStreetMap Nominatim",
                        attribution=OSM_ATTRIBUTION,
                        matches=[],
                        status="rate_limited",
                        message="OpenStreetMap Nominatim is currently busy. You can edit your address or proceed with your entered location.",
                        from_cache=False
                    )

                if resp.status_code != 200:
                    return GeocodeResponse(
                        query=clean_query,
                        provider="OpenStreetMap Nominatim",
                        attribution=OSM_ATTRIBUTION,
                        matches=[],
                        status="service_error",
                        message=f"OpenStreetMap service returned status {resp.status_code}. You may proceed with your manual address.",
                        from_cache=False
                    )

                raw_results = resp.json()

        except (httpx.TimeoutException, httpx.ConnectTimeout, httpx.ReadTimeout):
            return GeocodeResponse(
                query=clean_query,
                provider="OpenStreetMap Nominatim",
                attribution=OSM_ATTRIBUTION,
                matches=[],
                status="service_unavailable",
                message="Address lookup timed out. You may edit the address or submit directly with your manual location and landmark.",
                from_cache=False
            )
        except (httpx.RequestError, Exception) as exc:
            return GeocodeResponse(
                query=clean_query,
                provider="OpenStreetMap Nominatim",
                attribution=OSM_ATTRIBUTION,
                matches=[],
                status="service_unavailable",
                message="Address lookup service is currently unreachable. You can continue submitting your grievance with your manual address.",
                from_cache=False
            )

        if not isinstance(raw_results, list) or len(raw_results) == 0:
            return GeocodeResponse(
                query=clean_query,
                provider="OpenStreetMap Nominatim",
                attribution=OSM_ATTRIBUTION,
                matches=[],
                status="no_results",
                message="No matching location found on OpenStreetMap. You can edit the address, add a nearby landmark, or proceed with your reported address.",
                from_cache=False
            )

        matches: List[GeocodeMatch] = []
        for item in raw_results[:3]:
            try:
                addr_info = item.get("address", {})
                city = (
                    addr_info.get("city") 
                    or addr_info.get("town") 
                    or addr_info.get("suburb") 
                    or addr_info.get("county") 
                    or addr_info.get("state_district")
                )
                state = addr_info.get("state")
                postcode = addr_info.get("postcode")

                matches.append(GeocodeMatch(
                    display_address=item.get("display_name", ""),
                    latitude=float(item.get("lat", 0.0)),
                    longitude=float(item.get("lon", 0.0)),
                    place_id=item.get("place_id"),
                    osm_type=item.get("osm_type"),
                    osm_id=item.get("osm_id"),
                    category=item.get("category"),
                    type=item.get("type"),
                    importance=float(item.get("importance", 0.0)) if item.get("importance") is not None else None,
                    city=city,
                    state=state,
                    postcode=postcode
                ))
            except (ValueError, TypeError):
                continue

        if not matches:
            return GeocodeResponse(
                query=clean_query,
                provider="OpenStreetMap Nominatim",
                attribution=OSM_ATTRIBUTION,
                matches=[],
                status="no_results",
                message="No valid coordinate matches could be parsed. You can edit your address or provide a landmark.",
                from_cache=False
            )

        count = len(matches)
        msg = f"Found {count} matching location{'s' if count > 1 else ''}. Please confirm the correct match before saving."
        return GeocodeResponse(
            query=clean_query,
            provider="OpenStreetMap Nominatim",
            attribution=OSM_ATTRIBUTION,
            matches=matches,
            status="success",
            message=msg,
            from_cache=False
        )


class MockGeocodingProvider(BaseGeocodingProvider):
    """
    Mock geocoding provider for testing and deterministic offline verification.
    """
    def __init__(self, canned_responses: Optional[Dict[str, List[Dict[str, Any]]]] = None):
        self.canned = canned_responses or {}

    def geocode(
        self, 
        query: str, 
        country_code: Optional[str] = "in", 
        limit: int = 3
    ) -> GeocodeResponse:
        clean = sanitize_geocoding_query(query)
        if not clean or len(clean) < 2:
            return GeocodeResponse(
                query=query,
                provider="Mock Geocoding Provider",
                attribution=OSM_ATTRIBUTION,
                matches=[],
                status="no_results",
                message="Address is too short.",
                from_cache=False
            )

        if "error" in clean.lower():
            return GeocodeResponse(
                query=clean,
                provider="Mock Geocoding Provider",
                attribution=OSM_ATTRIBUTION,
                matches=[],
                status="service_unavailable",
                message="Mock service simulated network failure.",
                from_cache=False
            )

        results = self.canned.get(clean.lower())
        if results is None:
            # Fallback mock for standard queries
            if "anna nagar" in clean.lower():
                matches = [
                    GeocodeMatch(
                        display_address="Anna Nagar, Chennai, Tamil Nadu, 600040, India",
                        latitude=13.0850,
                        longitude=80.2101,
                        city="Chennai",
                        state="Tamil Nadu",
                        postcode="600040"
                    ),
                    GeocodeMatch(
                        display_address="Anna Nagar West, Chennai, Tamil Nadu, 600101, India",
                        latitude=13.0905,
                        longitude=80.2014,
                        city="Chennai",
                        state="Tamil Nadu",
                        postcode="600101"
                    ),
                    GeocodeMatch(
                        display_address="Anna Nagar East, Chennai, Tamil Nadu, 600102, India",
                        latitude=13.0862,
                        longitude=80.2215,
                        city="Chennai",
                        state="Tamil Nadu",
                        postcode="600102"
                    )
                ][:limit]
                return GeocodeResponse(
                    query=clean,
                    provider="Mock Geocoding Provider",
                    attribution=OSM_ATTRIBUTION,
                    matches=matches,
                    status="success",
                    message=f"Found {len(matches)} matching locations. Please confirm the correct match.",
                    from_cache=False
                )
            elif "velachery" in clean.lower():
                matches = [
                    GeocodeMatch(
                        display_address="Velachery, Chennai, Tamil Nadu, 600042, India",
                        latitude=12.9815,
                        longitude=80.2180,
                        city="Chennai",
                        state="Tamil Nadu",
                        postcode="600042"
                    )
                ]
                return GeocodeResponse(
                    query=clean,
                    provider="Mock Geocoding Provider",
                    attribution=OSM_ATTRIBUTION,
                    matches=matches,
                    status="success",
                    message="Found 1 matching location. Please confirm the correct match.",
                    from_cache=False
                )
            else:
                return GeocodeResponse(
                    query=clean,
                    provider="Mock Geocoding Provider",
                    attribution=OSM_ATTRIBUTION,
                    matches=[],
                    status="no_results",
                    message="No matching location found. You can edit the address or provide a landmark.",
                    from_cache=False
                )

        matches = [GeocodeMatch(**item) for item in results[:limit]]
        return GeocodeResponse(
            query=clean,
            provider="Mock Geocoding Provider",
            attribution=OSM_ATTRIBUTION,
            matches=matches,
            status="success" if matches else "no_results",
            message=f"Found {len(matches)} matching locations." if matches else "No matches found.",
            from_cache=False
        )


class GeocodingService:
    """
    High-level Geocoding Orchestrator for NammaCivic AI.
    - Selects provider (OpenStreetMap Nominatim default, completely free, no Google Maps API keys or billing required)
    - Provides transparent caching of repeated searches (satisfies Nominatim usage policy)
    - Enforces input sanitization (stripping PII / confidential info)
    - Returns up to 3 candidate matches with display address, latitude, and longitude
    - Never blocks or rejects civic complaints on lookup failure
    """
    def __init__(self, provider: Optional[BaseGeocodingProvider] = None):
        self.cache = GeocodingCache(default_ttl_seconds=settings.GEOCODING_CACHE_TTL_SECONDS)
        if provider:
            self.provider = provider
        else:
            provider_type = getattr(settings, "GEOCODING_PROVIDER", "nominatim").lower()
            if provider_type == "mock":
                self.provider = MockGeocodingProvider()
            else:
                self.provider = NominatimGeocodingProvider()

    def set_provider(self, provider: BaseGeocodingProvider):
        """Allows swapping geocoding providers at runtime."""
        self.provider = provider

    def lookup_address(
        self, 
        address: str, 
        country_code: Optional[str] = None, 
        limit: int = 3
    ) -> GeocodeResponse:
        sanitized = sanitize_geocoding_query(address)
        if not sanitized or len(sanitized) < 2:
            return GeocodeResponse(
                query=address,
                provider="OpenStreetMap Nominatim",
                attribution=OSM_ATTRIBUTION,
                matches=[],
                status="no_results",
                message="The address is too short. Please provide a street name, area, or landmark.",
                from_cache=False
            )

        effective_country = country_code or getattr(settings, "GEOCODING_COUNTRY_CODE", "in")

        # 1. Check cache first
        cached = self.cache.get(sanitized, effective_country)
        if cached:
            return cached

        # 2. Call provider
        response = self.provider.geocode(
            query=sanitized,
            country_code=effective_country,
            limit=limit
        )

        # 3. Cache successful or no-result responses (avoid repeated hammer on upstream)
        if response.status in ("success", "no_results"):
            self.cache.set(sanitized, response, effective_country)

        return response


# Global singleton service instance
geocoding_service = GeocodingService()
