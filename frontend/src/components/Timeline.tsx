import React from 'react';
import { StatusHistory } from '../types';
import { CheckCircle2, Clock, Wrench, AlertTriangle, RotateCcw, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  currentStatus: string;
  history: StatusHistory[];
}

export const Timeline: React.FC<Props> = ({ currentStatus, history }) => {
  const { t } = useLanguage();
  const isReopened = currentStatus === 'REOPENED';

  const stages = [
    { key: 'SUBMITTED', label: t('statusSubmitted') },
    { key: 'ASSIGNED', label: t('statusAssigned') },
    { key: 'IN_PROGRESS', label: t('statusInProgress') },
    { key: 'RESOLUTION_PENDING_VERIFICATION', label: t('statusPendingVerification') },
    { key: 'CLOSED', label: t('statusClosed') }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 0;
      case 'ASSIGNED': return 1;
      case 'IN_PROGRESS': return 2;
      case 'RESOLUTION_PENDING_VERIFICATION': return 3;
      case 'CLOSED': return 4;
      case 'REOPENED': return 2; // back in progress
      default: return 0;
    }
  };

  const currentStep = getStepIndex(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Step Progress Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between relative overflow-x-auto pb-2">
          {stages.map((stage, idx) => {
            const isCompleted = currentStep > idx || (currentStep === 4 && idx === 4);
            const isCurrent = currentStep === idx && !(currentStatus === 'CLOSED' && idx < 4);

            return (
              <div key={stage.key} className="flex flex-col items-center flex-1 min-w-[100px] text-center z-10 relative">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-50' 
                      : isCurrent 
                        ? (isReopened ? 'bg-rose-600 text-white ring-4 ring-rose-50' : 'bg-civic-blue-600 text-white ring-4 ring-blue-50')
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-civic-navy-900 font-bold' : 'text-slate-500'}`}>
                  {stage.label}
                </span>
              </div>
            );
          })}

          {/* Background progress connector bar */}
          <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-slate-200 -z-0">
            <div 
              className={`h-full transition-all duration-500 ${isReopened ? 'bg-rose-500' : 'bg-emerald-600'}`}
              style={{ width: `${Math.min(100, (currentStep / (stages.length - 1)) * 100)}%` }}
            />
          </div>
        </div>

        {isReopened && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <RotateCcw className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span><strong>{t('statusReopened')}:</strong> This grievance was reopened by the reporting citizen. Field inspection re-engaged.</span>
          </div>
        )}
      </div>

      {/* Detailed Audit History Logs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-civic-navy-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-civic-blue-600" />
          <span>{t('statusTimelineTitle')}</span>
        </h4>

        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
          {history.map((item, i) => (
            <div key={item.id || i} className="relative flex items-start gap-4 pl-8">
              {/* Dot */}
              <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-civic-blue-600 -translate-x-1/2" />
              
              <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <span className="font-semibold text-civic-navy-900">
                    {item.to_status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-slate-700 text-xs mt-1 bg-white p-2.5 rounded-lg border border-slate-100">
                    {item.notes}
                  </p>
                )}

                <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                  <span className="font-medium">Action By:</span>
                  <span className="px-2 py-0.5 bg-slate-200 rounded text-slate-700 font-mono text-[10px]">
                    {item.action_by}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
