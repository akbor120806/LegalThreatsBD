'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then(setData);
  }, []);

  const statusClass = {
    pending: 'tag-amber',
    confirmed: 'tag-green',
    completed: 'tag',
    cancelled: 'tag-red',
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ marginBottom: 24 }}>Overview of LEGAL THREATs BD
 activity.</p>

      {!data ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-4" style={{ marginBottom: 32 }}>
            <div className="stat-card">
              <b>{data?.stats?.users || 0}</b>
              <span>Registered Clients</span>
            </div>
            <div className="stat-card">
              <b>{data?.stats?.lawyers || 0}</b>
              <span>Lawyers</span>
            </div>
            <div className="stat-card">
              <b>{data?.stats?.appointments || 0}</b>
              <span>Total Appointments</span>
            </div>
            <div className="stat-card">
              <b>{data?.stats?.pending || 0}</b>
              <span>Pending Appointments</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, margin: 0 }}>Recent Appointments</h3>
            <Link href="/admin/appointments" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Lawyer</th>
                  <th>Date</th>
                  <th>Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.recent && Array.isArray(data.recent) && data.recent.length > 0 ? (
                  data.recent.map((a) => (
                    <tr key={a.id}>
                      <td>{a.client_name}</td>
                      <td>{a.lawyer_name}</td>
                      <td>{a.appointment_date ? new Date(a.appointment_date).toLocaleDateString() : ''}</td>
                      <td style={{ textTransform: 'capitalize' }}>{a.mode}</td>
                      <td><span className={`tag ${statusClass[a.status] || ''}`}>{a.status}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No recent appointments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}