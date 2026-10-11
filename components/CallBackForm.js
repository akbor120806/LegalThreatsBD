'use client';

import { useState } from 'react';

export default function CallBackForm() {
  const [form, setForm] = useState({ name: '', phone: '', area: '' });
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('sent');
        setForm({ name: '', phone: '', area: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-inline">
      <div className="form-group">
        <label>Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your name"
          required
        />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+880 ..."
          required
        />
      </div>
      <div className="form-group">
        <label>Area</label>
        <input
          value={form.area}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
          placeholder="Your district"
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Send Now'}
      </button>
      {status === 'sent' && <p style={{ color: '#c69a3e', width: '100%', margin: '10px 0 0' }}>Thanks! We'll call you back shortly.</p>}
      {status === 'error' && <p style={{ color: '#ff9c9c', width: '100%', margin: '10px 0 0' }}>Something went wrong. Please try again.</p>}
    </form>
  );
}
