import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Building2, 
  User as UserIcon, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import { ResolutionBanner } from '../components/ResolutionBanner';
import { useLanguage } from '../contexts/LanguageContext';

export const TrackComplaintPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const complaintIdParam = searchParams.get('id') || '';

  const [searchId, setSearchId] = useState(complaintIdParam);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchComplaint = async (id: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await api.getComplaint(id.trim());
      setComplaint(data);
    } catch (err: any) {
      setComplaint(null);
      setErrorMessage(err.message || t('noMatchingComplaintFound'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (complaintIdParam) {
      setSearchId(complaintIdParam);
      fetchComplaint(complaintIdParam);
    }
  }, [complaintIdParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setSearchParams({ id: searchId.trim().toUpperCase() });
      fetchComplaint(searchId.trim().toUpperCase());
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Search Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-civic-blue-600">
            {t('realTimeRedressalTracking')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-civic-navy-900">
            {t('trackCivicGrievance')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-sans">
            {t('trackPageSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder={t('enterTrackingIdPlaceholder')}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500 shadow-inner uppercase"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3.5 bg-civic-navy-900 hover:bg-civic-navy-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex-shrink-0"
          >
            {isLoading ? t('searching') : t('trackActionBtn')}
          </button>
        </form>

        {/* Quick demo presets */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4 flex-wrap">
          <span className="font-semibold text-slate-400">{t('demoRecords')}</span>
          <button
            type="button"
            onClick={() => {
              setSearchId('NC-2026-10492');
              fetchComplaint('NC-2026-10492');
              setSearchParams({ id: 'NC-2026-10492' });
            }}
            className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-mono border border-purple-200"
          >
            NC-2026-10492 (Pending Verification)
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchId('NC-2026-10493');
              fetchComplaint('NC-2026-10493');
              setSearchParams({ id: 'NC-2026-10493' });
            }}
            className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-mono border border-amber-200"
          >
            NC-2026-10493 (In Progress)
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Complaint Details View */}
      {complaint && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Main Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xl sm:text-2xl font-black text-civic-navy-900 tracking-wider">
                    #{complaint.complaint_id}
                  </span>
                  <StatusBadge 
                    status={complaint.status} 
                    isCitizenVerified={complaint.status === 'CLOSED' && complaint.verifications.some(v => v.is_resolved)}
                  />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  {complaint.title}
                </h2>
              </div>

              {/* Priority badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">{t('assessedPriority')}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  complaint.priority === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
                  complaint.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                  'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {complaint.priority}
                </span>
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">{t('category')}</span>
                <span className="font-bold text-civic-navy-900">{complaint.category}</span>
                {complaint.subcategory && (
                  <span className="text-[11px] text-slate-500 block">({complaint.subcategory})</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block mb-1">{t('locationLandmark')}</span>
                <span className="font-bold text-civic-navy-900 block">{complaint.location}</span>
                {complaint.landmark && (
                  <span className="text-[11px] text-slate-500 block">Landmark: {complaint.landmark}</span>
                )}
                {complaint.latitude && complaint.longitude && (
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono">
                      📍 {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
                    </span>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${complaint.latitude}&mlon=${complaint.longitude}#map=16/${complaint.latitude}/${complaint.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-civic-blue-600 hover:underline text-[10px] inline-flex items-center gap-0.5"
                    >
                      <span>OpenStreetMap</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-400 block mb-1">{t('reportedDuration')}</span>
                <span className="font-bold text-civic-navy-900">{complaint.duration || 'Not specified'}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">{t('submittedOn')}</span>
                <span className="font-bold text-civic-navy-900">
                  {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Full Description */}
            <div className="pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('citizenGrievanceDescription')}
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed font-sans">
                {complaint.description}
              </p>
            </div>

            {/* Assigned Department Info */}
            <div className="mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-civic-blue-600" />
                <div>
                  <span className="font-bold text-civic-navy-900 block">
                    {complaint.department?.name || 'Local Body Civic Works'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Helpline: {complaint.department?.helpline || '1913'} • Assigned Officer: {complaint.assigned_officer || 'Zonal Engineer Dispatched'}
                  </span>
                </div>
              </div>

              {complaint.is_duplicate_flag && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg font-medium text-[11px]">
                  Linked with related report #{complaint.related_complaint_id}
                </span>
              )}
            </div>
          </div>

          {/* CITIZEN RESOLUTION VERIFICATION BANNER (When status is RESOLUTION_PENDING_VERIFICATION) */}
          <ResolutionBanner
            complaint={complaint}
            onVerificationSubmitted={(updated) => setComplaint(updated)}
          />

          {/* Evidence Photos if any */}
          {complaint.evidence_files && complaint.evidence_files.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-civic-navy-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-civic-blue-600" />
                <span>{t('uploadedEvidenceTitle')} ({complaint.evidence_files.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {complaint.evidence_files.map((file) => (
                  <a
                    key={file.id}
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all relative"
                  >
                    <img
                      src={file.file_url}
                      alt={file.original_name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="p-2 bg-slate-50 text-[11px] truncate text-slate-600">
                      {file.original_name}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Status Timeline & History Logs */}
          <Timeline
            currentStatus={complaint.status}
            history={complaint.status_history}
          />

        </div>
      )}

    </div>
  );
};
