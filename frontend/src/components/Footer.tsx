import React from 'react';
import { Building2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-civic-navy-950 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-civic-blue-600 flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">NammaCivic AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {t('subtagline')}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/50 p-2.5 rounded-xl max-w-md">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{t('aboutDisclaimerText')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Civic Redressal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/report" className="hover:text-white transition-colors">
                  {t('navReport')}
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors">
                  {t('navTrack')}
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-white transition-colors">
                  {t('navTalkToAI')}
                </Link>
              </li>
              <li>
                <Link to="/my-complaints" className="hover:text-white transition-colors">
                  {t('navMyComplaints')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Information Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Help & Information
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/how-to-use" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>📖 {t('navHowToUse')}</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>ℹ️ {t('navAbout')}</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>📄 {t('navTerms')}</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400">
                  <span>🔒 {t('navPrivacy')}</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-white transition-colors flex items-center gap-1.5 text-blue-400">
                  <span>⚙️ {t('navSettings')}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 NammaCivic AI • {t('tagline')}</p>
          <p className="flex items-center gap-1 text-[11px] text-slate-400">
            Map & geocoding data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-white">OpenStreetMap</a> contributors (ODbL 1.0)
          </p>
        </div>
      </div>
    </footer>
  );
};
