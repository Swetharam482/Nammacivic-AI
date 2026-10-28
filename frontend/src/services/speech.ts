// Speech Service for Browser Web Speech API (STT & TTS)
// Supports English, Tamil (ta-IN), and Tanglish phonetic strategies

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type SpeechErrorCode = 
  | 'NOT_SUPPORTED'
  | 'PERMISSION_DENIED'
  | 'NO_SPEECH'
  | 'NETWORK_ERROR'
  | 'START_FAILED'
  | 'UNKNOWN';

export interface SpeechErrorDetail {
  code: SpeechErrorCode;
  rawError?: string;
}

export class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }

      if ('speechSynthesis' in window) {
        this.loadVoices();
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public startListening(
    language: string,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: SpeechErrorDetail) => void,
    onEnd: () => void,
    preferredTanglishSpeech?: 'ta' | 'en'
  ) {
    if (!this.recognition) {
      onError({ code: 'NOT_SUPPORTED' });
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    // Tanglish strategy:
    // Browser speech recognition engines do not have a dedicated 'tanglish' ISO code.
    // Tanglish consists of Tamil spoken phrases transcribed or mixed Tamil/English phonetics.
    // Use 'ta-IN' or 'en-IN' based on the user's configured preferred speech recognition target.
    if (language === 'ta') {
      this.recognition.lang = 'ta-IN';
    } else if (language === 'tanglish') {
      this.recognition.lang = preferredTanglishSpeech === 'en' ? 'en-IN' : 'ta-IN';
    } else {
      this.recognition.lang = 'en-IN';
    }

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript, true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      let code: SpeechErrorCode = 'UNKNOWN';
      if (event.error === 'not-allowed') {
        code = 'PERMISSION_DENIED';
      } else if (event.error === 'no-speech') {
        code = 'NO_SPEECH';
      } else if (event.error === 'network') {
        code = 'NETWORK_ERROR';
      }
      onError({ code, rawError: event.error });
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e: any) {
      this.isListening = false;
      onError({ code: 'START_FAILED', rawError: String(e) });
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  public speak(text: string, language: string = 'en') {
    if (!this.isSpeechSynthesisSupported()) return;

    this.stopSpeaking();

    // Clean markdown bullets or symbols for speech
    const cleanText = text
      .replace(/[*#•_`]/g, ' ')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick suitable voice based on language and availability
    if (language === 'ta') {
      utterance.lang = 'ta-IN';
      const tamilVoice = this.voices.find(v => v.lang.includes('ta') || v.lang.includes('TAMIL'));
      if (tamilVoice) utterance.voice = tamilVoice;
    } else if (language === 'tanglish') {
      // Indian English voice handles Tanglish phonetics best without harsh accent distortion
      utterance.lang = 'en-IN';
      const indianVoice = this.voices.find(v => v.lang === 'en-IN') || this.voices.find(v => v.lang.includes('IN'));
      if (indianVoice) utterance.voice = indianVoice;
    } else {
      utterance.lang = 'en-IN';
      const indianEnglish = this.voices.find(v => v.lang === 'en-IN') || this.voices.find(v => v.lang.startsWith('en'));
      if (indianEnglish) utterance.voice = indianEnglish;
    }

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis playback error:', e);
    }
  }

  public stopSpeaking() {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
