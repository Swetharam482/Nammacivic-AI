import React from 'react';
import { AlertTriangle, ExternalLink, ArrowRight, X } from 'lucide-react';
import { DuplicateMatch } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  isOpen: boolean;
  matches: DuplicateMatch[];
  onProceed: () => void;
  onCancel: () => void;
}

export const DuplicateWarningModal: React.FC<Props> = ({
  isOpen,
  matches,
  onProceed,
  onCancel
}) => {
  const { t } = useLanguage();
  if (!isOpen || matches.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-civic-navy-900">
                {t('duplicateModalTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('duplicateNotice')}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 my-4 max-h-60 overflow-y-auto pr-1">
          {matches.map((m) => (
            <div 
              key={m.complaint_id}
              className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/60 text-xs"
            >
              <div className="flex items-center justify-between font-bold text-civic-navy-900 mb-1">
                <span>#{m.complaint_id}</span>
                <span className="text-[11px] font-normal text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                  {Math.round(m.similarity_score * 100)}% Match
                </span>
              </div>
              <p className="text-slate-700 font-medium">{m.title}</p>
              <div className="flex items-center gap-3 text-slate-500 mt-1.5 text-[11px]">
                <span>📍 {m.location}</span>
                <span>📅 {new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-600 mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 leading-relaxed">
          {t('duplicateModalDesc')}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Review Details
          </button>
          <button
            type="button"
            onClick={onProceed}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-civic-blue-600 hover:bg-civic-blue-700 text-white shadow-md transition-all flex items-center gap-1.5"
          >
            <span>{t('submitAnywayBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
