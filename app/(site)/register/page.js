'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DISTRICTS from '@/lib/districts';

export default function RegisterPage() {
  const [form, setForm] = useState({
    role: 'client',
    name: '',
    email: '',
    phone: '',
    password: '',
    district: '',
    category_id: '',
    expertise: '',
    experience_years: '',
    address: '',
    consultation_fee: '',
    bar_council_id: '',
    bio: '',
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || 'Registration failed.');
        return;
      }
      router.push(form.role === 'lawyer' ? '/lawyer-dashboard' : '/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card auth-box" style={{ maxWidth: 520 }}>
        <h2>Create an Account</h2>

        <div className="form-group">
          <label>I am registering as</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'client' })}
              className={form.role === 'client' ? 'btn btn-navy' : 'btn btn-outline'}
              style={form.role !== 'client' ? { color: 'var(--navy)', borderColor: 'var(--border)' } : {}}
            >
              👤 Client
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'lawyer' })}
              className={form.role === 'lawyer' ? 'btn btn-navy' : 'btn btn-outline'}
              style={form.role !== 'lawyer' ? { color: 'var(--navy)', borderColor: 'var(--border)' } : {}}
            >
              ⚖ Lawyer
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+880 ..." />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
          </div>
          <div className="form-group">
            <label>District</label>
            <select required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
              <option value="">Select your district</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0' }}>
              We'll use this to automatically show you lawyers near you on the homepage.
            </p>
          </div>

          {form.role === 'lawyer' && (
            <>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -6, marginBottom: 16 }}>
                Tell us about your practice — this will appear on your public profile.
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label>Practice Area</label>
                  <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Expertise / Title</label>
                  <input required value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} placeholder="e.g. Criminal Defense" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Consultation Fee (৳)</label>
                  <input type="number" value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Bar Council ID</label>
                  <input value={form.bar_council_id} onChange={(e) => setForm({ ...form, bar_council_id: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Office Address</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Short Bio</label>
                <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell clients about your experience..." />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
