'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DownloadAppointmentPdfButton from '@/components/DownloadAppointmentPdfButton';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function loadAll() {
    const [me, appt] = await Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/appointments').then((r) => r.json()),
    ]);
    setUser(me.user);
    setAppointments(appt.appointments || []);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  async function respond(id, action) {
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    loadAll();
  }

  return (
    <div className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h1 style={{ color: 'var(--navy)', margin: '0 0 4px' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {user ? `Welcome back, ${user.name}` : 'Loading...'}
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-primary btn-sm">Logout</button>
        </div>

        <div className="stat-grid" style={{ marginTop: 30 }}>
          <div className="card stat-card">
            <div className="label">Total Appointments</div>
            <div className="value">{appointments.length}</div>
          </div>
          <div className="card stat-card">
            <div className="label">Pending</div>
            <div className="value">{appointments.filter((a) => a.status === 'pending').length}</div>
          </div>
          <div className="card stat-card">
            <div className="label">Confirmed</div>
            <div className="value">{appointments.filter((a) => a.status === 'confirmed').length}</div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 10 }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: 16 }}>My Appointments</h3>
            <Link href="/lawyers" className="btn btn-navy btn-sm">Book New</Link>
          </div>

          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : appointments.length ? (
            <div>
              {appointments.map((a) => (
                <div key={a.id} style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{a.lawyer_name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{a.expertise}</div>
                      <div style={{ fontSize: 13, marginTop: 6 }}>
                        📅 {new Date(a.appointment_date).toLocaleDateString()} at {a.appointment_time} · <span style={{ textTransform: 'capitalize' }}>{a.mode}</span>
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <span className={`payment-badge payment-badge-${a.payment_status}`}>
                          {a.payment_status === 'verified' && `✓ Payment Verified · ৳${Number(a.payment_amount).toFixed(0)} (${a.payment_method})`}
                          {a.payment_status === 'submitted' && `⏳ Payment Under Review · ৳${Number(a.payment_amount).toFixed(0)} (${a.payment_method})`}
                          {a.payment_status === 'rejected' && '✗ Payment Rejected — please contact us'}
                          {a.payment_status === 'unpaid' && 'Unpaid'}
                        </span>
                      </div>
                      {a.status === 'reschedule_requested' && (
                        <div style={{ fontSize: 13, color: 'var(--warning)', marginTop: 6 }}>
                          Your lawyer proposed a new time: {new Date(a.proposed_date).toLocaleDateString()} at {a.proposed_time}
                          {a.lawyer_note ? ` — "${a.lawyer_note}"` : ''}
                        </div>
                      )}
                      {a.status === 'cancelled' && a.cancelled_by === 'lawyer' && (
                        <div style={{ fontSize: 13, color: 'var(--danger)', marginTop: 6 }}>
                          Declined by the lawyer{a.lawyer_note ? ` — "${a.lawyer_note}"` : ''}
                        </div>
                      )}
                    </div>
                    <span className={`status-pill status-${a.status === 'reschedule_requested' ? 'pending' : a.status}`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <DownloadAppointmentPdfButton appointment={{ ...a, client_name: user?.name }} />
                  </div>

                  {a.status === 'reschedule_requested' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => respond(a.id, 'accept_reschedule')}>Accept New Time</button>
                      <button className="btn btn-danger btn-sm" onClick={() => respond(a.id, 'decline_reschedule')}>Decline</button>
                    </div>
                  )}

                  {a.status === 'pending' && (
                    <div style={{ marginTop: 10 }}>
                      <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => respond(a.id, 'cancel')}>
                        Cancel Request
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              You haven't booked any appointments yet.{' '}
              <Link href="/lawyers" style={{ color: 'var(--gold)', fontWeight: 600 }}>Find a lawyer</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
