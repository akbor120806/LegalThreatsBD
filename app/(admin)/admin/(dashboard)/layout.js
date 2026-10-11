import { getAdminSession } from '@/lib/session';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminDashboardLayout({ children }) {
  const admin = await getAdminSession();

  return (
    <div className="admin-shell">
      <AdminSidebar adminUsername={admin?.username} />
      <div className="admin-main">
        <div className="admin-topbar">
          <b>Legal Threats BD — Admin</b>
          <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
