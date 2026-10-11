'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { translate } from '@/lib/translations';

const LanguageContext = createContext({ lang: 'en', toggleLang: () => {}, t: (key) => key });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('lt_lang');
    if (saved === 'en' || saved === 'bn') setLang(saved);
  }, []);

  function toggleLang() {
    setLang((prev) => {
      const next = prev === 'en' ? 'bn' : 'en';
      localStorage.setItem('lt_lang', next);
      return next;
    });
  }

  function t(key) {
    return translate(key, lang);
  }

  return <LanguageContext.Provider value={{ lang, toggleLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
