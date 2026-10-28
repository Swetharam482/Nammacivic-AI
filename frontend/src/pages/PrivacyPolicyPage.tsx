import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldCheck, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/terms"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-civic-blue-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Terms & Conditions</span>
        </Link>

        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
          Official Policy Placeholder
        </span>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-civic-blue-600 flex items-center justify-center font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-civic-navy-900">
                Privacy Policy
              </h1>
              <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                Notice: Formal Legal Policy Placeholder
              </span>
            </div>
          </div>
        </div>

        {/* Clear Notice Banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong>Placeholder Notice:</strong>
            <p className="leading-relaxed">
              This document serves as the formal placeholder for NammaCivic AI's full privacy policy. In accordance with platform guidelines, we outline actual implemented data practices below rather than inventing unsubstantiated legal claims.
            </p>
          </div>
        </div>

        {/* Factual Data Handling Practices in Current Prototype */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          <h2 className="text-base font-bold text-civic-navy-900">
            Actual Data Handling Practices
          </h2>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-civic-navy-900 block text-xs uppercase tracking-wider text-slate-500">
                1. Local Browser Storage
              </strong>
              <p>
                We store citizen interface preferences (language selection, font size, high contrast mode, and voice settings) locally in your browser's <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">localStorage</code>. No tracking cookies or advertising pixels are used.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-civic-navy-900 block text-xs uppercase tracking-wider text-slate-500">
                2. Complaint & Location Data
              </strong>
              <p>
                Information submitted through grievance forms (category, issue description, location, duration, and optional name/phone) is saved in the local development database to simulate municipal triage and tracking.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-civic-navy-900 block text-xs uppercase tracking-wider text-slate-500">
                3. Privacy Sanitization for Map Verification
              </strong>
              <p>
                Before sending address queries to OpenStreetMap Nominatim, our backend automatically strips out phone numbers, email addresses, and personal filler to respect OpenStreetMap privacy policies and protect citizen confidentiality.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-civic-navy-900 block text-xs uppercase tracking-wider text-slate-500">
                4. Voice Audio Processing
              </strong>
              <p>
                Speech recognition and speech synthesis are processed via the standard browser Web Speech API. NammaCivic AI does not store or sell your microphone audio recordings.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Application: NammaCivic AI v1.0.0</span>
          <span>Last Updated: October 2026</span>
        </div>

      </div>

    </div>
  );
};
