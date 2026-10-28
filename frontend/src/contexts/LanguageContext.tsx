import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations, TranslationDict } from '../locales/translations';

export interface UnsentComplaintDraft {
  category?: string;
  description?: string;
  location?: string;
  landmark?: string;
  duration?: string;
  citizenName?: string;
  citizenPhone?: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  
  // Accessibility settings
  textSize: 'normal' | 'large';
  setTextSize: (size: 'normal' | 'large') => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;

  // Voice settings
  voiceInputEnabled: boolean;
  setVoiceInputEnabled: (enabled: boolean) => void;
  voiceOutputEnabled: boolean;
  setVoiceOutputEnabled: (enabled: boolean) => void;
  preferredSpeechLang: 'ta' | 'en';
  setPreferredSpeechLang: (lang: 'ta' | 'en') => void;

  // Unsent draft preservation across language switching and page navigation
  savedDraft: UnsentComplaintDraft;
  updateDraft: (draft: Partial<UnsentComplaintDraft>) => void;
  clearDraft: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language state with localStorage persistence
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nammacivic_lang');
      if (stored === 'en' || stored === 'ta' || stored === 'tanglish') {
        return stored;
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nammacivic_lang', lang);
    }
  };

  // 2. Accessibility settings with localStorage persistence
  const [textSize, setTextSizeState] = useState<'normal' | 'large'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nammacivic_text_size');
      if (stored === 'large') return 'large';
    }
    return 'normal';
  });

  const setTextSize = (size: 'normal' | 'large') => {
    setTextSizeState(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nammacivic_text_size', size);
    }
  };

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nammacivic_high_contrast') === 'true';
    }
    return false;
  });

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nammacivic_high_contrast', String(enabled));
    }
  };

  // Sync DOM classes with accessibility preferences
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (textSize === 'large') {
        document.documentElement.classList.add('text-size-large');
      } else {
        document.documentElement.classList.remove('text-size-large');
      }

      if (highContrast) {
        document.documentElement.classList.add('high-contrast-mode');
      } else {
        document.documentElement.classList.remove('high-contrast-mode');
      }
    }
  }, [textSize, highContrast]);

  // 3. Voice settings with localStorage persistence
  const [voiceInputEnabled, setVoiceInputEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nammacivic_voice_in');
      return stored !== 'false'; // default true
    }
    return true;
  });

  const setVoiceInputEnabled = (enabled: boolean) => {
    setVoiceInputEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nammacivic_voice_in', String(enabled));
    }
  };

  const [voiceOutputEnabled, setVoiceOutputEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nammacivic_voice_out');
      return stored !== 'false'; // default true
    }
    return true;
  });

  const setVoiceOutputEnabled = (enabled: boolean) => {
    setVoiceOutputEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nammacivic_voice_out', String(enabled));
    }
  };

  const [preferredSpeechLang, setPreferredSpeechLangState] = useState<'ta' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nammacivic_speech_lang');
      if (stored === 'ta' || stored === 'en') return stored;
    }
    return 'en';
  });

  const setPreferredSpeechLang = (lang: 'ta' | 'en') => {
    setPreferredSpeechLangState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nammacivic_speech_lang', lang);
    }
  };

  // 4. Unsent Draft Persistence (never lost on language switch or settings visit)
  const [savedDraft, setSavedDraft] = useState<UnsentComplaintDraft>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('nammacivic_unsent_draft');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return {};
  });

  const updateDraft = (patch: Partial<UnsentComplaintDraft>) => {
    setSavedDraft((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('nammacivic_unsent_draft', JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const clearDraft = () => {
    setSavedDraft({});
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('nammacivic_unsent_draft');
    }
  };

  // 5. Translator function t()
  const t = (key: string): string => {
    const item = translations[key];
    if (!item) return key;
    return item[language] || item['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{
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
      setPreferredSpeechLang,
      savedDraft,
      updateDraft,
      clearDraft
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
