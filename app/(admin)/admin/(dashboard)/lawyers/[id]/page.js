'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminLawyerDetailPage() {
  const { id } = useParams();
  const [lawyer, setLawyer] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [payouts, setPayouts] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(true);
  const [payoutForm, setPayoutForm] = useState({ amount: '', paid_on: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    const [detail, payoutData] = await Promise.all([
      fetch(`/api/admin/lawyers/${id}/appointments`).then((r) => r.json()),
      fetch(`/api/admin/lawyers/${id}/payouts`).then((r) => r.json()),
    ]);
    if (detail.ok) {
      setLawyer(detail.lawyer);
      setAppointments(detail.appointments);
      setStats(detail.stats);
    }
    if (payoutData.ok) {
      setPayouts(payoutData.payouts);
      setTotalPaid(payoutData.totalPaid);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function addPayout(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/lawyers/${id}/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payoutForm),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message || 'Could not record payout.');
      setPayoutForm({ amount: '', paid_on: '', note: '' });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!lawyer) return <div className="empty-state">Lawyer not found.</div>;

  return (
    <div>
      <Link href="/admin/lawyers" style={{ fontSize: 13 }}>← Back to Lawyers</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 20px' }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>{lawyer.name}</h1>
          <p style={{ margin: 0 }}>{lawyer.expertise} · {lawyer.category_name} · {lawyer.district || 'No district'}</p>
        </div>
        <span className={`tag ${lawyer.is_verified ? 'tag-green' : 'tag-amber'}`}>
          {lawyer.is_verified ? 'Verified' : 'Pending'}
        </span>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card"><b>{stats.total}</b><span>Total Requests</span></div>
        <div className="stat-card"><b>{stats.accepted}</b><span>Cases Accepted</span></div>
        <div className="stat-card"><b>{stats.rejected}</b><span>Cases Rejected</span></div>
        <div className="stat-card"><b>{stats.pending}</b><span>Pending</span></div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Appointment History</h3>
        {appointments.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Mode</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.client_name}{a.is_guest ? ' (guest)' : ''}</td>
                    <td>{new Date(a.appointment_date).toLocaleDateString()}</td>
                    <td style={{ textTransform: 'capitalize' }}>{a.mode}</td>
                    <td>
                      <span className={`payment-badge payment-badge-${a.payment_status}`}>{a.payment_status}</span>
                    </td>
                    <td><span className="tag">{a.status.replace('_', ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No appointments yet.</p>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, margin: 0 }}>💰 Payouts to This Lawyer</h3>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12 }}>Total paid so far</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#4ade80' }}>৳{Number(totalPaid).toFixed(0)}</div>
          </div>
        </div>

        {error && <div className="form-msg error">{error}</div>}

        <form onSubmit={addPayout} style={{ marginBottom: 20 }}>
          <div className="form-row">
            <div className="form-field">
              <label>Amount (৳)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={payoutForm.amount}
                onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Date Paid</label>
              <input
                type="date"
                required
                value={payoutForm.paid_on}
                onChange={(e) => setPayoutForm({ ...payoutForm, paid_on: e.target.value })}
              />
            </div>
          </div>
          <div className="form-field">
            <label>Note (optional)</label>
            <input
              value={payoutForm.note}
              onChange={(e) => setPayoutForm({ ...payoutForm, note: e.target.value })}
              placeholder="e.g. Payout for 5 cases in June"
            />
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
            {saving ? 'Saving...' : '+ Record Payout'}
          </button>
        </form>

        {payouts.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.paid_on).toLocaleDateString()}</td>
                    <td>৳{Number(p.amount).toFixed(0)}</td>
                    <td>{p.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No payouts recorded yet.</p>
        )}
      </div>
    </div>
  );
}
