import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Send } from 'lucide-react';
import { api } from '../services/api';
import { Complaint } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  complaint: Complaint;
  onVerificationSubmitted: (updated: Complaint) => void;
}

export const ResolutionBanner: React.FC<Props> = ({ complaint, onVerificationSubmitted }) => {
  const { t } = useLanguage();
  const [choice, setChoice] = useState<'yes' | 'no' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (complaint.status !== 'RESOLUTION_PENDING_VERIFICATION') {
    return null;
  }

  const handleSubmit = async () => {
    if (choice === 'no' && !reopenReason.trim()) {
      setError(t('reopenReasonPlaceholder'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updated = await api.verifyResolution(complaint.complaint_id, {
        is_resolved: choice === 'yes',
        citizen_feedback: choice === 'yes' ? feedback : undefined,
        reopen_reason: choice === 'no' ? reopenReason : undefined
      });
      onVerificationSubmitted(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to submit verification response');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-purple-400/40 relative overflow-hidden">
      {/* Decorative ambient backdrop */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-amber-400 text-slate-900 rounded-xl font-bold shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              {t('citizenVerified')} • Redressal Verification
            </span>
            <h3 className="text-xl font-bold text-white">
              {t('verificationBannerTitle')}
            </h3>
          </div>
        </div>

        <p className="text-sm text-purple-100 mb-4 max-w-2xl leading-relaxed">
          {t('verificationBannerDesc')}
        </p>

        {complaint.resolution_notes && (
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15 mb-5 text-xs text-purple-100">
            <span className="font-semibold text-white block mb-1">Field Resolution Notes:</span>
            <p className="font-mono text-purple-200">{complaint.resolution_notes}</p>
          </div>
        )}

        {/* Choice buttons */}
        <div className="flex flex-wrap gap-4 mb-5">
          <button
            type="button"
            onClick={() => { setChoice('yes'); setError(''); }}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
              choice === 'yes'
                ? 'bg-emerald-500 text-white ring-4 ring-emerald-300/40 scale-105'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span>{t('yesResolvedBtn')}</span>
          </button>

          <button
            type="button"
            onClick={() => { setChoice('no'); setError(''); }}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
              choice === 'no'
                ? 'bg-rose-500 text-white ring-4 ring-rose-300/40 scale-105'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
          >
            <XCircle className="w-5 h-5 text-rose-300" />
            <span>{t('noReopenBtn')}</span>
          </button>
        </div>

        {/* Conditional forms */}
        {choice === 'yes' && (
          <div className="bg-white/10 p-4 sm:p-5 rounded-2xl border border-white/20 space-y-3 animate-fadeIn">
            <label className="block text-xs font-medium text-emerald-200">
              {t('feedbackPlaceholder')}
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Work completed satisfactorily. Thank you!"
              rows={2}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/90 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 text-white shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? t('loading') : t('submitVerificationBtn')}</span>
            </button>
          </div>
        )}

        {choice === 'no' && (
          <div className="bg-white/10 p-4 sm:p-5 rounded-2xl border border-white/20 space-y-3 animate-fadeIn">
            <label className="block text-xs font-semibold text-rose-200">
              {t('reopenReasonPlaceholder')}
            </label>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. The leak was not properly plugged and water is still overflowing."
              rows={3}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/90 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
              required
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 text-white shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? t('loading') : t('submitVerificationBtn')}</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-rose-500/30 border border-rose-400/50 rounded-xl text-xs text-rose-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
