import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login({ email: email.trim(), password });
      navigate('/my-complaints');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCitizen = () => {
    setEmail('citizen@example.com');
    setPassword('Password123!');
  };

  const fillDemoOfficer = () => {
    setEmail('officer@example.com');
    setPassword('Password123!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-civic-navy-900 to-civic-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-civic-navy-900">
            {t('citizenSignIn')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('signInSubtitle')}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Fast Login Buttons */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
          <span className="text-[11px] font-bold text-civic-blue-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('demoQuickFill')}</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoCitizen}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200 rounded-xl shadow-sm transition-colors text-center"
            >
              {t('demoCitizen')}
            </button>
            <button
              type="button"
              onClick={fillDemoOfficer}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200 rounded-xl shadow-sm transition-colors text-center"
            >
              {t('demoOfficer')}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-civic-navy-900 mb-1.5">
              {t('emailAddress')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-civic-navy-900 mb-1.5">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-civic-blue-600 hover:bg-civic-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <span>{isLoading ? t('signingIn') : t('signInBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>{t('noAccount')} </span>
          <Link to="/register" className="font-bold text-civic-blue-600 hover:underline">
            {t('registerHere')}
          </Link>
        </div>

      </div>
    </div>
  );
};
