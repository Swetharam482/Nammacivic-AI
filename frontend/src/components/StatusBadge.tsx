import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, RotateCcw, ShieldCheck, Wrench, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  status: string;
  isCitizenVerified?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<Props> = ({ status, isCitizenVerified, className = '' }) => {
  const { t } = useLanguage();

  let config = {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    icon: Clock,
    label: status.replace(/_/g, ' ')
  };

  switch (status) {
    case 'SUBMITTED':
      config = {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: Send,
        label: t('statusSubmitted')
      };
      break;
    case 'ASSIGNED':
      config = {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        icon: Clock,
        label: t('statusAssigned')
      };
      break;
    case 'IN_PROGRESS':
      config = {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        icon: Wrench,
        label: t('statusInProgress')
      };
      break;
    case 'RESOLUTION_PENDING_VERIFICATION':
      config = {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-300',
        icon: AlertTriangle,
        label: t('statusPendingVerification')
      };
      break;
    case 'CLOSED':
      config = {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-300',
        icon: CheckCircle2,
        label: t('statusClosed')
      };
      break;
    case 'REOPENED':
      config = {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-300',
        icon: RotateCcw,
        label: t('statusReopened')
      };
      break;
  }

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
      </span>

      {isCitizenVerified && status === 'CLOSED' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('citizenVerified')}</span>
        </span>
      )}
    </div>
  );
};
