'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from './LanguageProvider';

export default function Nav() {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .finally(() => setLoaded(true));
    // Re-check the session every time the route changes. Login/Register use
    // client-side navigation (router.push) after setting the auth cookie,
    // which does NOT remount this Nav component (it lives in the shared
    // (site) layout) — so without this dependency the effect only ran once
    // on the very first page load and the navbar kept showing stale
    // Login/Register buttons even after a successful login.
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <img src="/logo.png" alt="Legal Threats BD" className="nav-logo-img" />
          <span>Legal Threats<b> BD</b></span>
        </Link>

        <nav className="nav-links">
          <Link href="/">{t('nav_home')}</Link>
          <Link href="/lawyers">{t('nav_find_lawyer')}</Link>
          <Link href="/legal-awareness">{t('nav_legal_knowledge')}</Link>
          <Link href="/documents">{t('nav_documents')}</Link>
          <Link href="/about">{t('nav_about')}</Link>
        </nav>

        <div className="nav-actions">
          <LanguageToggle />
          <ThemeToggle />

          {!loaded ? null : user ? (
            <>
              <Link href={user.role === 'lawyer' ? '/lawyer-dashboard' : '/dashboard'} className="btn btn-outline btn-sm">
                {t('nav_dashboard')}
              </Link>
              <button onClick={handleLogout} className="btn btn-primary btn-sm">{t('nav_logout')}</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline btn-sm">{t('nav_login')}</Link>
              <Link href="/register" className="btn btn-primary btn-sm">{t('nav_register')}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
