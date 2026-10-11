'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import DISTRICTS from '@/lib/districts';

export default function DistrictFilter({ currentDistrict }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(currentDistrict || '');

  function applyDistrict(district) {
    const params = new URLSearchParams(searchParams.toString());
    if (district) params.set('district', district);
    else params.delete('district');
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleChange(e) {
    const v = e.target.value;
    setValue(v);
    // Only navigate once the typed text exactly matches a real district (or
    // is cleared) — otherwise every keystroke would trigger a navigation.
    if (v === '' || DISTRICTS.includes(v)) {
      applyDistrict(v);
    }
  }

  return (
    <div className="district-filter">
      <input
        list="district-options"
        value={value}
        onChange={handleChange}
        placeholder="🔍 Search district (e.g. Dhaka, Sylhet...)"
        className="district-filter-input"
      />
      <datalist id="district-options">
        {DISTRICTS.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
      {value && (
        <button
          type="button"
          className="district-filter-clear"
          onClick={() => {
            setValue('');
            applyDistrict('');
          }}
          aria-label="Clear district filter"
        >
          ✕
        </button>
      )}
    </div>
  );
}
