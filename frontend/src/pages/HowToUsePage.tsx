import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Languages, 
  Mic, 
  FileText, 
  MapPin, 
  ClipboardCheck, 
  Send, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  Bot, 
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Construction,
  Trash2,
  Droplets,
  Waves
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const HowToUsePage: React.FC = () => {
  const { language, t } = useLanguage();
  const [copiedDemoId, setCopiedDemoId] = useState(false);

  const handleCopyDemoId = () => {
    navigator.clipboard.writeText('NC-2026-10492');
    setCopiedDemoId(true);
    setTimeout(() => setCopiedDemoId(false), 2000);
  };

  const steps = [
    {
      step: 1,
      title: t('step1Title'),
      desc: t('step1Desc'),
      icon: Languages,
      badge: language === 'ta' ? 'பன்மொழி குரல் வழி' : language === 'tanglish' ? 'Voice & Language' : 'Multilingual Access',
      badgeColor: 'bg-blue-100 text-civic-blue-800',
      highlights: [
        language === 'ta' ? 'ஆங்கிலம், தமிழ் (தமிழ்) அல்லது தங்கிலீஷ் தேர்ந்தெடுக்கவும்' : language === 'tanglish' ? 'English, Tamil or Tanglish select pannalam' : 'Choose English, Tamil (தமிழ்), or Tanglish',
        language === 'ta' ? 'தட்டச்சு செய்வதற்குப் பதிலாக மைக்ரோஃபோன் மூலம் பேசலாம்' : language === 'tanglish' ? 'Typing ku badhula mic moolama pesalaam' : 'Enable voice interaction if you prefer speaking over typing',
        language === 'ta' ? 'மொழி மாற்றினாலும் உள்ளீடு விவரங்கள் அழியாது' : language === 'tanglish' ? 'Language mathinaalum unga details retain aagum' : 'Language preference persists without losing unsent drafts'
      ]
    },
    {
      step: 2,
      title: t('step2Title'),
      desc: t('step2Desc'),
      icon: FileText,
      badge: language === 'ta' ? 'குறை விளக்கம்' : language === 'tanglish' ? 'Issue Details' : 'Civic Problems',
      badgeColor: 'bg-amber-100 text-amber-800',
      categories: [
        { label: language === 'ta' ? 'சாலை & பள்ளங்கள்' : language === 'tanglish' ? 'Roads & Potholes' : 'Roads & Potholes', icon: Construction },
        { label: language === 'ta' ? 'குப்பை மேலாண்மை' : language === 'tanglish' ? 'Garbage & Waste' : 'Garbage & Waste', icon: Trash2 },
        { label: language === 'ta' ? 'தெரு விளக்குகள்' : language === 'tanglish' ? 'Streetlights' : 'Broken Streetlights', icon: Lightbulb },
        { label: language === 'ta' ? 'குடிநீர் பிரச்சனை' : language === 'tanglish' ? 'Water Supply' : 'Water Supply Issues', icon: Droplets },
        { label: language === 'ta' ? 'சாக்கடை & கழிவுநீர்' : language === 'tanglish' ? 'Drainage & Sewage' : 'Drainage & Sewage', icon: Waves },
        { label: language === 'ta' ? 'இதர உள்ளாட்சிப் பணிகள்' : language === 'tanglish' ? 'Other Civic Issues' : 'Other Local Civic Issues', icon: AlertTriangle }
      ]
    },
    {
      step: 3,
      title: t('step3Title'),
      desc: t('step3Desc'),
      icon: MapPin,
      badge: language === 'ta' ? 'இடம் & வரைபடம்' : language === 'tanglish' ? 'Location Verification' : 'OpenStreetMap Verification',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      highlights: [
        language === 'ta' ? 'தெரு, பகுதி அல்லது அருகிலுள்ள அடையாளத்தை வழங்கவும்' : language === 'tanglish' ? 'Street, area or nearby landmark mention pannunga' : 'Provide your street, area, address, or nearby landmark',
        language === 'ta' ? 'வரைபடம் அதிகபட்சம் 3 பொருத்தமான இடங்களை பரிந்துரைக்கும்' : language === 'tanglish' ? 'Map suggestions display aana udaney match-a confirm pannunga' : 'Display matching suggestions (up to 3) and confirm the correct location',
        language === 'ta' ? 'முகவரி வரைபடத்தில் இல்லாவிட்டாலும் புகார் நிராகரிக்கப்படாது' : language === 'tanglish' ? 'Location match aagalaati kooda complaint reject aagadhu' : 'If no match is found, edit or add a landmark; genuine complaints are never rejected'
      ]
    },
    {
      step: 4,
      title: t('step4Title'),
      desc: t('step4Desc'),
      icon: ClipboardCheck,
      badge: language === 'ta' ? 'சரிபார்த்தல்' : language === 'tanglish' ? 'Review Draft' : 'Pre-Submission Review',
      badgeColor: 'bg-purple-100 text-purple-800',
      highlights: [
        language === 'ta' ? 'புகாரின் விளக்கம், துறை வகை மற்றும் இருப்பிடத்தை மதிப்பாய்வு செய்யவும்' : language === 'tanglish' ? 'Description, category, and location details-a review pannunga' : 'Display complaint description, category, and location for citizen review',
        language === 'ta' ? 'தேவைப்பட்டால் சமர்ப்பிக்கும் முன் திருத்தங்களைச் செய்யலாம்' : language === 'tanglish' ? 'Submit panradhuku munnaadi edhavadhu thappu irundha fix pannikalam' : 'Allow users to correct any errors before official registration'
      ]
    },
    {
      step: 5,
      title: t('step5Title'),
      desc: t('step5Desc'),
      icon: Send,
      badge: language === 'ta' ? 'புகார் ஐடி' : language === 'tanglish' ? 'Tracking ID' : 'Submission & ID',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      highlights: [
        language === 'ta' ? 'தனித்துவமான அடையாள எண் உருவாக்கப்படும் (எ.கா: NC-2026-10492)' : language === 'tanglish' ? 'Unique tracking ID generate aagum (e.g. NC-2026-10492)' : 'Unique complaint ID is generated and displayed on submission',
        language === 'ta' ? 'எதிர்கால கண்காணிப்பிற்காக ஐடியை நகலெடுக்கும் வசதி உண்டு' : language === 'tanglish' ? 'Tracking kaaga ID-a copy panna one-click button irukku' : 'Clear confirmation with one-click copy option for tracking'
      ]
    },
    {
      step: 6,
      title: t('step6Title'),
      desc: t('step6Desc'),
      icon: Clock,
      badge: language === 'ta' ? '6 நிலைகள்' : language === 'tanglish' ? '6 Backend Statuses' : 'Supported Lifecycle',
      badgeColor: 'bg-slate-200 text-slate-800',
      statuses: [
        {
          code: 'SUBMITTED',
          name: language === 'ta' ? 'சமர்ப்பிக்கப்பட்டது' : language === 'tanglish' ? 'Submitted' : 'Submitted',
          desc: language === 'ta' ? 'புகார் அதிகாரப்பூர்வமாகப் பதிவு செய்யப்பட்டு காத்திருப்பில் உள்ளது.' : language === 'tanglish' ? 'Complaint registry-la log aagi queue aairukku.' : 'Officially logged in civic registry and queued for triage.',
          color: 'bg-blue-50 text-blue-800 border-blue-200'
        },
        {
          code: 'ASSIGNED',
          name: language === 'ta' ? 'ஒதுக்கப்பட்டது' : language === 'tanglish' ? 'Assigned' : 'Assigned',
          desc: language === 'ta' ? 'சம்பந்தப்பட்ட மண்டலத் துறை அல்லது அதிகாரிக்கு ஒதுக்கப்பட்டுள்ளது.' : language === 'tanglish' ? 'Concerned municipal dept team ku assign panniyachu.' : 'Assigned to the relevant zonal municipal department.',
          color: 'bg-purple-50 text-purple-800 border-purple-200'
        },
        {
          code: 'IN_PROGRESS',
          name: language === 'ta' ? 'செயல்பாட்டில் உள்ளது' : language === 'tanglish' ? 'In Progress' : 'In Progress',
          desc: language === 'ta' ? 'களப்பணியாளர் அல்லது பழுதுநீக்கும் வாகனம் தளத்திற்கு அனுப்பப்பட்டுள்ளது.' : language === 'tanglish' ? 'Field engineer spot-la work start pannitaanga.' : 'Field crew deployed on-site to inspect and repair defect.',
          color: 'bg-amber-50 text-amber-800 border-amber-200'
        },
        {
          code: 'RESOLUTION_PENDING_VERIFICATION',
          name: language === 'ta' ? 'சரிபார்ப்புக்குக் காத்திருக்கிறது' : language === 'tanglish' ? 'Awaiting Verification' : 'Awaiting Resolution Verification',
          desc: language === 'ta' ? 'அதிகாரிகள் பணியை முடித்து, குடிமகன் உறுதிப்படுத்தலுக்காகக் காத்திருக்கிறது.' : language === 'tanglish' ? 'Work completed nu officer sollitanga, citizen confirmation thevai.' : 'Field work reported complete by officers, awaiting citizen sign-off.',
          color: 'bg-orange-50 text-orange-800 border-orange-200'
        },
        {
          code: 'CLOSED',
          name: language === 'ta' ? 'மூடப்பட்டது' : language === 'tanglish' ? 'Closed' : 'Closed',
          desc: language === 'ta' ? 'குடிமகன் பிரச்சனை தீர்க்கப்பட்டதை உறுதிசெய்த பிறகு மட்டுமே மூடப்படும்.' : language === 'tanglish' ? 'Citizen verify panni confirm panna apparam issue closed.' : 'Citizen inspected and confirmed the issue is fixed satisfactorily.',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        },
        {
          code: 'REOPENED',
          name: language === 'ta' ? 'மீண்டும் திறக்கப்பட்டது' : language === 'tanglish' ? 'Reopened' : 'Reopened',
          desc: language === 'ta' ? 'பிரச்சனை தீரவில்லை என குடிமகன் குறிப்பிட்டால் முன்னுரிமையுடன் மீண்டும் திறக்கப்படும்.' : language === 'tanglish' ? 'Issue solve aagalaati citizen reopen panna mudiyum.' : 'Citizen reported defect still persists; reopened for priority redeployment.',
          color: 'bg-rose-50 text-rose-800 border-rose-200'
        }
      ]
    },
    {
      step: 7,
      title: t('step7Title'),
      desc: t('step7Desc'),
      icon: ShieldCheck,
      badge: language === 'ta' ? 'குடிமக்கள் சரிபார்ப்பு' : language === 'tanglish' ? 'Citizen Verified' : 'Closed-Loop Governance',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      highlights: [
        language === 'ta' ? 'அதிகாரிகள் ஒருதலைப்பட்சமாகப் புகாரை மூட முடியாது' : language === 'tanglish' ? 'Authorities ungalukku theriyama complaint-a close panna mudiyadhu' : 'Authorities cannot unilaterally close a grievance without your consent',
        language === 'ta' ? 'வேலை சரியாக முடிந்திருந்தால் "ஆம்" எனக் கூறி மூடலாம்' : language === 'tanglish' ? 'Work mudinjirundha "Yes, Resolved" nu close pannalam' : 'Confirm "Yes, problem is fixed" to award the Citizen-Verified badge',
        language === 'ta' ? 'வேலை முடியவில்லை என்றால் காரணம் கூறி உடனடியாக மீண்டும் திறக்கலாம்' : language === 'tanglish' ? 'Problem solve aagalaati reason solli reopen pannalam' : 'If defect remains, specify why and one-click reopen for immediate redeployment'
      ]
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

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-civic-blue-700 border border-blue-200">
          7-Step User Guide
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-civic-navy-950 via-civic-navy-900 to-civic-blue-700 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Redressal Workflow</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {t('howToUseTitle')}
          </h1>
          <p className="text-xs sm:text-base text-slate-200 leading-relaxed font-sans">
            {t('howToUseSubtitle')}
          </p>
        </div>
      </div>

      {/* Seven Steps Vertical Stepper Timeline */}
      <div className="space-y-6">
        {steps.map((st) => {
          const IconComp = st.icon;
          return (
            <div
              key={st.step}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-civic-blue-50 text-civic-blue-600 border border-civic-blue-100 flex items-center justify-center font-black text-lg flex-shrink-0 shadow-sm">
                    {st.step}
                  </div>
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${st.badgeColor}`}>
                      {st.badge}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-civic-navy-900">
                      {st.title}
                    </h2>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hidden sm:flex">
                  <IconComp className="w-5 h-5 text-civic-blue-600" />
                </div>
              </div>

              {/* Step Description */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-4 font-sans">
                {st.desc}
              </p>

              {/* Category Badges for Step 2 */}
              {st.categories && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {st.categories.map((cat, idx) => {
                    const CatIcon = cat.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                      >
                        <CatIcon className="w-4 h-4 text-civic-blue-600 flex-shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Specific highlights */}
              {st.highlights && (
                <ul className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {st.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-civic-blue-600 font-bold mt-0.5">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Status explanation cards for Step 6 */}
              {st.statuses && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {st.statuses.map((stat) => (
                    <div
                      key={stat.code}
                      className={`p-3.5 rounded-2xl border ${stat.color} space-y-1 text-xs`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{stat.name}</span>
                        <span className="text-[10px] font-mono font-normal opacity-75">{stat.code}</span>
                      </div>
                      <p className="text-[11px] leading-snug opacity-90">{stat.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Demo Interactive Card & Action Links */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold text-civic-navy-900">
            {t('readyToExperience')}
          </h3>
          <p className="text-xs text-slate-500">
            {t('readyToExperienceSub')}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-civic-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>{t('launchVoiceChatbot')}</span>
          </Link>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200"
          >
            <span>{t('manualForm')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
};
