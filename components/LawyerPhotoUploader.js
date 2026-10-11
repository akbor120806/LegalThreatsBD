'use client';

import { useRef, useState } from 'react';

const COOLDOWN_DAYS = 90;

export default function LawyerPhotoUploader({ photoUrl, photoUpdatedAt, onChange }) {
  // Photos can be changed once every 3 months (the very first upload is free).
  const unlockAt = photoUpdatedAt
    ? new Date(new Date(photoUpdatedAt).getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
    : null;
  const locked = !!unlockAt && unlockAt.getTime() > Date.now();
  const unlockText = unlockAt
    ? unlockAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch('/api/lawyer/photo', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || 'Upload failed.');
        return;
      }
      onChange(data.photo_url, data.photo_updated_at);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleDelete() {
    if (!confirm('Remove your profile photo?')) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/lawyer/photo', { method: 'DELETE' });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || 'Failed to delete photo.');
        return;
      }
      onChange(null, data.photo_updated_at);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 14,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--navy-light), var(--navy))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: '#fff', fontSize: 28 }}>👤</span>
        )}
      </div>
      <div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-outline-navy btn-sm"
            onClick={() => inputRef.current?.click()}
            disabled={loading || locked}
          >
            {loading ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Photo'}
          </button>
          {photoUrl && (
            <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete} disabled={loading || locked}>
              Delete
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0' }}>
          JPG, PNG or WEBP, up to 3MB. After you change your photo you can change it again after 3 months.
        </p>
        {locked && (
          <p style={{ fontSize: 12, color: 'var(--warning)', margin: '4px 0 0' }}>
            🔒 Next photo change available on {unlockText}.
          </p>
        )}
        {error && <p style={{ fontSize: 12, color: 'var(--danger)', margin: '4px 0 0' }}>{error}</p>}
      </div>
    </div>
  );
}
