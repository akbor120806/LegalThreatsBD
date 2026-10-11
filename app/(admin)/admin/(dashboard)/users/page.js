'use client';

import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this client account? Their appointments will be kept but unlinked.')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Clients</h1>
      <p style={{ marginBottom: 20 }}>Registered site users.</p>

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <div className="empty-state">No registered clients yet.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><b>{u.name}</b></td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDelete(u.id)} className="btn btn-danger btn-sm">
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
