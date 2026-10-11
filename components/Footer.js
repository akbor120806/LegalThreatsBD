import Link from 'next/link';
import { db } from '@/lib/db';
import SITE_CONFIG from '@/lib/siteConfig';

async function getSettings() {
  try {
    const [[row]] = await db().query('SELECT * FROM site_settings WHERE id = 1');
    if (!row) return SITE_CONFIG;
    return {
      phone: row.phone || SITE_CONFIG.phone,
      phoneHref: (row.phone || SITE_CONFIG.phoneHref).replace(/[^0-9+]/g, ''),
      email: row.email || SITE_CONFIG.email,
      website: row.website || SITE_CONFIG.website,
      websiteLabel: (row.website || SITE_CONFIG.website).replace(/^https?:\/\//, ''),
      address: row.address || SITE_CONFIG.address,
    };
  } catch {
    // Falls back gracefully (e.g. before the site_settings migration has
    // been run) instead of crashing every page that renders the footer.
    return SITE_CONFIG;
  }
}

export default async function Footer() {
  const settings = await getSettings();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <img src="/logo.png" alt="Legal Threats BD" className="footer-logo-img" />
            <h4 style={{ margin: 0 }}>Legal Threats BD</h4>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7 }}>
            Connecting citizens of Bangladesh with verified lawyers, legal
            knowledge, and secure digital case management.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link href="/lawyers">Find a Lawyer</Link>
          <Link href="/legal-awareness">Legal Knowledge</Link>
          <Link href="/documents">Legal Documents</Link>
          <Link href="/about">About Us</Link>
        </div>
        <div>
          <h4>Practice Areas</h4>
          <Link href="/lawyers?category=criminal">Criminal</Link>
          <Link href="/lawyers?category=civil">Civil</Link>
          <Link href="/lawyers?category=corporate">Corporate</Link>
          <Link href="/lawyers?category=tax">Tax</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
          <Link href="/admin/login">Admin Panel</Link>
        </div>
        <div>
          <h4>Contact Us</h4>
          <a href={`tel:${settings.phoneHref}`}>📞 {settings.phone}</a>
          <a href={`mailto:${settings.email}`}>✉️ {settings.email}</a>
          <a href={settings.website} target="_blank" rel="noopener noreferrer">🌐 {settings.websiteLabel}</a>
          <span className="footer-address">📍 {settings.address}</span>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Legal Threats BD. All rights reserved.
      </div>
    </footer>
  );
}
