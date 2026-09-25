import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  getStoredLanguage,
  setStoredLanguage,
  LanguageOption,
} from '../utils/i18n';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  languages: SUPPORTED_LANGUAGES,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(getStoredLanguage);

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguageState(lang);
    setStoredLanguage(lang);
  };

  useEffect(() => {
    // Sync document html lang attribute
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    if (dict && dict[key]) {
      return dict[key];
    }
    const enDict = TRANSLATIONS.en;
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
