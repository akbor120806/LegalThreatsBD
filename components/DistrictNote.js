'use client';

import { useLanguage } from './LanguageProvider';

export default function DistrictNote({ matched, fallback, district, empty }) {
  const { t } = useLanguage();

  if (empty) {
    return (
      <p className="district-note district-note-fallback">
        📍 <b>{district}</b> — {t('no_lawyers_selected_district')}
      </p>
    );
  }

  if (matched) {
    return (
      <p className="district-note">
        📍 {t('showing_lawyers_in')} <b>{district}</b>
      </p>
    );
  }

  if (fallback && district) {
    return <p className="district-note district-note-fallback">{t('no_lawyers_in_district')}</p>;
  }

  return null;
}
