'use client';

import { useLanguage } from './LanguageProvider';

// Small reusable translated-text component so server components (like the
// homepage, which fetches from MySQL) can still render translated strings
// without needing to become client components themselves.
// Usage: <T k="hero_title" as="h1" />
export default function T({ k, as: As = 'span', ...props }) {
  const { t } = useLanguage();
  return <As {...props}>{t(k)}</As>;
}
