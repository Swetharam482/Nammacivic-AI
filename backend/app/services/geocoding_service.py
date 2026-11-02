import re
import time
import logging
import threading
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Tuple
import httpx
from app.core.config import settings
from app.schemas.geocoding import GeocodeMatch, GeocodeResponse

logger = logging.getLogger(__name__)

# Sensitive data patterns to strip before sending to external geocoding service
PHONE_REGEX = re.compile(r'(?:\+?91[\s\-]?)?[6-9]\d{9}|\b\d{10}\b')
EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
AADHAAR_REGEX = re.compile(r'\b\d{4}\s?\d{4}\s?\d{4}\b')
CONVERSATIONAL_PREFIXES = re.compile(
    r'^(?:my\s+(?:address|location|place)\s+is|i\s+live\s+at|located\s+at|near\s+by|enga\s+area|enga\s+street)\s*[:,\-]?\s*',
    re.IGNORECASE
)

OSM_ATTRIBUTION = "Location data © OpenStreetMap contributors (ODbL 1.0)"
GOOGLE_ATTRIBUTION = "Map data © Google"

def sanitize_geocoding_query(query: str) -> str:
    """
    Sanitizes citizen address input:
    - Strips personal and confidential information (phone, email, ID numbers)
    - Strips conversational filler prefixes
    - Cleans extra whitespace and special characters
    """
    if not query:
        return ""
    
    cleaned = query.strip()
    cleaned = EMAIL_REGEX.sub("", cleaned)
    cleaned = PHONE_REGEX.sub("", cleaned)
    cleaned = AADHAAR_REGEX.sub("", cleaned)
    cleaned = CONVERSATIONAL_PREFIXES.sub("", cleaned)
    cleaned = re.sub(r'[\r\n\t]+', ' ', cleaned)
    cleaned = re.sub(r'[,;\-]{2,}', ', ', cleaned)
    cleaned = re.sub(r'\s{2,}', ' ', cleaned)
    return cleaned.strip(" ,.-")


class GeocodingCache:
    """Thread-safe in-memory cache with TTL."""
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
    """Abstract interface for geocoding providers."""
    @abstractmethod
    def geocode(
        self, 
        query: str, 
        country_code: Optional[str] = "in", 
        limit: int = 3
    ) -> GeocodeResponse:
        pass

    @abstractmethod
    def reverse_geocode(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        pass


class GoogleMapsGeocodingProvider(BaseGeocodingProvider):
    """
    Google Maps Geocoding API provider.
    - Requires GOOGLE_MAPS_API_KEY from environment variables.
    - Performs forward geocoding with component filtering.
    - Performs reverse geocoding to retrieve structured address components.
    """
    GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

    def __init__(self, api_key: Optional[str] = None, timeout_seconds: float = 6.0):
        self.api_key = api_key or getattr(settings, "GOOGLE_MAPS_API_KEY", "")
        self.timeout_seconds = timeout_seconds

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 10)

    def geocode(
        self, 
        query: str, 
        country_code: Optional[str] = "in", 
        limit: int = 3
    ) -> GeocodeResponse:
        clean_query = sanitize_geocoding_query(query)
        if not clean_query or len(clean_query) < 2:
            return GeocodeResponse(
                query=query,
                provider="Google Maps",
                attribution=GOOGLE_ATTRIBUTION,
                matches=[],
                status="no_results",
                message="The address is too short.",
                from_cache=False
            )

        if not self.is_configured():
            return GeocodeResponse(
                query=clean_query,
                provider="Google Maps",
                attribution=GOOGLE_ATTRIBUTION,
                matches=[],
                status="service_unavailable",
                message="Google Maps API key is not configured.",
                from_cache=False
            )

        params: Dict[str, str] = {
            "address": clean_query,
            "key": self.api_key.strip()
        }
        if country_code:
            params["components"] = f"country:{country_code.lower()}"

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                resp = client.get(self.GEOCODE_URL, params=params)
                if resp.status_code != 200:
                    return GeocodeResponse(
                        query=clean_query,
                        provider="Google Maps",
                        attribution=GOOGLE_ATTRIBUTION,
                        matches=[],
                        status="service_error",
                        message=f"Google Maps API returned status {resp.status_code}.",
                        from_cache=False
                    )

                data = resp.json()
                api_status = data.get("status")

                if api_status in ("OVER_QUERY_LIMIT", "REQUEST_DENIED"):
                    logger.warning("Google Maps Geocoding API issue: %s - %s", api_status, data.get("error_message"))
                    return GeocodeResponse(
                        query=clean_query,
                        provider="Google Maps",
                        attribution=GOOGLE_ATTRIBUTION,
                        matches=[],
                        status="rate_limited" if api_status == "OVER_QUERY_LIMIT" else "service_unavailable",
                        message=data.get("error_message") or "Google Maps API request denied.",
                        from_cache=False
                    )

                if api_status == "ZERO_RESULTS" or not data.get("results"):
                    return GeocodeResponse(
                        query=clean_query,
                        provider="Google Maps",
                        attribution=GOOGLE_ATTRIBUTION,
                        matches=[],
                        status="no_results",
                        message="No matching location found on Google Maps.",
                        from_cache=False
                    )

                matches: List[GeocodeMatch] = []
                for item in data.get("results", [])[:limit]:
                    loc = item.get("geometry", {}).get("location", {})
                    lat = float(loc.get("lat", 0.0))
                    lng = float(loc.get("lng", 0.0))

                    components = item.get("address_components", [])
                    city = None
                    state = None
                    postcode = None

                    for comp in components:
                        types = comp.get("types", [])
                        if "locality" in types or "administrative_area_level_2" in types:
                            city = comp.get("long_name")
                        elif "administrative_area_level_1" in types:
                            state = comp.get("long_name")
                        elif "postal_code" in types:
                            postcode = comp.get("long_name")

                    matches.append(GeocodeMatch(
                        display_address=item.get("formatted_address", clean_query),
                        latitude=lat,
                        longitude=lng,
                        place_id=item.get("place_id"),
                        city=city,
                        state=state,
                        postcode=postcode,
                        category="google_place"
                    ))

                return GeocodeResponse(
                    query=clean_query,
                    provider="Google Maps",
                    attribution=GOOGLE_ATTRIBUTION,
                    matches=matches,
                    status="success",
                    message=f"Found {len(matches)} location match{'es' if len(matches) > 1 else ''}.",
                    from_cache=False
                )

        except Exception as exc:
            logger.warning("Google Maps Geocoding exception: %s", exc)
            return GeocodeResponse(
                query=clean_query,
                provider="Google Maps",
                attribution=GOOGLE_ATTRIBUTION,
                matches=[],
                status="service_unavailable",
                message=f"Google Maps geocoding connection failed: {exc}",
                from_cache=False
            )

    def reverse_geocode(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        if not self.is_configured():
            return None

        params = {
            "latlng": f"{latitude},{longitude}",
            "key": self.api_key.strip()
        }
        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                resp = client.get(self.GEOCODE_URL, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    results = data.get("results", [])
                    if results:
                        top = results[0]
                        components = top.get("address_components", [])
                        parsed: Dict[str, Any] = {
                            "formatted_address": top.get("formatted_address", ""),
                            "latitude": latitude,
                            "longitude": longitude,
                            "provider": "Google Maps",
                            "attribution": GOOGLE_ATTRIBUTION
                        }
                        for comp in components:
                            types = comp.get("types", [])
                            if "street_number" in types:
                                parsed["door_number"] = comp.get("long_name")
                            elif "route" in types:
                                parsed["street"] = comp.get("long_name")
                            elif "sublocality" in types or "sublocality_level_1" in types:
                                parsed["area"] = comp.get("long_name")
                            elif "locality" in types:
                                parsed["city"] = comp.get("long_name")
                            elif "administrative_area_level_2" in types:
                                parsed["district"] = comp.get("long_name")
                            elif "administrative_area_level_1" in types:
                                parsed["state"] = comp.get("long_name")
                            elif "postal_code" in types:
                                parsed["postcode"] = comp.get("long_name")
                        return parsed
        except Exception as exc:
            logger.warning("Google reverse geocode error: %s", exc)
        return None


class NominatimGeocodingProvider(BaseGeocodingProvider):
    """
    OpenStreetMap Nominatim geocoding provider.
    - Free fallback with rate limiting.
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
                message="The address is too short.",
                from_cache=False
            )

        self._wait_for_rate_limit()

        params = {
            "q": clean_query,
            "format": "jsonv2",
            "limit": min(max(1, limit), 5),
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
                        message="OpenStreetMap is busy. Please try again.",
                        from_cache=False
                    )
                if resp.status_code != 200:
                    return GeocodeResponse(
                        query=clean_query,
                        provider="OpenStreetMap Nominatim",
                        attribution=OSM_ATTRIBUTION,
                        matches=[],
                        status="service_error",
                        message=f"OpenStreetMap returned status {resp.status_code}.",
                        from_cache=False
                    )
                raw_results = resp.json()
        except Exception:
            return GeocodeResponse(
                query=clean_query,
                provider="OpenStreetMap Nominatim",
                attribution=OSM_ATTRIBUTION,
                matches=[],
                status="service_unavailable",
                message="Address lookup service is currently unreachable.",
                from_cache=False
            )

        if not isinstance(raw_results, list) or len(raw_results) == 0:
            return GeocodeResponse(
                query=clean_query,
                provider="OpenStreetMap Nominatim",
                attribution=OSM_ATTRIBUTION,
                matches=[],
                status="no_results",
                message="No matching location found.",
                from_cache=False
            )

        matches: List[GeocodeMatch] = []
        for item in raw_results[:limit]:
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

        return GeocodeResponse(
            query=clean_query,
            provider="OpenStreetMap Nominatim",
            attribution=OSM_ATTRIBUTION,
            matches=matches,
            status="success" if matches else "no_results",
            message=f"Found {len(matches)} location match{'es' if len(matches) > 1 else ''}." if matches else "No matches found.",
            from_cache=False
        )

    def reverse_geocode(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        self._wait_for_rate_limit()
        params = {
            "lat": str(latitude),
            "lon": str(longitude),
            "format": "jsonv2",
            "addressdetails": 1,
            "accept-language": "en,ta"
        }
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "application/json"
        }
        url = f"{self.base_url}/reverse"
        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                resp = client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    addr = data.get("address", {})
                    return {
                        "formatted_address": data.get("display_name", ""),
                        "latitude": latitude,
                        "longitude": longitude,
                        "door_number": addr.get("house_number"),
                        "street": addr.get("road") or addr.get("pedestrian") or addr.get("street"),
                        "area": addr.get("suburb") or addr.get("neighbourhood") or addr.get("residential"),
                        "city": addr.get("city") or addr.get("town") or addr.get("village"),
                        "district": addr.get("state_district") or addr.get("county"),
                        "state": addr.get("state"),
                        "postcode": addr.get("postcode"),
                        "provider": "OpenStreetMap Nominatim",
                        "attribution": OSM_ATTRIBUTION
                    }
        except Exception as exc:
            logger.warning("Nominatim reverse geocode error: %s", exc)
        return None


class MockGeocodingProvider(BaseGeocodingProvider):
    """Deterministic mock provider for unit tests."""
    def geocode(self, query: str, country_code: Optional[str] = "in", limit: int = 3) -> GeocodeResponse:
        clean = sanitize_geocoding_query(query).lower()
        if "anna nagar" in clean:
            matches = [
                GeocodeMatch(
                    display_address="Anna Nagar, Chennai, Tamil Nadu, 600040, India",
                    latitude=13.0850,
                    longitude=80.2101,
                    city="Chennai",
                    state="Tamil Nadu",
                    postcode="600040"
                )
            ]
            return GeocodeResponse(query=query, provider="Mock", attribution=OSM_ATTRIBUTION, matches=matches, status="success", message="Found match.")
        return GeocodeResponse(query=query, provider="Mock", attribution=OSM_ATTRIBUTION, matches=[], status="no_results", message="No match.")

    def reverse_geocode(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        return {
            "formatted_address": f"Civic Location at {latitude:.4f}, {longitude:.4f}, Chennai, Tamil Nadu",
            "latitude": latitude,
            "longitude": longitude,
            "city": "Chennai",
            "state": "Tamil Nadu",
            "provider": "Mock",
            "attribution": OSM_ATTRIBUTION
        }


class GeocodingService:
    """
    High-level Geocoding Orchestrator for NammaCivic AI.
    - Seamlessly prioritizes Google Maps Geocoding API if configured with API key.
    - Transparently falls back to OpenStreetMap Nominatim.
    - Provides reverse geocoding for interactive map marker repositioning.
    - Thread-safe caching.
    """
    def __init__(self):
        self.cache = GeocodingCache(default_ttl_seconds=settings.GEOCODING_CACHE_TTL_SECONDS)
        self.google_provider = GoogleMapsGeocodingProvider()
        self.osm_provider = NominatimGeocodingProvider()
        self.mock_provider = MockGeocodingProvider()

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
                provider="Geocoding Service",
                attribution=OSM_ATTRIBUTION,
                matches=[],
                status="no_results",
                message="The address is too short. Please provide a street name, area, or landmark.",
                from_cache=False
            )

        effective_country = country_code or getattr(settings, "GEOCODING_COUNTRY_CODE", "in")

        # 1. Check cache
        cached = self.cache.get(sanitized, effective_country)
        if cached:
            return cached

        # 2. Try Google Maps if configured
        if self.google_provider.is_configured():
            g_resp = self.google_provider.geocode(sanitized, country_code=effective_country, limit=limit)
            if g_resp.status in ("success", "no_results"):
                self.cache.set(sanitized, g_resp, effective_country)
                return g_resp
            logger.info("Google geocoding returned %s, trying Nominatim fallback...", g_resp.status)

        # 3. Fallback to Nominatim
        osm_resp = self.osm_provider.geocode(sanitized, country_code=effective_country, limit=limit)
        if osm_resp.status in ("success", "no_results"):
            self.cache.set(sanitized, osm_resp, effective_country)
        return osm_resp

    def reverse_geocode(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        # 1. Try Google if configured
        if self.google_provider.is_configured():
            res = self.google_provider.reverse_geocode(latitude, longitude)
            if res:
                return res

        # 2. Try OpenStreetMap
        return self.osm_provider.reverse_geocode(latitude, longitude)

    def search_address(
        self,
        query: str,
        country_code: Optional[str] = None,
        limit: int = 5
    ) -> GeocodeResponse:
        return self.lookup_address(query, country_code=country_code, limit=limit)


# Global singleton instance
geocoding_service = GeocodingService()
