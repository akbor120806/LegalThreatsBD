'use client';

import { useLanguage } from './LanguageProvider';

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label="Switch language"
      title={lang === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
      className="lang-toggle-btn"
    >
      {lang === 'en' ? 'বাং' : 'EN'}
    </button>
  );
}
