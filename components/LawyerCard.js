import Link from 'next/link';

export default function LawyerCard({ lawyer }) {
  const initials = lawyer.name
    .replace(/^(Barrister|Advocate)\s+/i, '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="card lawyer-card">
      <div className="lawyer-photo">
        {lawyer.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lawyer.photo_url} alt={lawyer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          initials
        )}
      </div>
      <div className="lawyer-info">
        <h3>{lawyer.name}</h3>
        <div className="expertise">{lawyer.expertise}</div>
        <div className="lawyer-meta">📍 {lawyer.district || lawyer.address || 'Bangladesh'}</div>
        <div className="lawyer-meta">🎓 {lawyer.experience_years}+ years experience</div>
        <div className="lawyer-meta">💰 ৳{Number(lawyer.consultation_fee).toFixed(0)} / consultation</div>
        <div className="lawyer-footer">
          <span className="rating">★ {Number(lawyer.rating).toFixed(1)}</span>
          {lawyer.is_verified ? <span className="badge">Verified</span> : null}
        </div>
        <Link href={`/lawyers/${lawyer.id}`} className="btn btn-navy btn-block btn-sm" style={{ marginTop: 14 }}>
          View Profile
        </Link>
      </div>
    </div>
  );
}
