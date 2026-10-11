'use client';

import { useEffect, useState } from 'react';

const STATUSES = ['new', 'contacted', 'closed'];

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/messages');
    const data = await res.json();
    setMessages(data.messages || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id, status) {
    await fetch(`/api/admin/messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this request?')) return;
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    load();
  }

  const statusClass = { new: 'tag-amber', contacted: 'tag-green', closed: 'tag' };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Call-back Requests</h1>
      <p style={{ marginBottom: 20 }}>Submitted from the homepage &quot;Request a Call Back&quot; form.</p>

      {loading ? (
        <p>Loading...</p>
      ) : messages.length === 0 ? (
        <div className="empty-state">No requests yet.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Area</th>
                <th>Message</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id}>
                  <td><b>{m.name}</b></td>
                  <td>{m.phone}</td>
                  <td>{m.area || '—'}</td>
                  <td style={{ maxWidth: 280 }}>{m.message || '—'}</td>
                  <td>
                    <select
                      value={m.status}
                      onChange={(e) => updateStatus(m.id, e.target.value)}
                      className={`tag ${statusClass[m.status] || ''}`}
                      style={{ border: 'none', fontWeight: 700 }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(m.id)} className="btn btn-danger btn-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
