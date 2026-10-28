import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bot, 
  FileText, 
  Search, 
  Lightbulb, 
  Trash2, 
  Construction, 
  Droplets, 
  Waves, 
  ShieldCheck, 
  Sparkles, 
  Mic, 
  ArrowRight, 
  Languages, 
  CheckCircle2, 
  HelpCircle,
  Building2,
  Users
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [trackId, setTrackId] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId.trim()) {
      navigate(`/track?id=${encodeURIComponent(trackId.trim().toUpperCase())}`);
    }
  };

  const categories = [
    {
      id: 'STREETLIGHT',
      title: t('catStreetlight'),
      desc: language === 'ta' 
        ? 'எரியாத விளக்குகள், பழுதடைந்த மின்கம்பங்கள் அல்லது இருண்ட தெருக்கள்.'
        : language === 'tanglish'
          ? 'Street light eriyala, dark streets or damaged electric poles.'
          : 'Dark streets, damaged lamp posts, burnt bulbs, or non-functional junction high-masts.',
      icon: Lightbulb,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    },
    {
      id: 'ROAD',
      title: t('catRoad'),
      desc: language === 'ta'
        ? 'சாலைப் பள்ளங்கள், பழுதடைந்த தார் சாலைகள் அல்லது நடைபாதை சேதங்கள்.'
        : language === 'tanglish'
          ? 'Road-la periya kuzhi, damaged tar road or platform problems.'
          : 'Damaged tar roads, monsoon potholes, crater hazards, or uneven pedestrian footpaths.',
      icon: Construction,
      color: 'bg-orange-500/10 text-orange-600 border-orange-200',
    },
    {
      id: 'GARBAGE',
      title: t('catGarbage'),
      desc: language === 'ta'
        ? 'தேங்கியுள்ள குப்பைகள், துர்நாற்றம் அல்லது அள்ளப்படாத குப்பைத் தொட்டிகள்.'
        : language === 'tanglish'
          ? 'Kuppai allala, overflowing dustbins or public garbage dumping.'
          : 'Overflowing bins, uncollected household waste, public trash dumping, or foul odor.',
      icon: Trash2,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    },
    {
      id: 'DRAINAGE',
      title: t('catDrainage'),
      desc: language === 'ta'
        ? 'சாக்கடை அடைப்பு, தெருவில் வழியும் கழிவுநீர் அல்லது திறந்த மேன்ஹோல்கள்.'
        : language === 'tanglish'
          ? 'Saakkadai block aaiduchu, sewage overflow or open manholes.'
          : 'Clogged storm drains, sewage overflows on residential lanes, open manholes.',
      icon: Waves,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    {
      id: 'WATER',
      title: t('catWater'),
      desc: language === 'ta'
        ? 'குடிநீர் விநியோகத் தடை, உடைந்த குழாய்கள் அல்லது அசுத்தமான குடிநீர்.'
        : language === 'tanglish'
          ? 'Kudineer varala, pipe udanjuruchu or dirty water issue.'
          : 'Pipeline bursts, water supply cuts, low pressure, or murky water contamination.',
      icon: Droplets,
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
    },
    {
      id: 'PUBLIC_PROPERTY',
      title: t('catPublicProperty'),
      desc: language === 'ta'
        ? 'பழுதடைந்த பேருந்து நிழற்குடைகள், பூங்காக்கள் அல்லது பொதுச் சொத்துச் சேதம்.'
        : language === 'tanglish'
          ? 'Bus shelter damaged, park maintenance or public property repair.'
          : 'Broken bus shelters, damaged park benches, missing signboards, or damaged civic property.',
      icon: Building2,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
    },
  ];

  const steps = [
    {
      num: '01',
      title: language === 'ta' ? 'பேசுங்கள் அல்லது எழுதுங்கள்' : language === 'tanglish' ? 'Speak or Type sei' : 'Speak or Type',
      desc: language === 'ta'
        ? 'தமிழ், தங்கிலீஷ் அல்லது ஆங்கிலத்தில் உங்கள் உள்ளூர் பிரச்சனையை எளிதாகக் கூறுங்கள்.'
        : language === 'tanglish'
          ? 'Tamil, Tanglish or English-la voice or text moolama unga issue describe pannunga.'
          : 'Citizens describe grievances in natural Tamil, Tanglish, or English via voice or text input.'
    },
    {
      num: '02',
      title: language === 'ta' ? 'AI வகைப்படுத்துதல்' : language === 'tanglish' ? 'AI Classification' : 'AI Classification',
      desc: language === 'ta'
        ? 'AI உதவியாளர் துறை, இருப்பிடம் மற்றும் முன்னுரிமையைத் தானாகவே கண்டறியும்.'
        : language === 'tanglish'
          ? 'AI category, location and priority-a automatically detect panni classify seiyum.'
          : 'AI detects category, location, priority & duplicate reports, asking friendly follow-ups.'
    },
    {
      num: '03',
      title: language === 'ta' ? 'களப்பணி & பழுதுபார்ப்பு' : language === 'tanglish' ? 'Field Team Vela' : 'Field Team Action',
      desc: language === 'ta'
        ? 'ஒதுக்கப்பட்ட துறை ஊழியர்கள் களத்திற்குச் சென்று பிரச்சனையைச் சரிசெய்கிறார்கள்.'
        : language === 'tanglish'
          ? 'Assigned municipal department workers field-ku poi defect-a repair seivanga.'
          : 'Assigned municipal department dispatches workers and updates progress with proof notes.'
    },
    {
      num: '04',
      title: language === 'ta' ? 'குடிமக்கள் இறுதி சரிபார்ப்பு' : language === 'tanglish' ? 'Citizen Verification' : 'Citizen Verification',
      desc: language === 'ta'
        ? 'குடிமக்கள் தாங்களே சரிபார்த்த பின்னரே புகார் அதிகாரப்பூர்வமாக முடிக்கப்படும்!'
        : language === 'tanglish'
          ? 'Citizen neengale check panni verify panna piragu dhaan complaint close aagum!'
          : 'The complaint is never closed automatically—only the reporting citizen verifies work before closure.'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-civic-navy-900 via-civic-navy-800 to-civic-navy-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#1E56A0_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200 shadow-sm animate-fadeIn">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Multilingual Voice Redressal • Tamil • Tanglish • English</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
            {t('heroTitle')}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/chat"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-civic-blue-600 to-indigo-600 hover:from-civic-blue-500 hover:to-indigo-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              <Mic className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>{t('talkWithAIBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/report"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all"
            >
              <FileText className="w-4 h-4 text-slate-300" />
              <span>{t('reportGrievanceBtn')}</span>
            </Link>
          </div>

          {/* Quick Tracking Search Bar */}
          <div className="pt-6 max-w-xl mx-auto">
            <form onSubmit={handleTrackSubmit} className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-slate-400" />
              <input
                type="text"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder={t('trackPlaceholder')}
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white/95 text-slate-800 placeholder-slate-400 text-xs sm:text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-civic-blue-500 font-mono"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-civic-navy-900 hover:bg-civic-navy-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                {t('trackBtn')}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-civic-blue-600">
            {t('categoriesTitle')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-civic-navy-900 mt-1">
            {t('categoriesSubtitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/report?category=${cat.id}`)}
                className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-civic-blue-500/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${cat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-civic-navy-900 group-hover:text-civic-blue-600 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-civic-blue-600">
                  <span>{t('reportGrievanceBtn')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-civic-blue-600">
              {t('howItWorksTitle')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-civic-navy-900 mt-1">
              {t('howItWorksSubtitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {steps.map((st) => (
              <div 
                key={st.num}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-black text-civic-blue-600/20 font-mono mb-2 block">
                    {st.num}
                  </span>
                  <h3 className="font-bold text-base text-civic-navy-900 mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                {st.num === '04' && (
                  <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{t('citizenVerified')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice & Inclusivity Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-civic-navy-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-blue-200 border border-white/15">
                <Languages className="w-3.5 h-3.5" />
                <span>Multilingual & Voice-First Technology</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                {t('tagline')}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('subtagline')}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/chat"
                  className="px-6 py-3 bg-white text-civic-navy-900 hover:bg-slate-100 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2"
                >
                  <Bot className="w-4 h-4 text-civic-blue-600" />
                  <span>{t('talkWithAIBtn')}</span>
                </Link>
                <Link
                  to="/how-to-use"
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-xs transition-colors"
                >
                  {t('navHowToUse')}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
                <span className="text-2xl font-black text-amber-300 block">3</span>
                <span className="text-xs font-bold text-white block">Languages</span>
                <span className="text-[11px] text-slate-300 block">Tamil, Tanglish & English</span>
              </div>
              <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
                <span className="text-2xl font-black text-emerald-300 block">100%</span>
                <span className="text-xs font-bold text-white block">Citizen Verified</span>
                <span className="text-[11px] text-slate-300 block">No closed complaints without review</span>
              </div>
              <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
                <span className="text-2xl font-black text-sky-300 block">Real-Time</span>
                <span className="text-xs font-bold text-white block">ID Tracking</span>
                <span className="text-[11px] text-slate-300 block">Exact status & audit trail</span>
              </div>
              <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
                <span className="text-2xl font-black text-purple-300 block">OpenStreetMap</span>
                <span className="text-xs font-bold text-white block">Civic Geocoding</span>
                <span className="text-[11px] text-slate-300 block">Free & community driven</span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
