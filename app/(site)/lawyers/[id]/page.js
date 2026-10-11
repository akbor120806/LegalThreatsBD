export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import DownloadLawyerPdfButton from '@/components/DownloadLawyerPdfButton';

async function getLawyer(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return null;
  const [rows] = await db().query(
    `SELECT l.*, c.name AS category_name FROM lawyers l
     LEFT JOIN legal_categories c ON c.id = l.category_id WHERE l.id = ? AND l.is_verified = 1`,
    [numericId]
  );
  return rows[0] || null;
}

export default async function LawyerDetailPage({ params }) {
  const { id } = await params;
  const lawyer = await getLawyer(id);
  if (!lawyer) notFound();

  const initials = lawyer.name
    .replace(/^(Barrister|Advocate)\s+/i, '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="section">
      <div className="container">
        <div className="grid grid-2" style={{ alignItems: 'flex-start', gridTemplateColumns: '1.2fr 1fr' }}>
          <div className="card card-pad">
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 20 }}>
              <div
                className="lawyer-photo"
                style={{ width: 90, height: 90, borderRadius: 14, fontSize: 28, flexShrink: 0, overflow: 'hidden' }}
              >
                {lawyer.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lawyer.photo_url} alt={lawyer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>
              <div>
                <h1 style={{ margin: '0 0 6px', color: 'var(--navy)', fontSize: 24 }}>{lawyer.name}</h1>
                <div style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: 6 }}>{lawyer.expertise}</div>
                <span className="rating">★ {Number(lawyer.rating).toFixed(1)}</span>
                {lawyer.is_verified ? <span className="badge" style={{ marginLeft: 10 }}>Verified</span> : null}
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{lawyer.bio}</p>

            <div className="grid grid-2" style={{ marginTop: 22 }}>
              <div>
                <div className="lawyer-meta">📍 <strong>Address:</strong> {lawyer.address}</div>
                <div className="lawyer-meta">🏙 <strong>District:</strong> {lawyer.district}</div>
                <div className="lawyer-meta">🎓 <strong>Experience:</strong> {lawyer.experience_years}+ years</div>
              </div>
              <div>
                <div className="lawyer-meta">⚖ <strong>Practice Area:</strong> {lawyer.category_name}</div>
                <div className="lawyer-meta">🪪 <strong>Bar Council ID:</strong> {lawyer.bar_council_id}</div>
                <div className="lawyer-meta">💰 <strong>Fee:</strong> ৳{Number(lawyer.consultation_fee).toFixed(0)} / consultation</div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <DownloadLawyerPdfButton lawyer={lawyer} />
            </div>
          </div>

          <div className="card card-pad">
            <h3 style={{ marginTop: 0, color: 'var(--navy)' }}>Book an Appointment</h3>
            <BookingForm lawyer={lawyer} />
          </div>
        </div>
      </div>
    </div>
  );
}
