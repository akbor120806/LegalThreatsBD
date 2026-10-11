'use client';

import { useEffect, useState } from 'react';
import DownloadDocumentPdfButton from '@/components/DownloadDocumentPdfButton';

const EMPTY_FORM = { title: '', description: '', category_id: '', file_url: '' };

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    const [docsRes, catsRes] = await Promise.all([
      fetch('/api/documents'),
      fetch('/api/categories'),
    ]);
    const docsData = await docsRes.json();
    const catsData = await catsRes.json();
    setDocuments(docsData.documents || []);
    setCategories(catsData.categories || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this document?')) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Legal Documents</h1>
          <p style={{ margin: 0 }}>Manage reference documents shown under Legal Knowledge.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn btn-primary btn-sm">
          {showForm ? 'Close' : '+ Add Document'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          {error && <div className="form-msg error">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="form-field">
              <label>Title</label>
              <input required value={form.title} onChange={(e) => update('title', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Category</label>
                <select value={form.category_id} onChange={(e) => update('category_id', e.target.value)}>
                  <option value="">General</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>File URL (optional)</label>
                <input value={form.file_url} onChange={(e) => update('file_url', e.target.value)} placeholder="#" />
              </div>
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} />
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : 'Save Document'}
            </button>
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
                <th>Title</th>
                <th>Category</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id}>
                  <td><b>{d.title}</b></td>
                  <td><span className="tag">{d.category_name || 'General'}</span></td>
                  <td style={{ maxWidth: 360 }}>{d.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <DownloadDocumentPdfButton document={d} className="btn btn-outline btn-sm" />
                      <button onClick={() => handleDelete(d.id)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </div>
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
