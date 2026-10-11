'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/admin', label: '📊 Dashboard', exact: true },
  { href: '/admin/lawyers', label: '⚖ Lawyers', badgeKey: 'pendingLawyers' },
  { href: '/admin/appointments', label: '📅 Appointments' },
  { href: '/admin/documents', label: '📄 Documents' },
  { href: '/admin/users', label: '👥 Users' },
  { href: '/admin/messages', label: '✉ Messages' },
  { href: '/admin/settings', label: '⚙ Settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [notifications, setNotifications] = useState({ pendingLawyers: 0 });

  useEffect(() => {
    let cancelled = false;

    function load() {
      fetch('/api/admin/notifications')
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled && d.ok) setNotifications({ pendingLawyers: d.pendingLawyers });
        })
        .catch(() => {});
    }

    load();
    // Poll every 30s so a new lawyer registration shows up as a
    // notification without needing a full page reload.
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/logo.png" alt="Legal Threats BD" className="sidebar-logo-img" />
        <span>Legal Threats<b> BD</b></span>
      </div>
      <nav>
        {links.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          const badge = l.badgeKey ? notifications[l.badgeKey] : 0;
          return (
            <Link key={l.href} href={l.href} className={active ? 'active' : ''} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{l.label}</span>
              {badge > 0 && <span className="sidebar-badge">{badge}</span>}
            </Link>
          );
        })}
        <a onClick={handleLogout} style={{ cursor: 'pointer' }}>🚪 Logout</a>
      </nav>
    </aside>
  );
}
