import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  Languages, 
  Mic, 
  Volume2, 
  Eye, 
  Bell, 
  Info, 
  Check, 
  AlertCircle, 
  Sparkles,
  RotateCcw,
  VolumeX,
  MicOff,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';
import { speechService } from '../services/speech';

export const SettingsPage: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    t,
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
    voiceInputEnabled,
    setVoiceInputEnabled,
    voiceOutputEnabled,
    setVoiceOutputEnabled,
    preferredSpeechLang,
    setPreferredSpeechLang
  } = useLanguage();

  const [saveToast, setSaveToast] = useState('');
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState(false);

  const showSaveNotice = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3000);
  };

  const isMicSupported = speechService.isSpeechRecognitionSupported();
  const isTtsSupported = speechService.isSpeechSynthesisSupported();

  const handleTestSpeech = () => {
    if (!isTtsSupported) return;
    setIsPlayingTestAudio(true);
    const testPhrase = preferredSpeechLang === 'ta'
      ? "வணக்கம்! நம்ம சிவிக் AI குரல் சோதனை வெற்றிகரமாக முடிந்தது."
      : "Welcome! NammaCivic AI voice test completed successfully.";

    speechService.speak(testPhrase, preferredSpeechLang);
    setTimeout(() => setIsPlayingTestAudio(false), 3000);
  };

  const handleResetToDefaults = () => {
    setLanguage('en');
    setTextSize('normal');
    setHighContrast(false);
    setVoiceInputEnabled(true);
    setVoiceOutputEnabled(true);
    setPreferredSpeechLang('en');
    showSaveNotice('Settings reset to default values.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-civic-blue-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToHome')}</span>
        </Link>

        <button
          type="button"
          onClick={handleResetToDefaults}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-civic-blue-50 text-civic-blue-600 border border-civic-blue-100 flex items-center justify-center font-bold">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-civic-navy-900">
              {t('settingsTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
              {t('settingsSubtitle')}
            </p>
          </div>
        </div>

        {saveToast && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveToast}</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        
        {/* 1. Language Settings */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Languages className="w-5 h-5 text-civic-blue-600" />
            <div>
              <h2 className="text-base font-bold text-civic-navy-900">
                {t('langSettingsTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('langSettingsDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { code: 'en', label: 'English', sub: 'Standard interface', badge: 'EN' },
              { code: 'ta', label: 'தமிழ் (Tamil)', sub: 'தூய தமிழ் இடைமுகம்', badge: 'TA' },
              { code: 'tanglish', label: 'Tanglish', sub: 'Colloquial phonetics', badge: 'TANG' },
            ].map((item) => {
              const isSelected = language === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code as Language);
                    showSaveNotice(`Language changed to ${item.label}. Preferences saved.`);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-blue-50/80 border-civic-blue-600 ring-2 ring-civic-blue-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm text-civic-navy-900">
                      {item.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-civic-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{item.sub}</p>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 italic pt-1">
            * Note: Personal citizen names, entered street addresses, and unique grievance tracking IDs (NC-2026-XXXXX) are intentionally preserved without machine translation.
          </p>
        </div>

        {/* 2. Voice Settings */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Volume2 className="w-5 h-5 text-civic-blue-600" />
            <div>
              <h2 className="text-base font-bold text-civic-navy-900">
                {t('voiceSettingsTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('voiceSettingsDesc')}
              </p>
            </div>
          </div>

          {/* Device & Browser Speech Support Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Browser Compatibility Check:</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isMicSupported ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  Microphone: {isMicSupported ? 'Supported' : 'Unsupported'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isTtsSupported ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  Voice Playback: {isTtsSupported ? 'Supported' : 'Unsupported'}
                </span>
              </div>
            </div>

            {(!isMicSupported || !isTtsSupported) && (
              <div className="flex items-start gap-2 text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <p className="text-[11px]">
                  Web Speech API is best supported in modern desktop and mobile browsers like <strong>Google Chrome</strong> and <strong>Microsoft Edge</strong>. If microphone input is unavailable, you can always type complaints seamlessly.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
            {/* Voice Input Toggle */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">Voice Microphone Input</span>
                <p className="text-slate-500 text-[11px]">Allow voice dictation in Tamil and English</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVoiceInputEnabled(!voiceInputEnabled);
                  showSaveNotice(`Voice input ${!voiceInputEnabled ? 'enabled' : 'disabled'}.`);
                }}
                className={`p-2 rounded-xl transition-colors ${
                  voiceInputEnabled ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {voiceInputEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Read Aloud Toggle */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">Spoken Chatbot Responses</span>
                <p className="text-slate-500 text-[11px]">Read assistant answers aloud via TTS</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVoiceOutputEnabled(!voiceOutputEnabled);
                  showSaveNotice(`Spoken responses ${!voiceOutputEnabled ? 'enabled' : 'disabled'}.`);
                }}
                className={`p-2 rounded-xl transition-colors ${
                  voiceOutputEnabled ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {voiceOutputEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Preferred Speech Synthesis Voice Language & Test Audio */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block">Preferred Speech Audio Voice</span>
              <p className="text-slate-500 text-[11px]">
                {preferredSpeechLang === 'ta' 
                  ? 'Tamil Voice (ta-IN) selected. If your browser lacks a Tamil voice pack, it falls back to Indian English with prior notice.'
                  : 'Indian English Voice (en-IN) selected.'
                }
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={preferredSpeechLang}
                onChange={(e) => {
                  setPreferredSpeechLang(e.target.value as 'ta' | 'en');
                  showSaveNotice(`Speech audio voice updated to ${e.target.value === 'ta' ? 'Tamil' : 'English'}.`);
                }}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700"
              >
                <option value="en">English (en-IN)</option>
                <option value="ta">தமிழ் (ta-IN)</option>
              </select>

              <button
                type="button"
                onClick={handleTestSpeech}
                disabled={isPlayingTestAudio || !isTtsSupported}
                className="px-3 py-2 bg-civic-navy-900 hover:bg-civic-navy-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex-shrink-0"
              >
                {isPlayingTestAudio ? 'Playing...' : 'Test Voice'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Accessibility & Visual Comfort */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Eye className="w-5 h-5 text-civic-blue-600" />
            <div>
              <h2 className="text-base font-bold text-civic-navy-900">
                {t('accessSettingsTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('accessSettingsDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Text Scaling */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
              <span className="font-bold text-slate-800 block">Text Size Scaling</span>
              <p className="text-slate-500 text-[11px]">Enlarge typography for enhanced readability</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTextSize('normal');
                    showSaveNotice('Text size set to Standard.');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    textSize === 'normal' 
                      ? 'bg-civic-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Standard (100%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTextSize('large');
                    showSaveNotice('Text size set to Large (112%).');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    textSize === 'large' 
                      ? 'bg-civic-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Larger (112%)
                </button>
              </div>
            </div>

            {/* High Contrast Mode */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
              <span className="font-bold text-slate-800 block">High Contrast Mode</span>
              <p className="text-slate-500 text-[11px]">Deepen text boundaries and button contrasts</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setHighContrast(!highContrast);
                    showSaveNotice(`High contrast ${!highContrast ? 'enabled' : 'disabled'}.`);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    highContrast 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {highContrast ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <strong>Keyboard Navigation:</strong> All interactive controls, cards, and buttons feature high-visibility blue focus rings for screen reader and keyboard tab navigation.
          </div>
        </div>

        {/* 4. Notifications Explanation */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Bell className="w-5 h-5 text-civic-blue-600" />
            <div>
              <h2 className="text-base font-bold text-civic-navy-900">
                Grievance Status Notifications
              </h2>
              <p className="text-xs text-slate-500">
                How updates are delivered to citizens in NammaCivic AI.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-2">
            <p>
              In this prototype environment, status transitions (e.g. <em>Submitted ➔ Assigned ➔ In Progress ➔ Awaiting Verification</em>) are tracked directly in real time on the <strong>Track Grievance</strong> portal using your unique complaint ID.
            </p>
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-slate-700 text-[11px]">
              💡 <em>Implementation Note:</em> Direct SMS / WhatsApp gateways are not simulated with fake switches to avoid misleading citizens. In production, localized SMS alerts are dispatched when zonal teams verify completion.
            </div>
          </div>
        </div>

        {/* 5. App & Technical Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Info className="w-5 h-5 text-civic-blue-600" />
            <div>
              <h2 className="text-base font-bold text-civic-navy-900">
                {t('appInfoTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('appInfoDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">APPLICATION VERSION</span>
              <strong className="text-civic-navy-900">v1.0.0 (Cap-Stone Prototype)</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">GEOCODING PROVIDER</span>
              <strong className="text-civic-navy-900">OpenStreetMap Nominatim (Free, No Keys)</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">AI ENGINE</span>
              <strong className="text-civic-navy-900">Tamil/Tanglish Rule Fallback + Gemini</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">DATABASE ARCHITECTURE</span>
              <strong className="text-civic-navy-900">SQLite Development / PostgreSQL Prod</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
