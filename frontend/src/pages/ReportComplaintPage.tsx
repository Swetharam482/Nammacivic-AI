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
  Info,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { DuplicateWarningModal } from '../components/DuplicateWarningModal';
import { DuplicateMatch, GeocodeMatch, GeocodeResponse } from '../types';

export const ReportComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t, language, savedDraft, updateDraft, clearDraft } = useLanguage();

  const [category, setCategory] = useState(searchParams.get('category') || savedDraft.category || 'STREETLIGHT');
  const [description, setDescription] = useState(savedDraft.description || '');
  const [location, setLocation] = useState(savedDraft.location || '');
  const [landmark, setLandmark] = useState(savedDraft.landmark || '');
  const [duration, setDuration] = useState(savedDraft.duration || '2-3 days');
  const [citizenName, setCitizenName] = useState(user?.full_name || savedDraft.citizenName || '');
  const [citizenPhone, setCitizenPhone] = useState(user?.phone_number || savedDraft.citizenPhone || '');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // OpenStreetMap Nominatim Geocoding State (Free, No Google Maps API key required)
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResponse | null>(null);
  const [confirmedMatch, setConfirmedMatch] = useState<GeocodeMatch | null>(null);
  const [hasDismissedGeocode, setHasDismissedGeocode] = useState(false);

  // Duplicate detection state
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  useEffect(() => {
    if (user) {
      if (!citizenName) setCitizenName(user.full_name);
      if (!citizenPhone && user.phone_number) setCitizenPhone(user.phone_number);
    }
  }, [user]);

  // Handle file selection
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

  // Check duplicates
  const runDuplicateCheck = async () => {
    if (category && description.length >= 8 && location.length >= 3) {
      try {
        const res = await api.checkDuplicates({
          category,
          description,
          location,
          landmark
        });
        if (res.is_duplicate_likely) {
          setDuplicateMatches(res.matches);
        } else {
          setDuplicateMatches([]);
        }
      } catch (e) {}
    }
  };

  // OpenStreetMap Nominatim Address Lookup
  const handleLookupAddress = async () => {
    if (!location.trim() || location.trim().length < 2) {
      setErrorMessage(t('pleaseEnterAddress'));
      return;
    }
    setErrorMessage('');
    setIsGeocoding(true);
    setHasDismissedGeocode(false);

    try {
      const res = await api.searchAddress(location.trim());
      setGeocodeResult(res);
    } catch (err: any) {
      setGeocodeResult({
        query: location,
        provider: 'OpenStreetMap Nominatim',
        attribution: 'Location data © OpenStreetMap contributors (ODbL 1.0)',
        matches: [],
        message: 'OpenStreetMap service unavailable. You may proceed with manual address.',
        status: 'service_unavailable',
        from_cache: false
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectMatch = (match: GeocodeMatch) => {
    setConfirmedMatch(match);
    setGeocodeResult(null);
    setHasDismissedGeocode(false);
  };

  const handleClearConfirmedMatch = () => {
    setConfirmedMatch(null);
  };

  const handleProceedManual = () => {
    setHasDismissedGeocode(true);
    setGeocodeResult(null);
  };

  const handleSubmit = async (e: React.FormEvent, forceSubmit: boolean = false) => {
    e.preventDefault();
    setErrorMessage('');

    if (!description.trim() || description.length < 5) {
      setErrorMessage(t('descriptionPlaceholder'));
      return;
    }
    if (!location.trim()) {
      setErrorMessage(t('pleaseEnterAddress'));
      return;
    }

    // Check duplicates before submitting if not already acknowledged
    if (!forceSubmit && duplicateMatches.length > 0) {
      setShowDuplicateModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const complaint = await api.submitComplaint({
        title: `${category} issue at ${location}`,
        description,
        category,
        location,
        landmark,
        duration,
        citizen_name: citizenName,
        citizen_phone: citizenPhone,
        latitude: confirmedMatch ? confirmedMatch.latitude : undefined,
        longitude: confirmedMatch ? confirmedMatch.longitude : undefined,
        geocoded_address: confirmedMatch ? confirmedMatch.display_address : undefined
      });

      // Upload evidence if attached
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
      setErrorMessage(err.message || 'Failed to submit complaint. Please check your data and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-6 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-civic-blue-600 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Official Civic Redressal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-civic-navy-900">
            {t('reportHeaderTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            {t('reportHeaderSubtitle')}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Live Duplicate Warning Alert if matches exist */}
        {duplicateMatches.length > 0 && !showDuplicateModal && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-amber-800 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>{t('duplicateNotice')}</strong> (#{duplicateMatches[0].complaint_id} at {duplicateMatches[0].location})
                <button
                  type="button"
                  onClick={() => setShowDuplicateModal(true)}
                  className="underline block mt-1 font-semibold text-amber-900"
                >
                  {t('viewSimilarBtn')} ({duplicateMatches.length})
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6 text-xs sm:text-sm">
          
          {/* Category */}
          <div>
            <label className="block font-bold text-civic-navy-900 mb-2">
              {t('categoryLabel')} <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                updateDraft({ category: e.target.value });
                runDuplicateCheck();
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500 font-semibold"
              required
            >
              <option value="STREETLIGHT">{t('catStreetlight')}</option>
              <option value="ROAD">{t('catRoad')}</option>
              <option value="GARBAGE">{t('catGarbage')}</option>
              <option value="DRAINAGE">{t('catDrainage')}</option>
              <option value="WATER">{t('catWater')}</option>
              <option value="SANITATION">{t('catSanitation')}</option>
              <option value="PUBLIC_PROPERTY">{t('catPublicProperty')}</option>
              <option value="ENVIRONMENT">{t('catEnvironment')}</option>
              <option value="ANIMAL">{t('catAnimal')}</option>
              <option value="OTHER">{t('catOther')}</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-civic-navy-900 mb-2">
              {t('descriptionLabel')} <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                updateDraft({ description: e.target.value });
              }}
              onBlur={runDuplicateCheck}
              placeholder={t('descriptionPlaceholder')}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500"
              required
            />
          </div>

          {/* Location & Landmark */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-civic-navy-900 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-civic-blue-600" />
                  <span>{t('locationLabel')} <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    updateDraft({ location: e.target.value });
                    if (confirmedMatch) setConfirmedMatch(null);
                  }}
                  onBlur={runDuplicateCheck}
                  placeholder={t('locationPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-civic-navy-900 mb-2">
                  {t('landmarkLabel')}
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => {
                    setLandmark(e.target.value);
                    updateDraft({ landmark: e.target.value });
                  }}
                  onBlur={runDuplicateCheck}
                  placeholder={t('landmarkPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500"
                />
              </div>
            </div>

            {/* OpenStreetMap Lookup Action & Confirmed Match State */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleLookupAddress}
                disabled={isGeocoding || !location.trim()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-civic-navy-900 font-semibold text-xs transition-colors border border-slate-200 disabled:opacity-50"
              >
                <Compass className={`w-4 h-4 text-civic-blue-600 ${isGeocoding ? 'animate-spin' : ''}`} />
                <span>{isGeocoding ? t('verifyingAddress') : t('verifyAddressBtn')}</span>
              </button>
              
              <span className="text-[11px] text-slate-400">
                📍 OpenStreetMap Nominatim • Verified Geo-Coordinates
              </span>
            </div>

            {/* Confirmed Location Badge */}
            {confirmedMatch && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">{t('locationConfirmed')}</span>
                    <span className="text-[11px] text-emerald-700">{confirmedMatch.display_address}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearConfirmedMatch}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
                >
                  Change
                </button>
              </div>
            )}

            {/* Geocode Search Results List */}
            {geocodeResult && geocodeResult.matches && geocodeResult.matches.length > 0 && !confirmedMatch && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-civic-navy-900 block">Select closest matching address:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {geocodeResult.matches.map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectMatch(m)}
                      className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-blue-100 border border-slate-200 transition-colors flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{m.display_address}</span>
                      <span className="text-[10px] text-slate-400 font-mono">📍 {m.latitude.toFixed(4)}, {m.longitude.toFixed(4)}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleProceedManual}
                  className="text-xs text-slate-600 hover:underline pt-1 block"
                >
                  None of these match. Proceed with manual address.
                </button>
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block font-bold text-civic-navy-900 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-civic-blue-600" />
              <span>{t('durationLabel')}</span>
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                updateDraft({ duration: e.target.value });
              }}
              placeholder={t('durationPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500"
            />
          </div>

          {/* Evidence Image Upload */}
          <div>
            <label className="block font-bold text-civic-navy-900 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-civic-blue-600" />
              <span>{t('uploadPhotoLabel')}</span>
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
                <span className="font-semibold text-slate-700">{t('uploadPhotoLabel')}</span>
                <span className="text-[11px] text-slate-400 mt-1">{t('uploadPhotoHelp')}</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block font-bold text-civic-navy-900 mb-2 flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>{t('yourNameLabel')}</span>
              </label>
              <input
                type="text"
                value={citizenName}
                onChange={(e) => {
                  setCitizenName(e.target.value);
                  updateDraft({ citizenName: e.target.value });
                }}
                placeholder={t('fullNamePlaceholder')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-civic-navy-900 mb-2 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{t('yourPhoneLabel')}</span>
              </label>
              <input
                type="text"
                value={citizenPhone}
                onChange={(e) => {
                  setCitizenPhone(e.target.value);
                  updateDraft({ citizenPhone: e.target.value });
                }}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-civic-blue-600 hover:bg-civic-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? t('submittingBtn') : t('submitGrievanceBtn')}</span>
            </button>
          </div>

        </form>

      </div>

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        isOpen={showDuplicateModal}
        matches={duplicateMatches}
        onProceed={(e?: any) => {
          setShowDuplicateModal(false);
          handleSubmit(e || { preventDefault: () => {} } as any, true);
        }}
        onCancel={() => setShowDuplicateModal(false)}
      />

    </div>
  );
};
