import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, 
  MapPin, 
  Crosshair, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Navigation,
  Loader2,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { AddressCandidate } from '../types';

interface CivicLocationMapProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  selectedCity?: string;
  district?: string;
  status: 'NOT_VERIFIED' | 'NEEDS_CONFIRMATION' | 'VERIFIED' | 'MANUAL_CONFIRMED' | 'FAILED' | 'PARTIALLY_MATCHED' | 'NOT_FOUND' | 'AMBIGUOUS' | 'PROVIDER_UNAVAILABLE';
  onLocationChange: (coords: { lat: number; lng: number }, address: string, status: 'NOT_VERIFIED' | 'NEEDS_CONFIRMATION' | 'VERIFIED' | 'MANUAL_CONFIRMED' | 'FAILED') => void;
  height?: string;
}

// City centers dictionary across Tamil Nadu
const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  chennai: { lat: 13.0827, lng: 80.2707, zoom: 13 },
  coimbatore: { lat: 11.0168, lng: 76.9558, zoom: 13 },
  madurai: { lat: 9.9252, lng: 78.1198, zoom: 13 },
  tiruchirappalli: { lat: 10.7905, lng: 78.7047, zoom: 13 },
  salem: { lat: 11.6643, lng: 78.1460, zoom: 13 },
  tirunelveli: { lat: 8.7139, lng: 77.7567, zoom: 13 },
  chengalpattu: { lat: 12.6841, lng: 79.9836, zoom: 13 },
  kanchipuram: { lat: 12.8342, lng: 79.7036, zoom: 13 },
  tiruvallur: { lat: 13.1432, lng: 79.9079, zoom: 13 },
  vellore: { lat: 12.9165, lng: 79.1325, zoom: 13 },
  erode: { lat: 11.3410, lng: 77.7172, zoom: 13 },
  tiruppur: { lat: 11.1085, lng: 77.3411, zoom: 13 },
  dindigul: { lat: 10.3673, lng: 77.9803, zoom: 13 },
  thanjavur: { lat: 10.7870, lng: 79.1378, zoom: 13 },
  ranipet: { lat: 12.9272, lng: 79.3330, zoom: 13 },
  cuddalore: { lat: 11.7480, lng: 79.7714, zoom: 13 },
  villupuram: { lat: 11.9401, lng: 79.4861, zoom: 13 },
  nagapattinam: { lat: 10.7672, lng: 79.8449, zoom: 13 },
  kanyakumari: { lat: 8.0883, lng: 77.5385, zoom: 13 },
  thoothukudi: { lat: 8.7642, lng: 78.1348, zoom: 13 },
  default: { lat: 13.0827, lng: 80.2707, zoom: 12 }
};

function getCityCenter(cityName?: string, districtName?: string) {
  const checkTarget = (target?: string) => {
    if (!target) return null;
    const clean = target.toLowerCase().trim();
    for (const [k, v] of Object.entries(CITY_COORDINATES)) {
      if (k === clean || clean.includes(k) || k.includes(clean)) {
        return v;
      }
    }
    return null;
  };

  const byCity = checkTarget(cityName);
  if (byCity) return byCity;

  const byDistrict = checkTarget(districtName);
  if (byDistrict) return byDistrict;

  return CITY_COORDINATES.default;
}

// Custom crisp Civic Pin Marker
const createCivicIcon = (isConfirmed: boolean) => L.divIcon({
  className: 'civic-map-marker-container',
  html: `
    <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%); cursor:grab;">
      <div style="
        background: ${isConfirmed ? '#16a34a' : '#2563eb'}; 
        color: white; 
        padding: 7px; 
        border-radius: 50%; 
        box-shadow: 0 4px 14px rgba(0,0,0,0.35); 
        border: 2.5px solid white; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        animation: bounce 1s infinite alternate ease-in-out;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div style="width: 4px; height: 7px; background: ${isConfirmed ? '#16a34a' : '#2563eb'}; border-radius: 0 0 2px 2px;"></div>
      <div style="width: 14px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; margin-top: -1px;"></div>
    </div>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});

export const CivicLocationMap: React.FC<CivicLocationMapProps> = ({
  initialLat,
  initialLng,
  initialAddress = '',
  selectedCity = 'Coimbatore',
  district = 'Coimbatore',
  status,
  onLocationChange,
  height = '380px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => {
    if (initialLat && initialLng) {
      return { lat: initialLat, lng: initialLng };
    }
    const defaultCity = getCityCenter(selectedCity, district);
    return { lat: defaultCity.lat, lng: defaultCity.lng };
  });

  const [displayAddress, setDisplayAddress] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressCandidate[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCity = getCityCenter(selectedCity);
    const startLat = initialLat || defaultCity.lat;
    const startLng = initialLng || defaultCity.lng;
    const startZoom = (initialLat && initialLng) ? 16 : defaultCity.zoom;

    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: startZoom,
      zoomControl: false
    });

    // Google Maps Styled Road Layer + Fallback OpenStreetMap
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: 'Map data &copy; <a href="https://maps.google.com">Google</a> | Civic Portal'
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Marker
    const isConfirmed = status === 'VERIFIED' || status === 'MANUAL_CONFIRMED';
    const marker = L.marker([startLat, startLng], {
      draggable: true,
      icon: createCivicIcon(isConfirmed)
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family:sans-serif; font-size:12px; line-height:1.4;">
        <strong style="color:#0f172a;">Grievance Location</strong><br/>
        <span style="color:#64748b;">Drag or tap to reposition marker</span>
      </div>
    `);

    // Handle marker drag end
    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      const newLat = Number(pos.lat.toFixed(6));
      const newLng = Number(pos.lng.toFixed(6));
      setCoords({ lat: newLat, lng: newLng });
      await performReverseGeocoding(newLat, newLng);
    });

    // Handle map click
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const newLat = Number(e.latlng.lat.toFixed(6));
      const newLng = Number(e.latlng.lng.toFixed(6));
      marker.setLatLng([newLat, newLng]);
      setCoords({ lat: newLat, lng: newLng });
      await performReverseGeocoding(newLat, newLng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync external coordinates
  useEffect(() => {
    if (initialLat && initialLng && mapInstanceRef.current && markerRef.current) {
      const cur = markerRef.current.getLatLng();
      if (Math.abs(cur.lat - initialLat) > 0.0001 || Math.abs(cur.lng - initialLng) > 0.0001) {
        markerRef.current.setLatLng([initialLat, initialLng]);
        mapInstanceRef.current.setView([initialLat, initialLng], 16, { animate: true });
        setCoords({ lat: initialLat, lng: initialLng });
        if (initialAddress) {
          setDisplayAddress(initialAddress);
        }
      }
    }
  }, [initialLat, initialLng, initialAddress]);

  // Update marker icon style based on verification status
  useEffect(() => {
    if (markerRef.current) {
      const isConfirmed = status === 'VERIFIED' || status === 'MANUAL_CONFIRMED';
      markerRef.current.setIcon(createCivicIcon(isConfirmed));
    }
  }, [status]);

  // Recenter when city changes
  useEffect(() => {
    if (!initialLat && selectedCity && mapInstanceRef.current && markerRef.current) {
      const city = getCityCenter(selectedCity);
      mapInstanceRef.current.setView([city.lat, city.lng], city.zoom, { animate: true });
      markerRef.current.setLatLng([city.lat, city.lng]);
      setCoords({ lat: city.lat, lng: city.lng });
    }
  }, [selectedCity]);

  // Perform reverse geocoding on drag / click
  const performReverseGeocoding = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const rev = await api.reverseGeocode(lat, lng);
      const addr = rev.formatted_address || rev.display_address || `Pinned Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      setDisplayAddress(addr);
      onLocationChange({ lat, lng }, addr, 'NEEDS_CONFIRMATION');
    } catch {
      const fallback = `Pinned Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      setDisplayAddress(fallback);
      onLocationChange({ lat, lng }, fallback, 'NEEDS_CONFIRMATION');
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Search box handler
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);
    try {
      const fullQuery = `${searchQuery.trim()}, ${selectedCity}, Tamil Nadu`;
      const res = await api.verifyAddress({ address: fullQuery, city_town: selectedCity });
      if (res.candidates && res.candidates.length > 0) {
        const top = res.candidates[0];
        selectCandidate(top);
      } else if (res.default_center) {
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([res.default_center.lat, res.default_center.lng], 15, { animate: true });
          markerRef.current.setLatLng([res.default_center.lat, res.default_center.lng]);
          setCoords({ lat: res.default_center.lat, lng: res.default_center.lng });
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsSearching(false);
    }
  };

  // Autocomplete suggestions
  const handleQueryChange = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 3) {
      try {
        const res = await api.getAddressSuggestions(`${val.trim()}, ${selectedCity}`);
        setSuggestions(res.suggestions || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectCandidate = (cand: AddressCandidate) => {
    setShowSuggestions(false);
    setSearchQuery(cand.display_address || cand.display_name || '');
    const lat = cand.latitude;
    const lng = cand.longitude;
    const addr = cand.display_address || cand.display_name || cand.formatted_address || '';
    
    setCoords({ lat, lng });
    setDisplayAddress(addr);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 17, { animate: true });
      markerRef.current.setLatLng([lat, lng]);
    }

    onLocationChange({ lat, lng }, addr, 'VERIFIED');
  };

  // Browser Geolocation (Current location)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocatingUser(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setCoords({ lat, lng });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17, { animate: true });
          markerRef.current.setLatLng([lat, lng]);
        }
        await performReverseGeocoding(lat, lng);
      },
      (err) => {
        setIsLocatingUser(false);
        alert('Could not retrieve current location. Please allow location permissions in your browser.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Recenter button
  const handleRecenterTown = () => {
    const city = getCityCenter(selectedCity);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([city.lat, city.lng], city.zoom, { animate: true });
      markerRef.current.setLatLng([city.lat, city.lng]);
      setCoords({ lat: city.lat, lng: city.lng });
      performReverseGeocoding(city.lat, city.lng);
    }
  };

  // User manually confirms current pin position
  const handleConfirmCurrentLocation = () => {
    const finalAddr = displayAddress || `Selected Civic Location (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`;
    onLocationChange(coords, finalAddr, 'MANUAL_CONFIRMED');
  };

  const isConfirmed = status === 'VERIFIED' || status === 'MANUAL_CONFIRMED';

  return (
    <div className="space-y-3 font-sans">
      
      {/* Search Bar Above Map */}
      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={`Search street, landmark, locality in ${selectedCity}...`}
              className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2.5 bg-civic-navy-900 hover:bg-civic-navy-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Search</span>
          </button>
        </form>

        {/* Autocomplete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectCandidate(s)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 border-b border-slate-100 last:border-0 flex items-start gap-2.5 text-xs transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-civic-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 font-medium line-clamp-2">
                  {s.display_address || s.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md">
        <div 
          ref={mapContainerRef} 
          style={{ height, width: '100%' }} 
          className="z-10 bg-slate-100"
        />

        {/* Top-right Floating Map Action Controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          {/* Current GPS button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocatingUser}
            title="Use my current GPS location"
            className="p-2.5 bg-white/95 backdrop-blur-xs hover:bg-white text-slate-700 hover:text-civic-blue-600 rounded-xl shadow-md border border-slate-200 transition-all flex items-center justify-center"
          >
            {isLocatingUser ? <Loader2 className="w-4 h-4 animate-spin text-civic-blue-600" /> : <Crosshair className="w-4 h-4" />}
          </button>

          {/* Recenter City button */}
          <button
            type="button"
            onClick={handleRecenterTown}
            title={`Recenter map on ${selectedCity}`}
            className="p-2.5 bg-white/95 backdrop-blur-xs hover:bg-white text-slate-700 hover:text-civic-navy-900 rounded-xl shadow-md border border-slate-200 transition-all flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Banner inside Map with coordinates */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
          <div className="px-3 py-1.5 bg-slate-900/85 backdrop-blur-xs text-white rounded-lg text-[10px] font-mono shadow-md flex items-center gap-1.5 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{coords.lat.toFixed(5)}° N, {coords.lng.toFixed(5)}° E</span>
          </div>
        </div>
      </div>

      {/* Location Details & Confirmation Strip */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isConfirmed
          ? 'bg-emerald-50/70 border-emerald-200'
          : 'bg-amber-50/70 border-amber-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                status === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : status === 'MANUAL_CONFIRMED'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {status === 'VERIFIED' && 'Address Verified'}
                {status === 'MANUAL_CONFIRMED' && 'Manually Confirmed'}
                {status === 'NEEDS_CONFIRMATION' && 'Action Required: Confirm Pin'}
                {status === 'PARTIALLY_MATCHED' && 'Partial Match: Confirm Pin'}
                {status === 'NOT_FOUND' && 'Unmatched: Drop Pin'}
              </span>

              {isReverseGeocoding && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-civic-blue-600" />
                  <span>Updating address...</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 font-medium leading-snug line-clamp-2">
              {displayAddress || `Selected Pin Location (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`}
            </p>
          </div>

          {/* Confirm Button */}
          <div className="flex-shrink-0">
            {isConfirmed ? (
              <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Location Confirmed</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConfirmCurrentLocation}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM LOCATION</span>
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
