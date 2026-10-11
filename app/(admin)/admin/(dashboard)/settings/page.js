'use client';

import { useEffect, useState } from 'react';

const EMPTY = {
  phone: '',
  email: '',
  website: '',
  address: '',
  bkash_number: '',
  nagad_number: '',
  rocket_number: '',
  bank_name: '',
  bank_account_name: '',
  bank_account_number: '',
  bank_branch: '',
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.settings) {
          const { id, updated_at, ...rest } = d.settings;
          setForm({ ...EMPTY, ...rest });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message || 'Save failed.');
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Site Settings</h1>
        <p style={{ margin: 0 }}>
          Controls the contact details shown in the footer and the payment
          account numbers shown to clients when they book an appointment.
        </p>
      </div>

      {error && <div className="form-msg error">{error}</div>}
      {saved && <div className="form-msg" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>Saved successfully.</div>}

      <form onSubmit={handleSave}>
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>📞 Contact Info (shown in footer)</h3>
          <div className="form-row">
            <div className="form-field">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+880 1700-000000" />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="info@example.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Website</label>
              <input value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://example.com" />
            </div>
            <div className="form-field">
              <label>Office Address</label>
              <input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Street, Area, City" />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>💳 Payment Account Numbers</h3>
          <p style={{ fontSize: 13, marginTop: 0, marginBottom: 16 }}>
            Shown to clients during checkout so they know where to send the
            booking payment for each method.
          </p>
          <div className="form-row">
            <div className="form-field">
              <label>bKash Number</label>
              <input value={form.bkash_number} onChange={(e) => update('bkash_number', e.target.value)} placeholder="01700-000000" />
            </div>
            <div className="form-field">
              <label>Nagad Number</label>
              <input value={form.nagad_number} onChange={(e) => update('nagad_number', e.target.value)} placeholder="01700-000000" />
            </div>
          </div>
          <div className="form-field">
            <label>Rocket Number</label>
            <input value={form.rocket_number} onChange={(e) => update('rocket_number', e.target.value)} placeholder="01700-000000" />
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border, #263252)', margin: '16px 0' }} />
          <div className="form-row">
            <div className="form-field">
              <label>Bank Name</label>
              <input value={form.bank_name} onChange={(e) => update('bank_name', e.target.value)} placeholder="Dutch-Bangla Bank" />
            </div>
            <div className="form-field">
              <label>Account Name</label>
              <input value={form.bank_account_name} onChange={(e) => update('bank_account_name', e.target.value)} placeholder="Legal Threats BD" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Account Number</label>
              <input value={form.bank_account_number} onChange={(e) => update('bank_account_number', e.target.value)} placeholder="1234567890123" />
            </div>
            <div className="form-field">
              <label>Branch</label>
              <input value={form.bank_branch} onChange={(e) => update('bank_branch', e.target.value)} placeholder="Dhanmondi Branch" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
