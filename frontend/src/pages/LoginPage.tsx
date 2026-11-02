import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  X,
  UserCheck,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, logout } = useAuth();
  const { t } = useLanguage();
  
  // Account Type Selection: 'user' | 'officer'
  const [accountType, setAccountType] = useState<'user' | 'officer'>('user');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot / Reset Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'reset' | 'done'>('request');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotErr, setForgotErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const redirectUrl = searchParams.get('redirect');
    try {
      const loggedUser = await login({ email: email.trim(), password });
      
      if (accountType === 'officer') {
        const isOfficer = loggedUser.role === 'OFFICER' || loggedUser.role === 'DEMO_ADMIN' || loggedUser.role === 'ADMIN';
        if (isOfficer) {
          navigate(redirectUrl || '/demo-authority');
        } else {
          logout();
          setError('Access denied. This account does not have officer privileges.');
        }
      } else {
        // User login
        if (loggedUser.role === 'OFFICER' || loggedUser.role === 'DEMO_ADMIN') {
          navigate(redirectUrl || '/demo-authority');
        } else {
          navigate(redirectUrl || '/my-complaints');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestResetToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotErr('');
    setForgotMsg('');
    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotMsg(res.message);
      if (res.reset_token) {
        setResetToken(res.reset_token);
      }
      setForgotStep('reset');
    } catch (err: any) {
      setForgotErr(err.message || 'Failed to generate reset request');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotErr('');
    try {
      const res = await api.resetPassword({
        token: resetToken.trim(),
        new_password: newPassword
      });
      setForgotMsg(res.message);
      setForgotStep('done');
      setEmail(forgotEmail);
      setPassword(newPassword);
    } catch (err: any) {
      setForgotErr(err.message || 'Failed to update password');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep('request');
    setForgotMsg('');
    setForgotErr('');
    setResetToken('');
    setNewPassword('');
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated Civic Atmosphere Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-sky-50/50 to-blue-50/40 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300/10 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl p-8 space-y-6 relative transition-all">
          
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="relative inline-block">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-civic-navy-900 via-blue-700 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 transform hover:scale-105 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-civic-navy-900 tracking-tight">
              {accountType === 'officer' ? 'Officer Sign In' : 'Sign In'}
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {accountType === 'officer' 
                ? 'NammaCivic AI • Municipal Authority Portal' 
                : 'NammaCivic AI • Smart Grievance Redressal Portal'}
            </p>
          </div>

          {/* Account Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 text-center">
              Who would you like to sign in as?
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAccountType('user');
                  setError('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  accountType === 'user'
                    ? 'bg-white text-civic-navy-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4 text-civic-blue-600" />
                <span>User</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountType('officer');
                  setError('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  accountType === 'officer'
                    ? 'bg-white text-civic-navy-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Officer</span>
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials Assistant */}
          {accountType === 'officer' ? (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-center justify-between text-xs text-emerald-800 animate-fadeIn">
              <div>
                <p className="font-bold text-[11px] text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Demo Officer Account</span>
                </p>
                <p className="text-[10px] text-emerald-700 mt-0.5 font-mono">
                  demo@gmail.com • DemoOfficer@2026!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('demo@gmail.com');
                  setPassword('DemoOfficer@2026!');
                  setError('');
                }}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-[11px] font-bold shadow-xs transition-all"
              >
                Auto-fill
              </button>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/80 border border-blue-200/90 rounded-2xl flex items-center justify-between text-xs text-blue-800 animate-fadeIn">
              <div>
                <p className="font-bold text-[11px] text-blue-950 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-civic-blue-600" />
                  <span>Demo Citizen Account</span>
                </p>
                <p className="text-[10px] text-blue-700 mt-0.5 font-mono">
                  citizen@example.com • Password123!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('citizen@example.com');
                  setPassword('Password123!');
                  setError('');
                }}
                className="px-2.5 py-1.5 bg-civic-blue-600 hover:bg-civic-blue-700 active:scale-95 text-white rounded-xl text-[11px] font-bold shadow-xs transition-all"
              >
                Auto-fill
              </button>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 shadow-sm animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-civic-navy-900 mb-1.5 text-xs">
                {t('emailAddress')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={accountType === 'officer' ? 'officer@gcc.gov.in' : 'citizen@example.com'}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500 text-xs sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-civic-navy-900 mb-1.5 text-xs">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue-500 text-xs sm:text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Forgot Password Link directly below the password field */}
              <div className="flex justify-end pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] font-bold text-civic-blue-600 hover:text-civic-blue-800 hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-civic-navy-900 via-civic-blue-600 to-blue-700 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>{isLoading ? t('signingIn') : t('signInBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {accountType === 'user' && (
            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>{t('noAccount')} </span>
              <Link to="/register" className="font-bold text-civic-blue-600 hover:underline">
                {t('registerHere')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative">
            <button
              onClick={closeForgotModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-civic-blue-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-civic-navy-900">
                  {forgotStep === 'request' && 'Reset Your Password'}
                  {forgotStep === 'reset' && 'Set New Password'}
                  {forgotStep === 'done' && 'Password Updated!'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Secure account recovery via single-use reset token
                </p>
              </div>
            </div>

            {forgotMsg && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                {forgotMsg}
              </div>
            )}

            {forgotErr && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {forgotErr}
              </div>
            )}

            {/* Step 1: Request token with Email */}
            {forgotStep === 'request' && (
              <form onSubmit={handleRequestResetToken} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={closeForgotModal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 rounded-xl bg-civic-blue-600 hover:bg-civic-blue-700 text-white font-bold text-xs uppercase shadow-sm disabled:opacity-50"
                  >
                    {forgotLoading ? 'Processing...' : 'Send Reset Token'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Enter token & new password */}
            {forgotStep === 'reset' && (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste secure token"
                    required
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      className="w-full px-3 py-2 pr-10 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('request')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase shadow-sm disabled:opacity-50"
                  >
                    {forgotLoading ? 'Updating...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success state */}
            {forgotStep === 'done' && (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-xs text-slate-600">
                  Your password has been securely updated. You can now sign in with your new credentials.
                </p>
                <button
                  type="button"
                  onClick={closeForgotModal}
                  className="px-6 py-2 bg-civic-blue-600 text-white font-bold text-xs rounded-xl hover:bg-civic-blue-700"
                >
                  Proceed to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
