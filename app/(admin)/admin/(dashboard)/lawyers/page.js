'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const EMPTY_FORM = {
  id: null,
  name: '',
  expertise: '',
  category_id: '',
  experience_years: '',
  bar_council_id: '',
  district: '',
  address: '',
  consultation_fee: '',
  bio: '',
  is_verified: true,
};

export default function AdminLawyersPage() {
  const [lawyers, setLawyers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [lRes, cRes] = await Promise.all([
        fetch('/api/admin/lawyers'),
        fetch('/api/categories'),
      ]);
      const lData = await lRes.json();
      const cData = await cRes.json();
      setLawyers(Array.isArray(lData.lawyers) ? lData.lawyers : []);
      setCategories(Array.isArray(cData.categories) ? cData.categories : []);
    } catch (err) {
      console.error('Failed to load lawyers:', err);
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function startAdd() {
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError(null);
  }

  function startEdit(lawyer) {
    setForm({ ...lawyer, is_verified: !!lawyer.is_verified });
    setShowForm(true);
    setError(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `/api/admin/lawyers/${form.id}` : '/api/admin/lawyers';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok || data.ok === false) throw new Error(data.message || data.error || 'Save failed.');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this lawyer profile? This also removes their appointments.')) return;
    try {
      await fetch(`/api/admin/lawyers/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  async function handleApprove(id) {
    await fetch(`/api/admin/lawyers/${id}/approve`, { method: 'POST' });
    load();
  }

  async function handleReject(id) {
    if (!confirm('Reject this lawyer application? Their profile will be removed and the account reverted to a client account.')) return;
    await fetch(`/api/admin/lawyers/${id}/reject`, { method: 'POST' });
    load();
  }

  const pendingLawyers = lawyers.filter((l) => !l.is_verified);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Lawyers</h1>
          <p style={{ margin: 0 }}>Manage verified lawyer profiles.</p>
        </div>
        <button onClick={startAdd} className="btn btn-primary btn-sm">
          + Add Lawyer
        </button>
      </div>

      {pendingLawyers.length > 0 && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--warning)' }}>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>🔔 Pending Lawyer Applications ({pendingLawyers.length})</h3>
          <p style={{ marginTop: 0, marginBottom: 16 }}>
            These lawyers self-registered and are hidden from the public site until you approve them.
          </p>
          {pendingLawyers.map((l) => (
            <div
              key={l.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderTop: '1px solid var(--border)',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <b>{l.name}</b> — {l.expertise}
                <div style={{ fontSize: 13, marginTop: 2 }}>
                  {l.district || 'No district set'} · {l.experience_years || 0} yrs experience · Bar ID: {l.bar_council_id || '—'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleApprove(l.id)} className="btn btn-primary btn-sm">Accept</button>
                <button onClick={() => handleReject(l.id)} className="btn btn-danger btn-sm">Reject</button>
                <button onClick={() => startEdit(l)} className="btn btn-outline btn-sm">Review Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>{form.id ? 'Edit Lawyer' : 'Add Lawyer'}</h3>
          {error && <div className="form-msg error">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-field">
                <label>Name</label>
                <input required value={form.name} onChange={(e) => update('name', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Expertise</label>
                <input required value={form.expertise} onChange={(e) => update('expertise', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Practice Area</label>
                <select value={form.category_id || ''} onChange={(e) => update('category_id', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Experience (years)</label>
                <input
                  type="number"
                  min="0"
                  value={form.experience_years}
                  onChange={(e) => update('experience_years', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Consultation Fee (৳)</label>
                <input type="number" min="0" value={form.consultation_fee} onChange={(e) => update('consultation_fee', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Bar Council ID</label>
                <input value={form.bar_council_id} onChange={(e) => update('bar_council_id', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>District</label>
                <input value={form.district} onChange={(e) => update('district', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Address</label>
                <input value={form.address} onChange={(e) => update('address', e.target.value)} />
              </div>
            </div>
            <div className="form-field">
              <label>Bio</label>
              <textarea rows={3} value={form.bio} onChange={(e) => update('bio', e.target.value)} />
            </div>
            <div className="form-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input
                id="is_verified"
                type="checkbox"
                style={{ width: 'auto' }}
                checked={form.is_verified}
                onChange={(e) => update('is_verified', e.target.checked)}
              />
              <label htmlFor="is_verified" style={{ margin: 0 }}>Verified profile</label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Expertise</th>
                <th>Experience</th>
                <th>District</th>
                <th>Fee</th>
                <th>Verified</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(lawyers) && lawyers.length > 0 ? (
                lawyers.map((lawyer) => (
                  <tr key={lawyer.id}>
                    <td><Link href={`/admin/lawyers/${lawyer.id}`}><b>{lawyer.name}</b></Link></td>
                    <td>{lawyer.expertise}</td>
                    <td>{lawyer.experience_years} yrs</td>
                    <td>{lawyer.district || '—'}</td>
                    <td>৳{Number(lawyer.consultation_fee || 0).toLocaleString()}</td>
                    <td>
                      <span className={`tag ${lawyer.is_verified ? 'tag-green' : 'tag-amber'}`}>
                        {lawyer.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {!lawyer.is_verified && (
                        <button onClick={() => handleApprove(lawyer.id)} className="btn btn-primary btn-sm">
                          Accept
                        </button>
                      )}
                      <button onClick={() => startEdit(lawyer)} className="btn btn-outline btn-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(lawyer.id)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No lawyers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
