import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Image as ImageIcon, 
  User as UserIcon, 
  Phone, 
  Clock, 
  Send,
  Compass,
  ExternalLink,
  Check,
  Building2,
  Eye,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { DuplicateWarningModal } from '../components/DuplicateWarningModal';
import { CivicLocationMap } from '../components/CivicLocationMap';
import { DuplicateMatch, AddressVerifyResponse, AddressCandidate } from '../types';

const TN_DISTRICTS = [
  'Coimbatore', 'Chennai', 'Madurai', 'Tiruchirappalli', 'Salem', 
  'Tirunelveli', 'Tiruppur', 'Erode', 'Chengalpattu', 'Kanchipuram', 
  'Tiruvallur', 'Vellore', 'Dindigul', 'Thanjavur', 'Ranipet', 'Cuddalore',
  'Villupuram', 'Nagapattinam', 'Kanyakumari', 'Thoothukudi', 'Karur',
  'Namakkal', 'Sivaganga', 'Pudukkottai', 'Krishnagiri', 'Dharmapuri',
  'Ariyalur', 'Perambalur', 'Tiruvannamalai', 'Ramanathapuram', 'Theni',
  'Virudhunagar', 'Tenkasi', 'Mayiladuthurai', 'Kallakurichi', 'Tirupathur', 'Nilgiris'
];

const CATEGORY_DEPT_MAP: Record<string, string> = {
  'ROAD_DAMAGE': 'Highways & Road Maintenance Department',
  'ROAD': 'Highways & Road Maintenance Department',
  'STREETLIGHT': 'Electrical & Lighting Department',
  'GARBAGE': 'Solid Waste Management Department',
  'DRAINAGE': 'Stormwater Drainage Department',
  'SEWAGE': 'Metro Water & Sewerage Board',
  'WATER_SHORTAGE': 'Water Supply Department',
  'WATER_LEAK': 'Water Supply & Distribution Department',
  'WATER': 'Water Supply Department',
  'PUBLIC_TOILET': 'Public Health Department',
  'SANITATION': 'Solid Waste Management Department',
  'MOSQUITO': 'Public Health & Vector Control Department',
  'STRAY_ANIMAL': 'Veterinary & Animal Welfare Department',
  'ANIMAL': 'Veterinary & Animal Welfare Department',
  'ENCROACHMENT': 'Town Planning & Revenue Department',
  'ILLEGAL_DUMPING': 'Solid Waste Management Department',
  'FLOODING': 'Disaster Management & Stormwater Department',
  'PUBLIC_INFRA': 'Public Works Department (PWD)',
  'PUBLIC_PROPERTY': 'Public Works Department (PWD)',
  'PARK': 'Parks & Playgrounds Department',
  'TREE_HAZARD': 'Horticulture & Disaster Management Department',
  'ENVIRONMENT': 'Pollution Control & Environment Department',
  'FOOTPATH': 'Roads & Pedestrian Infrastructure Department',
  'PUBLIC_SAFETY': 'Public Safety & Power Distribution Board',
  'WATER_QUALITY': 'Water Quality Monitoring Department',
  'OTHER_CIVIC': 'Municipal General Administration Department',
  'OTHER': 'Municipal General Administration Department'
};

export const ReportComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t, language, savedDraft, updateDraft, clearDraft } = useLanguage();

  // 1. Grievance Category
  const [category, setCategory] = useState(searchParams.get('category') || savedDraft.category || 'ROAD_DAMAGE');
  
  // 2. Complaint Title
  const [title, setTitle] = useState('');
  
  // 3. Detailed Description
  const [description, setDescription] = useState(savedDraft.description || '');
  
  // 4. Department
  const [department, setDepartment] = useState(CATEGORY_DEPT_MAP[category] || 'Municipal Redressal Department');

  // 5. District
  const [district, setDistrict] = useState('Chennai');

  // 6. City or Town
  const [cityTown, setCityTown] = useState('Chennai');

  // 7. Area or Locality
  const [areaLocality, setAreaLocality] = useState(savedDraft.location || '');

  // 8. Street Name
  const [streetName, setStreetName] = useState('');

  // 9. Exact Address / Door No.
  const [exactAddress, setExactAddress] = useState('');

  // 10. Optional Landmark
  const [landmark, setLandmark] = useState(savedDraft.landmark || '');

  // 11. Duration & Citizen Info
  const [duration, setDuration] = useState(savedDraft.duration || '2-3 days');
  const [citizenName, setCitizenName] = useState(user?.full_name || savedDraft.citizenName || '');
  const [citizenPhone, setCitizenPhone] = useState(user?.phone_number || savedDraft.citizenPhone || '');

  // 12. Optional Evidence File
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Address Verification States
  type VerificationStatus = 
    | 'IDLE' 
    | 'VERIFYING' 
    | 'NOT_VERIFIED' 
    | 'NEEDS_CONFIRMATION' 
    | 'VERIFIED' 
    | 'MANUAL_CONFIRMED' 
    | 'FAILED' 
    | 'PARTIALLY_MATCHED' 
    | 'NOT_FOUND' 
    | 'AMBIGUOUS' 
    | 'PROVIDER_UNAVAILABLE';

  const [verifyStatus, setVerifyStatus] = useState<VerificationStatus>('IDLE');
  const [verifyMessage, setVerifyMessage] = useState<string>('');
  const [candidates, setCandidates] = useState<AddressCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<AddressCandidate | null>(null);
  const [verifiedCoords, setVerifiedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [verifiedDisplayAddress, setVerifiedDisplayAddress] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Duplicate detection state
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  useEffect(() => {
    if (user) {
      if (!citizenName) setCitizenName(user.full_name);
      if (!citizenPhone && user.phone_number) setCitizenPhone(user.phone_number);
    }
  }, [user]);

  useEffect(() => {
    setDepartment(CATEGORY_DEPT_MAP[category] || 'Municipal Redressal Department');
  }, [category]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size must not exceed 5MB.');
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
  };

  // Build composite address string for geocoder verification
  const getFullAddressQuery = () => {
    const parts = [
      exactAddress.trim(),
      streetName.trim(),
      areaLocality.trim(),
      cityTown.trim(),
      district.trim(),
      'Tamil Nadu'
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Perform Progressive Address Verification via Backend (Google Maps & Geocoder)
  const handleVerifyAddress = async () => {
    if (!areaLocality.trim() && !streetName.trim() && !exactAddress.trim() && !landmark.trim() && !cityTown.trim()) {
      setErrorMessage('Please enter at least a street name, area, or landmark to verify your address.');
      return;
    }

    setErrorMessage('');
    setVerifyStatus('VERIFYING');
    setVerifyMessage('Verifying location with Google Maps & Civic Geocoder...');
    setCandidates([]);
    setSelectedCandidate(null);

    try {
      const res: AddressVerifyResponse = await api.verifyAddress({
        door_number: exactAddress.trim() || undefined,
        street_name: streetName.trim() || undefined,
        area_locality: areaLocality.trim() || undefined,
        city_town: cityTown.trim() || district.trim() || 'Chennai',
        district: district.trim() || undefined,
        landmark: landmark.trim() || undefined
      });

      setVerifyStatus(res.status);
      setVerifyMessage(res.message);

      if (res.status === 'VERIFIED' && (res.best_match || (res.candidates && res.candidates.length > 0))) {
        const match = res.best_match || res.candidates[0];
        setSelectedCandidate(match);
        setVerifiedCoords({ lat: match.latitude, lng: match.longitude });
        setVerifiedDisplayAddress(match.display_address || match.formatted_address || match.display_name || '');
      } else if (res.status === 'PARTIALLY_MATCHED' && res.candidates && res.candidates.length > 0) {
        setCandidates(res.candidates);
        const match = res.best_match || res.candidates[0];
        setSelectedCandidate(match);
        setVerifiedCoords({ lat: match.latitude, lng: match.longitude });
        setVerifiedDisplayAddress(match.display_address || match.formatted_address || '');
      } else if (res.default_center) {
        setVerifiedCoords({ lat: res.default_center.lat, lng: res.default_center.lng });
        setVerifiedDisplayAddress(`Location in ${cityTown || district}`);
      }
    } catch (err: any) {
      setVerifyStatus('NEEDS_CONFIRMATION');
      setVerifyMessage('Could not connect to geocoding provider. You can manually pin and confirm your location on the map below.');
    }
  };

  const handleMapLocationChange = (
    coords: { lat: number; lng: number },
    address: string,
    newStatus: 'VERIFIED' | 'MANUAL_CONFIRMED' | 'NEEDS_CONFIRMATION' | 'NOT_VERIFIED' | 'FAILED'
  ) => {
    setVerifiedCoords(coords);
    setVerifiedDisplayAddress(address);
    setVerifyStatus(newStatus);
    
    if (newStatus === 'VERIFIED') {
      setVerifyMessage('Address successfully verified.');
      setErrorMessage('');
    } else if (newStatus === 'MANUAL_CONFIRMED') {
      setVerifyMessage('Grievance location manually confirmed on map.');
      setErrorMessage('');
    } else if (newStatus === 'NEEDS_CONFIRMATION') {
      setVerifyMessage('Location modified. Please click "Confirm Location" on the map to confirm.');
    } else if (newStatus === 'NOT_VERIFIED') {
      setVerifyMessage('Address not verified yet.');
    } else if (newStatus === 'FAILED') {
      setVerifyMessage('Could not verify location. Please pin your location manually on the map.');
    }
  };

  const handleSelectCandidate = (cand: AddressCandidate) => {
    setSelectedCandidate(cand);
    setVerifiedCoords({ lat: cand.latitude, lng: cand.longitude });
    setVerifiedDisplayAddress(cand.display_name || cand.display_address || '');
    setVerifyStatus('VERIFIED');
    setVerifyMessage('Address successfully verified and selected.');
  };

  const handleSubmit = async (e: React.FormEvent, forceSubmit: boolean = false) => {
    e.preventDefault();
    setErrorMessage('');

    // Mandatory Field Validations
    if (!title.trim() || title.length < 3) {
      setErrorMessage('Please provide a descriptive complaint title (at least 3 characters).');
      return;
    }
    if (!description.trim() || description.length < 5) {
      setErrorMessage('Please provide a detailed complaint description (at least 5 characters).');
      return;
    }
    if (!district.trim()) {
      setErrorMessage('District is required.');
      return;
    }
    if (!cityTown.trim()) {
      setErrorMessage('City or Town is required.');
      return;
    }
    if (!areaLocality.trim() && !streetName.trim()) {
      setErrorMessage('Please provide the area/locality and street name.');
      return;
    }

    // Address verification requirement: do not block if manual or verified
    const isLocationConfirmed = (verifyStatus === 'VERIFIED' || verifyStatus === 'MANUAL_CONFIRMED') && verifiedCoords;
    if (!isLocationConfirmed) {
      setErrorMessage('Please confirm your grievance location on the map (click "Confirm This Location" or verify address) before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullLocationString = [
        exactAddress.trim(),
        streetName.trim(),
        areaLocality.trim(),
        cityTown.trim(),
        district.trim()
      ].filter(Boolean).join(', ');

      const complaint = await api.submitComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        location: fullLocationString,
        landmark: landmark.trim() || undefined,
        duration,
        citizen_name: citizenName.trim() || user?.full_name,
        citizen_phone: citizenPhone.trim() || user?.phone_number,
        latitude: verifiedCoords.lat,
        longitude: verifiedCoords.lng,
        geocoded_address: verifiedDisplayAddress,
        address_verification_status: verifyStatus === 'VERIFIED' ? 'VERIFIED' : 'MANUAL_CONFIRMED'
      });

      // Upload evidence document if attached
      if (selectedFile) {
        try {
          await api.uploadEvidence(complaint.complaint_id, selectedFile);
        } catch (uploadErr) {
          console.warn('Evidence file upload error:', uploadErr);
        }
      }

      clearDraft();
      navigate(`/complaint-success?id=${encodeURIComponent(complaint.complaint_id)}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit grievance. Please verify your data and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-6 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-civic-blue-600 text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Method A: Manual Grievance Reporting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-civic-navy-900 tracking-tight">
            Register Civic Grievance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Fill in your formal grievance details with verified street-level geocoding. All submitted complaints are recorded in the PostgreSQL municipal registry.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6 text-xs sm:text-sm">
          
          {/* 1. Grievance Category & 4. Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-civic-navy-900 mb-2">
                1. Grievance Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500 font-semibold"
                required
              >
                <option value="ROAD_DAMAGE">Road Damage & Potholes</option>
                <option value="STREETLIGHT">Streetlight Failure</option>
                <option value="GARBAGE">Garbage Accumulation</option>
                <option value="DRAINAGE">Drainage Blockage</option>
                <option value="SEWAGE">Sewage Overflow</option>
                <option value="WATER_SHORTAGE">Water Supply Shortage</option>
                <option value="WATER_LEAK">Drinking Water Pipeline Leakage</option>
                <option value="PUBLIC_TOILET">Public Toilet Maintenance</option>
                <option value="MOSQUITO">Mosquito Breeding & Fogging</option>
                <option value="STRAY_ANIMAL">Stray Animal Menace</option>
                <option value="ENCROACHMENT">Illegal Encroachment</option>
                <option value="ILLEGAL_DUMPING">Illegal Waste Dumping</option>
                <option value="FLOODING">Road & Area Flooding</option>
                <option value="PUBLIC_INFRA">Damaged Public Infrastructure</option>
                <option value="PARK">Public Park Maintenance</option>
                <option value="TREE_HAZARD">Dangerous Tree / Branch Hazard</option>
                <option value="FOOTPATH">Damaged Footpath & Pavements</option>
                <option value="PUBLIC_SAFETY">Open Manhole & Electrical Hazard</option>
                <option value="WATER_QUALITY">Contaminated Water Supply</option>
                <option value="OTHER_CIVIC">Other Civic Grievance</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-civic-navy-900 mb-2">
                4. Department (Assigned)
              </label>
              <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold truncate">
                {department}
              </div>
            </div>
          </div>

          {/* 2. Complaint Title */}
          <div>
            <label className="block font-bold text-civic-navy-900 mb-2">
              2. Complaint Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Deep crater pothole causing vehicle skid near bus stop"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500 font-medium"
              required
            />
          </div>

          {/* 3. Detailed Description */}
          <div>
            <label className="block font-bold text-civic-navy-900 mb-2">
              3. Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the exact civic defect, size, persistence, and safety risks to residents..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500"
              required
            />
          </div>

          {/* Structured Location Fields: 5. District, 6. City/Town, 7. Area, 8. Street, 9. Exact Address, 10. Landmark */}
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 font-extrabold text-civic-navy-900 text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-civic-blue-600" />
              <span>Grievance Location & Address Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  5. District <span className="text-rose-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {TN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  6. City or Town <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={cityTown}
                  onChange={(e) => setCityTown(e.target.value)}
                  placeholder="e.g., Chennai / Tambaram / Avadi"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  7. Area or Locality <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={areaLocality}
                  onChange={(e) => {
                    setAreaLocality(e.target.value);
                    setVerifyStatus('IDLE');
                  }}
                  placeholder="e.g., Anna Nagar West / T. Nagar"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  8. Street Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={streetName}
                  onChange={(e) => {
                    setStreetName(e.target.value);
                    setVerifyStatus('IDLE');
                  }}
                  placeholder="e.g., 4th Main Road / Gandhi Street"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  9. Exact Address / Door / Plot No.
                </label>
                <input
                  type="text"
                  value={exactAddress}
                  onChange={(e) => setExactAddress(e.target.value)}
                  placeholder="e.g., No. 14/2, Ground Floor"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  10. Optional Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g., Opposite Pillayar Temple / Near Bus Stop"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Address Verification & Interactive Civic Map */}
            <div className="pt-2 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleVerifyAddress}
                  disabled={verifyStatus === 'VERIFYING'}
                  className="px-4 py-2.5 bg-civic-navy-900 hover:bg-civic-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Compass className={`w-4 h-4 text-cyan-300 ${verifyStatus === 'VERIFYING' ? 'animate-spin' : ''}`} />
                  <span>{verifyStatus === 'VERIFYING' ? 'Verifying on Map...' : 'Verify Address & Locate'}</span>
                </button>

                <span className="text-[11px] text-slate-500">
                  Select, drag, or search your exact location on the civic map below
                </span>
              </div>

              {/* Status Message if any */}
              {verifyMessage && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  verifyStatus === 'VERIFIED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : verifyStatus === 'MANUAL_CONFIRMED'
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">
                      {verifyStatus === 'VERIFIED' && 'Address Successfully Verified'}
                      {verifyStatus === 'MANUAL_CONFIRMED' && 'Grievance Location Manually Confirmed'}
                      {verifyStatus === 'NEEDS_CONFIRMATION' && 'Location Needs Confirmation'}
                      {verifyStatus === 'PARTIALLY_MATCHED' && 'Locality Matched'}
                      {verifyStatus === 'NOT_FOUND' && 'Address Not Found Automatically'}
                    </span>
                    <p className="text-[11px] leading-relaxed">{verifyMessage}</p>
                  </div>
                </div>
              )}

              {/* Candidate Matches Selection if multiple */}
              {candidates.length > 1 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Multiple matching locations found. Click to select the correct one:
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {candidates.map((cand, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectCandidate(cand)}
                        className="w-full text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-between text-xs"
                      >
                        <span className="truncate pr-2 font-medium text-slate-800">{cand.display_address || cand.display_name}</span>
                        <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">📍 {cand.latitude.toFixed(4)}, {cand.longitude.toFixed(4)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Google Maps-Style Map */}
              <CivicLocationMap
                initialLat={verifiedCoords?.lat}
                initialLng={verifiedCoords?.lng}
                initialAddress={verifiedDisplayAddress}
                selectedCity={cityTown || district}
                status={verifyStatus as any}
                onLocationChange={handleMapLocationChange}
                height="360px"
              />
            </div>
          </div>

          {/* 11. Evidence Upload */}
          <div>
            <label className="block font-bold text-civic-navy-900 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-civic-blue-600" />
              <span>11. Evidence Image or Document (Optional)</span>
            </label>

            {filePreview ? (
              <div className="relative w-full max-w-xs rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={filePreview} alt="Preview" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-civic-blue-500 bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="font-semibold text-slate-700">Upload Site Evidence (JPG, PNG, PDF up to 5MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Citizen Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold text-civic-navy-900 mb-1 text-xs">
                Complainant Name
              </label>
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-civic-navy-900 mb-1 text-xs">
                Contact Mobile
              </label>
              <input
                type="text"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white"
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          {/* Complaint Review / Verification Section */}
          <div className="p-5 bg-gradient-to-br from-blue-50/80 to-slate-50 rounded-2xl border border-blue-200/80 space-y-3">
            <div className="flex items-center gap-2 font-extrabold text-civic-navy-900 text-xs sm:text-sm">
              <Eye className="w-4 h-4 text-civic-blue-700" />
              <span>Grievance Summary & Review</span>
            </div>
            <div className="text-xs space-y-1.5 text-slate-700">
              <p><strong>Title:</strong> {title || '(Enter complaint title above)'}</p>
              <p><strong>Category:</strong> {category} &bull; <strong>Department:</strong> {department}</p>
              <p><strong>Address:</strong> {[exactAddress, streetName, areaLocality, cityTown, district].filter(Boolean).join(', ') || '(Enter location above)'}</p>
              <p>
                <strong>Verification State:</strong>{' '}
                <span className={verifyStatus === 'VERIFIED' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                  {verifyStatus}
                </span>
                {verifiedCoords && ` (📍 ${verifiedCoords.lat.toFixed(4)}, ${verifiedCoords.lng.toFixed(4)})`}
              </p>
            </div>
          </div>

          {/* Big SUBMIT GRIEVANCE button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || verifyStatus !== 'VERIFIED'}
              className="w-full py-4 bg-gradient-to-r from-civic-navy-900 via-civic-blue-700 to-blue-700 hover:opacity-95 disabled:opacity-40 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-cyan-300" />
              <span>{isSubmitting ? 'Recording in PostgreSQL...' : 'SUBMIT GRIEVANCE'}</span>
            </button>
            {verifyStatus !== 'VERIFIED' && (
              <p className="text-center text-[11px] text-amber-700 font-semibold mt-2">
                ⚠️ Click "Verify Address (OpenStreetMap)" above to verify before submission.
              </p>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
