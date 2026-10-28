import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Search, 
  Building2,
  Bot
} from 'lucide-react';
import { api } from '../services/api';
import { Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useLanguage } from '../contexts/LanguageContext';

export const ComplaintSuccessPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const complaintId = searchParams.get('id') || '';

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadComplaint() {
      if (complaintId) {
        try {
          const data = await api.getComplaint(complaintId);
          setComplaint(data);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadComplaint();
  }, [complaintId]);

  const copyToClipboard = () => {
    if (complaintId) {
      navigator.clipboard.writeText(complaintId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden">
        
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-5 shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
          {t('registrationConfirmed')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-civic-navy-900 mb-2">
          {t('civicGrievanceSuccessfullyLogged')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
          {t('successSubtitle')}
        </p>

        {/* Complaint ID Copy Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 max-w-md mx-auto">
          <span className="text-xs text-slate-500 font-medium block mb-1">
            {t('uniqueTrackingId')}
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-2xl font-black text-civic-navy-900 tracking-wider">
              {complaintId || 'NC-2026-PENDING'}
            </span>
            <button
              type="button"
              onClick={copyToClipboard}
              className="p-2 text-slate-500 hover:text-civic-blue-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-sm transition-colors"
              title={t('copyId')}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copied && (
            <span className="text-[11px] text-emerald-600 font-bold block mt-1 animate-fadeIn">
              {t('copiedSuccess')}
            </span>
          )}
        </div>

        {/* Breakdown Card */}
        {complaint && (
          <div className="text-left bg-slate-50/60 rounded-2xl p-5 border border-slate-200 text-xs space-y-3 mb-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-civic-navy-900">{t('grievanceOverview')}</span>
              <StatusBadge status={complaint.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">{t('category')}</span>
                <span className="font-semibold text-slate-800">{complaint.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t('assessedPriority')}</span>
                <span className="font-semibold text-slate-800">{complaint.priority}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">{t('locationLabel')}</span>
                <span className="font-semibold text-slate-800">{complaint.location}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">{t('assignedDepartment')}</span>
                <span className="font-semibold text-slate-800">
                  {complaint.department?.name || 'Greater Chennai Corporation Works'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/track?id=${encodeURIComponent(complaintId)}`}
            className="w-full sm:w-auto px-6 py-3.5 bg-civic-blue-600 hover:bg-civic-blue-700 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{t('trackComplaintStatusNow')}</span>
          </Link>

          <Link
            to="/chat"
            className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4 text-civic-blue-600" />
            <span>{t('reportAnotherIssue')}</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
