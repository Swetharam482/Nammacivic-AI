import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  Lock, 
  Globe, 
  Bot, 
  MapPin, 
  Activity, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const TermsPage: React.FC = () => {
  const { language, t } = useLanguage();

  const sections = [
    {
      id: "4.1",
      title: language === 'ta' ? "4.1 துல்லியமான தகவல்கள் (Accurate Information)" : language === 'tanglish' ? "4.1 Accurate Information (Thulliyamaana Details)" : "4.1 Accurate Information",
      desc: language === 'ta'
        ? "பயனர்கள் புகாரைப் பதிவு செய்யும் போது துல்லியமான பிரச்சனை விளக்கம், இருப்பிடம் மற்றும் கோரப்பட்ட இதர விவரங்களை உண்மையாக வழங்க வேண்டும்."
        : language === 'tanglish'
        ? "Complaints register pandra bodhu accurate description, location, and requested details-a unmaiyaana muraiyil provide pannanum."
        : "Users should provide accurate complaint descriptions, locations, and other requested information to enable effective evaluation and municipal routing.",
      icon: FileText
    },
    {
      id: "4.2",
      title: language === 'ta' ? "4.2 பொறுப்பான பயன்பாடு (Responsible Usage)" : language === 'tanglish' ? "4.2 Responsible Usage (Poruppaana Payanpaadu)" : "4.2 Responsible Usage",
      desc: language === 'ta'
        ? "பயனர்கள் உள்நோக்கத்துடன் தவறான, அவதூறான, தவறாக வழிநடத்தும் அல்லது தீங்கு விளைவிக்கும் புகார்களை ஒருபோதும் சமர்ப்பிக்கக் கூடாது."
        : language === 'tanglish'
        ? "Intentionally false, abusive, misleading, or harmful complaints-a orupodhum submit panna koodadhu."
        : "Users must not intentionally submit false, abusive, misleading, or harmful complaints. Doing so undermines civic operations and community trust.",
      icon: Scale
    },
    {
      id: "4.3",
      title: language === 'ta' ? "4.3 AI உதவியாளர் பொறுப்பு (AI Assistance)" : language === 'tanglish' ? "4.3 AI Assistance (AI Udhவி)" : "4.3 AI Assistance",
      desc: language === 'ta'
        ? "செயற்கை நுண்ணறிவு (AI) உருவாக்கும் சுருக்கங்கள், துறைகள் மற்றும் பரிந்துரைகளில் பிழைகள் இருக்கலாம். தகவல்களைச் சமர்ப்பிக்கும் முன் பயனர்கள் அவற்றை முழுமையாகச் சரிபார்க்க வேண்டும்."
        : language === 'tanglish'
        ? "AI-generated summaries, categories, and suggestions la errors irukka vaaippu irukku. Submit panradhuku munnaadi information-a verify pannikonga."
        : "AI-generated summaries, categories, and suggestions may contain errors. Users should review complaint information carefully before submitting it.",
      icon: Bot
    },
    {
      id: "4.4",
      title: language === 'ta' ? "4.4 முகவரி சரிபார்ப்பு (Address Verification)" : language === 'tanglish' ? "4.4 Address Verification (Mukavari Saripaarppu)" : "4.4 Address Verification",
      desc: language === 'ta'
        ? "OpenStreetMap அல்லது பிற வரைபடச் சேவைகள் வழங்கும் இடம் சாத்தியமான பொருத்தத்தைக் குறிக்கிறது; அங்கு குறை உள்ளது என்பதையோ அல்லது பயனர் அந்த முகவரியில் வசிக்கிறார் என்பதையோ அது நிரூபிக்காது."
        : language === 'tanglish'
        ? "Map service return pandra location oru possible match mattum dhaan. Anga complaint nijamave irukka nu adhula prove aagadhu."
        : "A location returned by Google Maps, OpenStreetMap, or another map service indicates a possible location match. It does not prove that a reported issue exists there or that the user lives at that address.",
      icon: MapPin
    },
    {
      id: "4.5",
      title: language === 'ta' ? "4.5 புகாரைக் கண்காணித்தல் (Complaint Tracking)" : language === 'tanglish' ? "4.5 Complaint Tracking (Kankaanippu)" : "4.5 Complaint Tracking",
      desc: language === 'ta'
        ? "புகாரின் நிலைகள் தளத்தில் உள்ள தரவுகள் மற்றும் நடவடிக்கைகளைப் பொறுத்தது. காண்பிக்கப்படும் நிலை உண்மையான களப்பணியால் உறுதிப்படுத்தப்படும் வரை இறுதி அரசு நடவடிக்கையாகக் கருதப்படக்கூடாது."
        : language === 'tanglish'
        ? "App-la kaatura complaint status application data poruthadhu. Real field action verify aagura varaikkum idhai confirmation-a consider panna koodadhu."
        : "Complaint statuses depend on the information and actions available in the application. A displayed status must not be presented as confirmation of real government action unless that action has actually been verified.",
      icon: Activity
    },
    {
      id: "4.6",
      title: language === 'ta' ? "4.6 மாதிரி மற்றும் செயல்விளக்கத் தரவு (Demo and Simulated Data)" : language === 'tanglish' ? "4.6 Demo & Simulated Data (Maadhiri Tharavu)" : "4.6 Demo and Simulated Data",
      desc: language === 'ta'
        ? "இத்தளத்தில் உள்ள மாதிரி புகார்கள் அல்லது மாதிரி அதிகாரி நடவடிக்கைகள் அனைத்தும் சோதனை மற்றும் கல்வி செயல்விளக்கத்திற்காக மட்டுமே. அவை உண்மையான அரசுத் துறைக்கானவை அல்ல."
        : language === 'tanglish'
        ? "Indha project la irukka simulated complaints and demo authority actions purely academic testing and demonstration kaaga mattum dhaan."
        : "If the project uses simulated complaints or demonstration authority actions, these are strictly for testing and demonstration purposes only. They are not official submissions to a government department.",
      icon: AlertTriangle
    },
    {
      id: "4.7",
      title: language === 'ta' ? "4.7 தனியுரிமை மற்றும் தனிப்பட்ட தகவல்கள் (Privacy and Personal Information)" : language === 'tanglish' ? "4.7 Privacy & Personal Information (Thaniyurimai)" : "4.7 Privacy and Personal Information",
      desc: language === 'ta'
        ? "தேவையற்ற முக்கியமான தனிப்பட்ட தகவல்களைச் (கடவுச்சொற்கள், ஆதார், வங்கி விவரங்கள்) சமர்ப்பிப்பதைத் தவிர்க்கவும். தரவுகள் முற்றிலும் பாதுகாப்பானது அல்லது சேமிக்கப்படவே இல்லை என்று நாங்கள் கூறவில்லை."
        : language === 'tanglish'
        ? "Thevaiyilladha sensitive personal data-va submit panna koodadhu. Data complete secure or store aagave aagala nu unverified claims edhuvum illa."
        : "Users should avoid submitting unnecessary sensitive personal information. Information is handled as outlined in our Privacy Policy. We do not claim that data is completely secure or that it is never stored.",
      icon: Lock
    },
    {
      id: "4.8",
      title: language === 'ta' ? "4.8 வெளிப்புற சேவைகள் (External Services)" : language === 'tanglish' ? "4.8 External Services (Veliyaana Sevaihal)" : "4.8 External Services",
      desc: language === 'ta'
        ? "முகவரி சரிபார்ப்பு, பேச்சு அங்கீகாரம் போன்ற வெளிப்புற ஒருங்கிணைப்புகள் தொழில்நுட்பச் சிக்கல்கள் அல்லது நெட்வொர்க் காரணங்களால் சில நேரங்களில் கிடைக்காமல் போகலாம் அல்லது துல்லியமற்று இருக்கலாம்."
        : language === 'tanglish'
        ? "Address verification, speech recognition services technical issues or network problems naala unavailable or inaccurate aaga vaaippu irukku."
        : "Address verification, speech recognition, and other external integrations may be unavailable or inaccurate due to technical issues, service limitations, or network problems.",
      icon: Globe
    },
    {
      id: "4.9",
      title: language === 'ta' ? "4.9 சேவையின் இருப்பு (Service Availability)" : language === 'tanglish' ? "4.9 Service Availability (Sevai Iruppu)" : "4.9 Service Availability",
      desc: language === 'ta'
        ? "பராமரிப்புப் பணிகள் அல்லது தொழில்நுட்பப் பிழைகள் காரணமாக இச்செயலி எப்போதாவது தற்காலிகமாக கிடைக்காமல் போகலாம்."
        : language === 'tanglish'
        ? "Maintenance or technical errors kaaranama application occasionally unavailable aaga irukkalaam."
        : "The application may occasionally be unavailable due to maintenance, upgrades, or technical errors.",
      icon: RefreshCw
    },
    {
      id: "4.10",
      title: language === 'ta' ? "4.10 விதிமுறை மாற்றங்கள் (Updates to Terms)" : language === 'tanglish' ? "4.10 Updates to Terms (Vidhimurai Maatrangal)" : "4.10 Updates to Terms",
      desc: language === 'ta'
        ? "செயலியின் அம்சங்கள் அல்லது கொள்கைகள் மாறும் போது விதிமுறைகள் புதுப்பிக்கப்படலாம். தற்போதைய பதிப்பு: v1.0.0 (கடைசியாகப் புதுப்பிக்கப்பட்டது: அக்டோபர் 2026)."
        : language === 'tanglish'
        ? "Application features or policies change aagum bodhu indha terms update aagalaam. Current Version: v1.0.0 (Last Updated: October 2026)."
        : "Terms may be updated when application functionality or policies change. Current Version: v1.0.0 (Last updated: October 2026).",
      icon: Scale
    }
  ];

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

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Legal & Compliance
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-civic-blue-50 text-civic-blue-600 border border-civic-blue-100 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-civic-navy-900">
              {t('termsTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
              {t('termsSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100 flex-wrap">
          <span>Application: <strong>NammaCivic AI</strong></span>
          <span>Version: <strong>1.0.0</strong></span>
          <span>Last Updated: <strong>October 2026</strong></span>
        </div>
      </div>

      {/* Ten Sections */}
      <div className="space-y-4">
        {sections.map((sec) => {
          const SecIcon = sec.icon;
          return (
            <div
              key={sec.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-civic-blue-600 flex-shrink-0">
                  <SecIcon className="w-4 h-4" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-civic-navy-900">
                  {sec.title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-10 font-sans">
                {sec.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Privacy Policy Link Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-civic-navy-900">
            Privacy Policy & Data Handling
          </h3>
          <p className="text-xs text-slate-600">
            Read how personal information, location sanitization, and local storage are handled.
          </p>
        </div>

        <Link
          to="/privacy"
          className="px-4 py-2 bg-civic-blue-600 hover:bg-civic-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
        >
          <span>View Privacy Policy</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
};
