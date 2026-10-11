'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DISTRICTS from '@/lib/districts';
import { useLanguage } from './LanguageProvider';

// Searchable district box shown in the homepage hero. Picking a district
// reloads the homepage with ?district=... so the "Find a Lawyer" section
// below shows every verified lawyer in that district.
export default function HeroDistrictSelect({ currentDistrict }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [value, setValue] = useState(currentDistrict || '');

  function go(district) {
    const url = district ? `/?district=${encodeURIComponent(district)}#find-lawyer` : '/#find-lawyer';
    router.push(url);
  }

  function handleChange(e) {
    const v = e.target.value;
    setValue(v);
    if (v === '' || DISTRICTS.includes(v)) go(v);
  }

  return (
    <div className="hero-district-box">
      <input
        list="hero-district-options"
        value={value}
        onChange={handleChange}
        placeholder={t('hero_district_placeholder')}
        aria-label="District"
      />
      <datalist id="hero-district-options">
        {DISTRICTS.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
      {value && (
        <button
          type="button"
          className="hero-district-clear"
          aria-label="Clear district"
          onClick={() => {
            setValue('');
            go('');
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
