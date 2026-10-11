'use client';

import { useLanguage } from './LanguageProvider';

export default function HeroSearchBar() {
  const { t } = useLanguage();
  return (
    <form action="/lawyers" className="search-bar">
      <input name="q" placeholder={t('hero_search_placeholder')} />
      <button type="submit">{t('hero_search_btn')}</button>
    </form>
  );
}
