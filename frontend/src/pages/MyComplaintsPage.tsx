import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Filter, 
  ExternalLink, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Plus, 
  Calendar,
  Lock,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ComplaintListItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const MyComplaintsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState<ComplaintListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    async function loadUserComplaints() {
      if (isAuthenticated) {
        setIsLoading(true);
        try {
          const data = await api.listComplaints({ my_only: true });
          setComplaints(data);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    loadUserComplaints();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-civic-blue-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-civic-navy-900">
            {t('authRequiredTitle')}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t('authRequiredDesc')}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/login"
              className="py-3 px-6 bg-civic-blue-600 hover:bg-civic-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              {t('signInToYourAccount')}
            </Link>
            <Link
              to="/track"
              className="py-2.5 px-6 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-colors"
            >
              {t('orTrackBySingleComplaintId')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filtered = complaints.filter(c => {
    const matchesSearch = !searchQuery || 
      c.complaint_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-civic-blue-600">
            {t('citizenDashboard')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-civic-navy-900 mt-1">
            {t('myRegisteredComplaints')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('loggedInAs')} <strong>{user?.full_name}</strong> ({user?.email})
          </p>
        </div>

        <Link
          to="/report"
          className="flex items-center gap-2 px-5 py-3 bg-civic-blue-600 hover:bg-civic-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>{t('newGrievance')}</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchComplaintsPlaceholder')}
            className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-600">{t('statusLabel')}</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 font-medium focus:outline-none"
          >
            <option value="ALL">{t('allStatuses')}</option>
            <option value="SUBMITTED">{t('statusSubmitted')}</option>
            <option value="ASSIGNED">{t('statusAssigned')}</option>
            <option value="IN_PROGRESS">{t('statusInProgress')}</option>
            <option value="RESOLUTION_PENDING_VERIFICATION">{t('statusPendingVerification')}</option>
            <option value="CLOSED">{t('statusClosed')}</option>
            <option value="REOPENED">{t('statusReopened')}</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          {t('loading')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center bg-white rounded-3xl border border-slate-200 p-12 text-slate-500 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700">{t('noComplaintsFound')}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {t('noComplaintsFound')}
          </p>
          <div className="pt-2">
            <Link
              to="/chat"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-civic-blue-600 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              <span>{t('talkWithAIBtn')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((c) => (
            <div
              key={c.complaint_id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-civic-navy-900 text-xs">
                    #{c.complaint_id}
                  </span>
                  <StatusBadge 
                    status={c.status} 
                    isCitizenVerified={c.is_citizen_verified} 
                  />
                </div>

                <h3 className="font-bold text-slate-800 text-sm line-clamp-2">
                  {c.title}
                </h3>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>📍 <strong>{t('locationLabelShort')}</strong> {c.location}</div>
                  {c.department_name && (
                    <div>🏢 <strong>{t('deptLabel')}</strong> {c.department_name}</div>
                  )}
                  <div>📅 <strong>{t('submittedLabel')}</strong> {new Date(c.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-civic-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {c.category}
                </span>

                <Link
                  to={`/track?id=${c.complaint_id}`}
                  className="flex items-center gap-1.5 text-xs font-bold text-civic-navy-900 hover:text-civic-blue-600 transition-colors"
                >
                  <span>{t('trackAndDetails')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
