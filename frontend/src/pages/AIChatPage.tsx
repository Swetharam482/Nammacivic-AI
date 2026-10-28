import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Languages, 
  FileCheck, 
  Clock, 
  MapPin, 
  Tag, 
  AlertTriangle,
  Compass,
  ExternalLink,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { speechService, SpeechErrorDetail } from '../services/speech';
import { useLanguage } from '../contexts/LanguageContext';
import { ChatMessage, ComplaintDraftState, GeocodeMatch } from '../types';

export const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<'auto' | 'ta' | 'tanglish' | 'en'>('auto');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isTTSActive, setIsTTSActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [draft, setDraft] = useState<ComplaintDraftState>({
    missing_information: [],
    needs_confirmation: false,
    is_ready_to_submit: false
  });
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  // OpenStreetMap Nominatim Geocoding State (Free, No Google Maps API key required)
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeMatches, setGeocodeMatches] = useState<GeocodeMatch[]>([]);
  const [confirmedLocationMatch, setConfirmedLocationMatch] = useState<GeocodeMatch | null>(null);
  const [geocodeStatus, setGeocodeStatus] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcoming message localized
    const welcomeText = language === 'ta'
      ? "வணக்கம்! நம்ம சிவிக் AI-க்கு நல்வரவு. நான் உங்கள் உள்ளாட்சி AI உதவியாளர். மைக்ரோஃபோன் மூலம் பேசலாம் அல்லது தமிழ், தங்கிலீஷ், ஆங்கிலத்தில் உங்கள் குறையை எழுதலாம். எ.கா: 'எங்க தெருவுல தெருவிளக்கு எரியல' அல்லது 'சாலையில் பள்ளம் உள்ளது'."
      : language === 'tanglish'
      ? "Vanakkam! NammaCivic AI-ku welcome. Naan unga civic assistant. Mic moolama pesalaam or Tamil, Tanglish, English-la type pannalam. E.g.: 'Street light eriyala' or 'Road-la periya kuzhi irukku'."
      : (
        "வணக்கம்! Welcome to NammaCivic AI. " +
        "I am your local body civic assistant. You can speak into your microphone or type your complaint in Tamil, Tanglish, or English. " +
        "For example: 'எங்க தெருவுல street light வேலை செய்யல' or 'Deep pothole on main road'."
      );
    setMessages([
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, interimText]);

  // Handle sending a message
  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    setInputText('');
    setInterimText('');
    setSpeechError('');

    // Add user message to UI immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(text, sessionId || undefined, selectedLang);
      setSessionId(res.session_id);
      setDraft(res.draft);

      const botMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);

      // Speak aloud if TTS enabled
      if (isTTSActive && res.should_read_aloud) {
        speechService.speak(res.reply, res.detected_language === 'Tamil' ? 'ta' : 'en');
      }

      // If user said "yes" to confirm and backend marked ready:
      if (res.draft.is_ready_to_submit) {
        handleFinalSubmit(res.draft);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Sorry, an error occurred: ${err.message || 'Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle voice recording
  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setInterimText('');
    } else {
      setSpeechError('');
      speechService.stopSpeaking(); // stop any current bot speech

      const langCode = selectedLang === 'ta' ? 'ta' : 'en';

      speechService.startListening(
        langCode,
        (transcript: string, isFinal: boolean) => {
          if (isFinal) {
            setIsListening(false);
            setInterimText('');
            handleSendMessage(transcript);
          } else {
            setInterimText(transcript);
          }
        },
        (err: SpeechErrorDetail) => {
          setIsListening(false);
          if (err.code === 'PERMISSION_DENIED') {
            setSpeechError(t('voiceMicDenied'));
          } else if (err.code === 'NOT_SUPPORTED') {
            setSpeechError(t('voiceNotSupported'));
          } else {
            setSpeechError(err.rawError || t('voiceNotSupported'));
          }
          setInterimText('');
        },
        () => {
          setIsListening(false);
          setInterimText('');
        }
      );
      setIsListening(true);
    }
  };

  // Reset conversation
  const handleReset = async () => {
    speechService.stopSpeaking();
    speechService.stopListening();
    setIsListening(false);
    if (sessionId) {
      try {
        await api.resetChatSession(sessionId);
      } catch {}
    }
    setSessionId('');
    setConfirmedLocationMatch(null);
    setGeocodeMatches([]);
    setGeocodeStatus('');
    setDraft({
      missing_information: [],
      needs_confirmation: false,
      is_ready_to_submit: false
    });
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: "Conversation reset. You can describe your new grievance by voice or typing.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // OpenStreetMap Nominatim Location Lookup for Chat Draft
  const handleVerifyLocation = async () => {
    const target = draft.location || draft.landmark;
    if (!target || target.trim().length < 2) return;
    setIsGeocoding(true);
    setGeocodeStatus('');
    setConfirmedLocationMatch(null);
    setGeocodeMatches([]);

    try {
      const res = await api.searchAddress(target.trim());
      setGeocodeMatches(res.matches || []);
      setGeocodeStatus(res.status);
    } catch {
      setGeocodeStatus('service_unavailable');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleConfirmLocationMatch = (match: GeocodeMatch) => {
    setConfirmedLocationMatch(match);
    setGeocodeMatches([]);
    setDraft((prev) => ({
      ...prev,
      latitude: match.latitude,
      longitude: match.longitude,
      geocoded_address: match.display_address
    }));
  };

  // Submit finalized complaint to backend
  const handleFinalSubmit = async (finalDraft: ComplaintDraftState) => {
    setIsSubmittingFinal(true);
    try {
      const lat = confirmedLocationMatch?.latitude || finalDraft.latitude;
      const lon = confirmedLocationMatch?.longitude || finalDraft.longitude;
      const geoAddr = confirmedLocationMatch?.display_address || finalDraft.geocoded_address;

      const created = await api.submitComplaint({
        title: `${finalDraft.category || 'Civic'} Issue at ${finalDraft.location || 'Reported Location'}`,
        description: finalDraft.description || 'Voice/Chat reported grievance',
        category: finalDraft.category || 'OTHER',
        subcategory: finalDraft.subcategory,
        priority: finalDraft.priority || 'MEDIUM',
        priority_reason: finalDraft.priority_reason,
        location: finalDraft.location || finalDraft.landmark || 'Locality unassigned',
        landmark: finalDraft.landmark,
        duration: finalDraft.duration,
        language: finalDraft.language || 'English',
        latitude: lat,
        longitude: lon,
        geocoded_address: geoAddr
      });

      speechService.stopSpeaking();
      navigate(`/complaint-success?id=${encodeURIComponent(created.complaint_id)}`);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const isMicSupported = speechService.isSpeechRecognitionSupported();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Top Banner & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-civic-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-civic-navy-900 flex items-center gap-2">
              {t('chatTitle')}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {t('aiReady')}
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-sans">
              {t('speakOrTypeHint')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Language selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Languages className="w-4 h-4 text-slate-500" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="auto">{t('autoDetect')}</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="tanglish">Tanglish</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Voice Read Aloud Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isTTSActive) speechService.stopSpeaking();
              setIsTTSActive(!isTTSActive);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
              isTTSActive 
                ? 'bg-blue-50 text-civic-blue-600 border-blue-200 font-semibold' 
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title={isTTSActive ? 'Voice playback is ON' : 'Voice playback is MUTED'}
          >
            {isTTSActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{isTTSActive ? t('voiceAudioOn') : t('voiceAudioMuted')}</span>
          </button>

          {/* Reset Conversation */}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
            title="Start new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('reset')}</span>
          </button>
        </div>
      </div>

      {/* Main Container: Chat on Left, Real-time Extraction Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Messages Container */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          
          {/* Scrollable Message List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-civic-navy-900 to-civic-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-civic-blue-600 text-white rounded-tr-none font-medium'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200 font-normal font-sans'
                  }`}
                >
                  {m.text}
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Interim live speech recognition bubble */}
            {isListening && interimText && (
              <div className="flex items-start gap-3 justify-end animate-pulse">
                <div className="bg-blue-100 text-blue-900 border border-blue-300 rounded-2xl rounded-tr-none px-4 py-3 text-xs sm:text-sm max-w-[80%] italic">
                  🎙️ {interimText}...
                </div>
              </div>
            )}

            {/* Bot Typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-11">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-civic-blue-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-civic-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-civic-blue-600 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>{t('nammaCivicIsThinking')}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Speech error notice */}
          {speechError && (
            <div className="mx-4 mb-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{speechError}</span>
            </div>
          )}

          {/* Input & Microphone Action Bar */}
          <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex items-center gap-2"
            >
              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-all shadow-md flex items-center justify-center flex-shrink-0 ${
                  isListening
                    ? 'bg-rose-600 text-white mic-recording scale-105'
                    : 'bg-white hover:bg-slate-100 text-civic-blue-600 border border-slate-200'
                }`}
                title={isListening ? 'Stop listening' : 'Start microphone speech input'}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 animate-pulse" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isListening
                    ? t('listeningToYourVoice')
                    : t('typeOrSpeakPlaceholder')
                }
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-white text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-civic-blue-500 shadow-inner"
              />

              {/* Submit button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-3 bg-civic-blue-600 hover:bg-civic-blue-700 disabled:opacity-40 text-white rounded-xl shadow-md transition-colors flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Microphone Helper text */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
              <span>
                {isListening 
                  ? t('voiceListening') 
                  : `💡 ${t('chatSubtitle')}`
                }
              </span>
              <span className="text-[10px] text-slate-400">
                Web Speech API • Chrome / Edge
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Complaint Extraction State Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-civic-blue-600" />
                <h3 className="font-bold text-sm text-civic-navy-900">
                  {t('draftCardTitle')}
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {t('liveDraft')}
              </span>
            </div>

            {/* Extracted Category */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> {t('categoryLabel')}:
              </span>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-civic-navy-900">
                {draft.category || <span className="text-slate-400 font-normal italic">{t('waitingForCategory')}</span>}
              </div>
            </div>

            {/* Extracted Location & Landmark */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {t('locationLandmark')}:
                </span>
                {(draft.location || draft.landmark) && !confirmedLocationMatch && (
                  <button
                    type="button"
                    onClick={handleVerifyLocation}
                    disabled={isGeocoding}
                    className="text-[10px] text-civic-blue-600 hover:text-civic-blue-800 font-bold flex items-center gap-1"
                  >
                    <Compass className={`w-3 h-3 ${isGeocoding ? 'animate-spin' : ''}`} />
                    <span>{isGeocoding ? t('lookingUp') : t('verifyOnMap')}</span>
                  </button>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                {draft.location || draft.landmark ? (
                  <div>
                    <span className="font-semibold text-civic-navy-900 block">{draft.location || 'Location specified'}</span>
                    {draft.landmark && <span className="text-slate-500 block text-[11px]">Landmark: {draft.landmark}</span>}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">{t('notYetProvided')}</span>
                )}

                {/* Confirmed Location Badge */}
                {confirmedLocationMatch && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {t('osmConfirmed')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmedLocationMatch(null)}
                        className="text-[10px] text-emerald-700 underline"
                      >
                        {t('changeBtn')}
                      </button>
                    </div>
                    <p className="text-slate-700 text-[10px] leading-tight truncate" title={confirmedLocationMatch.display_address}>
                      {confirmedLocationMatch.display_address}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{confirmedLocationMatch.latitude.toFixed(4)}, {confirmedLocationMatch.longitude.toFixed(4)}</span>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${confirmedLocationMatch.latitude}&mlon=${confirmedLocationMatch.longitude}#map=16/${confirmedLocationMatch.latitude}/${confirmedLocationMatch.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-civic-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <span>Map</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Candidate Matches Selection (Max 3) */}
                {!confirmedLocationMatch && geocodeMatches.length > 0 && (
                  <div className="p-2 bg-blue-50/80 border border-blue-200 rounded-lg space-y-1.5 text-[11px]">
                    <span className="font-bold text-civic-navy-900 block text-[10px]">
                      {t('confirmLocationAction')} ({geocodeMatches.length} matches):
                    </span>
                    {geocodeMatches.map((m, idx) => (
                      <div key={m.place_id || idx} className="p-1.5 bg-white rounded border border-slate-200 flex items-center justify-between gap-1 text-[10px]">
                        <span className="truncate max-w-[140px] text-slate-700" title={m.display_address}>
                          {m.display_address}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleConfirmLocationMatch(m)}
                          className="px-2 py-0.5 bg-civic-blue-600 hover:bg-civic-blue-700 text-white rounded font-bold text-[9px] flex items-center gap-0.5 flex-shrink-0"
                        >
                          <Check className="w-2.5 h-2.5" />
                          <span>Confirm</span>
                        </button>
                      </div>
                    ))}
                    <div className="text-[9px] text-slate-400 pt-0.5">
                      © OpenStreetMap contributors
                    </div>
                  </div>
                )}

                {/* No Results Friendly Notice */}
                {!confirmedLocationMatch && geocodeStatus === 'no_results' && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 space-y-1">
                    <strong>{t('noExactMapMatch')}</strong>
                    <p>{t('noExactMapMatchHelp')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {t('persistenceDuration')}
              </span>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
                {draft.duration || <span className="text-slate-400 font-normal italic">e.g. 3 days, 1 week</span>}
              </div>
            </div>

            {/* Urgency / Priority */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {t('priorityRating')}
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  draft.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  draft.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {draft.priority || 'MEDIUM'}
                </span>
                {draft.priority_reason && (
                  <span className="text-[10px] text-slate-500 truncate" title={draft.priority_reason}>
                    {draft.priority_reason}
                  </span>
                )}
              </div>
            </div>

            {/* Missing information badges */}
            {draft.missing_information && draft.missing_information.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-amber-800 block text-[11px]">
                  {t('pendingDetailsNeeded')}
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {draft.missing_information.map((f) => (
                    <span key={f} className="px-2 py-0.5 bg-amber-200 text-amber-900 font-semibold rounded text-[10px] uppercase">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submission confirmation CTA */}
          <div className="pt-4 border-t border-slate-100">
            {draft.needs_confirmation || draft.is_ready_to_submit || (draft.category && draft.location) ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleFinalSubmit(draft)}
                  disabled={isSubmittingFinal}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingFinal ? t('registeringGrievance') : t('confirmAndSubmitComplaint')}</span>
                </button>
                <p className="text-[10px] text-center text-slate-400">
                  {t('generatesOfficialIdHint')}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                <span>{t('continueConversationHint')}</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
