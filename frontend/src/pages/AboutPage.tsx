import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Bot, 
  Languages, 
  HelpCircle, 
  FolderTree, 
  MapPin, 
  FileCheck, 
  ShieldCheck, 
  Smartphone, 
  Info, 
  ShieldAlert,
  Code,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const AboutPage: React.FC = () => {
  const { language, t } = useLanguage();

  const keyFeatures = [
    {
      id: 1,
      title: "AI-assisted civic complaint registration",
      tamilTitle: "AI-வழிகாட்டப்பட்ட குறை பதிவு",
      desc: "Helps citizens format unstructured descriptions into actionable municipal reports through an intuitive conversational chatbot.",
      icon: Bot,
      color: "bg-blue-50 text-civic-blue-600 border-blue-200"
    },
    {
      id: 2,
      title: "Multilingual text and voice interaction",
      tamilTitle: "பன்மொழி குரல் மற்றும் எழுத்து தொடர்பு",
      desc: "Supports native Tamil script, Tanglish phonetic transcription, and English using browser-native Web Speech recognition and synthesis.",
      icon: Languages,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200"
    },
    {
      id: 3,
      title: "Guided questions to collect missing complaint information",
      tamilTitle: "விடுபட்ட தகவல்களைக் கேட்கும் வழிகாட்டி",
      desc: "Analyzes citizen inputs in real time, identifies missing attributes (location, persistence duration, landmarks), and asks targeted follow-up prompts.",
      icon: HelpCircle,
      color: "bg-amber-50 text-amber-600 border-amber-200"
    },
    {
      id: 4,
      title: "Civic issue categorization",
      tamilTitle: "குறை வகைப்பாடு",
      desc: "Rule-based classification into 10 civic domains (streetlights, potholes, garbage, water, sewage, public property, etc.) to prevent AI hallucinations.",
      icon: FolderTree,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200"
    },
    {
      id: 5,
      title: "Address validation and location suggestions, when configured",
      tamilTitle: "முகவரி சரிபார்ப்பு & வரைபடப் பரிந்துரை",
      desc: "Free OpenStreetMap Nominatim spatial verification providing up to 3 candidate location matches with coordinates, without rejecting unlisted streets.",
      icon: MapPin,
      color: "bg-teal-50 text-teal-600 border-teal-200"
    },
    {
      id: 6,
      title: "Complaint ID generation and status tracking",
      tamilTitle: "தனித்துவ அடையாள எண் & கண்காணிப்பு",
      desc: "Generates traceable IDs (e.g. NC-2026-XXXXX) allowing citizens and officials to track lifecycle stages across triage, dispatch, and completion.",
      icon: FileCheck,
      color: "bg-purple-50 text-purple-600 border-purple-200"
    },
    {
      id: 7,
      title: "Citizen verification of complaint resolution",
      tamilTitle: "குடிமக்கள் தீர்வு சரிபார்ப்பு",
      desc: "Closed-loop governance requiring citizen confirmation before complaints can be closed, empowering users to reopen unresolved issues.",
      icon: ShieldCheck,
      color: "bg-rose-50 text-rose-600 border-rose-200"
    },
    {
      id: 8,
      title: "A simple and accessible user interface",
      tamilTitle: "எளிமையான மற்றும் அணுகக்கூடிய இடைமுகம்",
      desc: "Responsive web interface with high contrast options, keyboard accessibility, clear status badges, and mobile-first responsiveness.",
      icon: Smartphone,
      color: "bg-slate-50 text-slate-700 border-slate-200"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-civic-blue-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToHome')}</span>
        </Link>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          About & Overview
        </span>
      </div>

      {/* Hero Brand Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-civic-navy-900 to-civic-blue-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Building2 className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-civic-navy-900">
                NammaCivic AI
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-civic-blue-50 text-civic-blue-700 border border-civic-blue-200">
                v1.0.0
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-tamil mt-1">
              நம்ம ஊர் • நம்ம சேவை • AI-வழிகாட்டப்பட்ட உள்ளாட்சி குறைதீர்வு தளம்
            </p>
          </div>
        </div>

        {/* Short Abstract (EXACT REQUIRED WORDING) */}
        <div className="mt-6 p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-civic-blue-700 uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>Project Abstract</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans font-medium">
            "NammaCivic AI is an AI-assisted civic grievance platform designed to help citizens report local community problems and track their progress. It supports text and voice-based interaction in English, Tamil and Tanglish, helping users describe issues, provide location details and submit complaints through a guided conversational interface. The system aims to improve accessibility, complaint tracking and citizen participation in local civic services."
          </p>
        </div>
      </div>

      {/* 8 Key Features Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-civic-blue-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-civic-navy-900">
            {t('aboutKeyFeaturesTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Engineered to remove friction in municipal complaint registration and citizen follow-ups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keyFeatures.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={feat.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-civic-blue-400 hover:shadow-sm transition-all space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${feat.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Feature 0{feat.id}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-civic-navy-900 leading-snug">
                        {feat.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {feat.desc}
                  </p>
                </div>

                {language === 'ta' && (
                  <p className="text-[11px] text-civic-blue-700 font-tamil font-medium pt-1 border-t border-slate-100">
                    {feat.tamilTitle}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Project Details & Disclaimer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Project Meta Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-civic-navy-900 font-bold text-base pb-3 border-b border-slate-100">
            <Code className="w-5 h-5 text-civic-blue-600" />
            <span>Project Specification</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Project Name</span>
              <strong className="text-civic-navy-900 text-sm">NammaCivic AI</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Project Purpose</span>
              <p className="text-slate-700">Simplifying civic grievance reporting and tracking.</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Application Version</span>
              <span className="font-mono font-semibold text-slate-800">1.0.0 (Prototype Build)</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Subsystem Technology</span>
              <p className="text-slate-600 font-mono text-[11px]">
                FastAPI • React + Vite • TypeScript • OpenStreetMap Nominatim • SQLite / PostgreSQL
              </p>
            </div>
          </div>
        </div>

        {/* Project Disclaimer (Mandatory) */}
        <div className="bg-amber-50/70 rounded-3xl border border-amber-200 p-6 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base pb-3 border-b border-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>{t('aboutDisclaimerTitle')}</span>
          </div>

          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-sans">
            {t('aboutDisclaimerText')}
          </p>

          <div className="pt-2 text-[11px] text-amber-800 space-y-1">
            <p>• Data records are test points for college demonstration.</p>
            <p>• Department names and zones reflect standard Tamil Nadu municipal divisions for architectural realism.</p>
          </div>
        </div>

      </div>

    </div>
  );
};
