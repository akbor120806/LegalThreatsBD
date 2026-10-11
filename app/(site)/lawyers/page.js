export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import LawyerCard from '@/components/LawyerCard';
import DistrictFilter from '@/components/DistrictFilter';
import Link from 'next/link';
import { Suspense } from 'react';

async function getLawyers(q, category, district) {
  const conn = db();
  let sql = `SELECT l.*, c.slug AS category_slug FROM lawyers l
             LEFT JOIN legal_categories c ON c.id = l.category_id WHERE l.is_verified = 1`;
  const args = [];
  if (q) {
    sql += ' AND (l.name LIKE ? OR l.expertise LIKE ? OR l.district LIKE ?)';
    args.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category) {
    sql += ' AND c.slug = ?';
    args.push(category);
  }
  if (district) {
    sql += ' AND l.district = ?';
    args.push(district);
  }
  sql += ' ORDER BY l.rating DESC';
  const [rows] = await conn.query(sql, args);
  return rows;
}

export default async function LawyersPage({ searchParams }) {
  const sp = await searchParams;
  const q = sp?.q || '';
  const category = sp?.category || '';
  const district = sp?.district || '';

  const [lawyers, categories] = await Promise.all([
    getLawyers(q, category, district),
    db().query('SELECT * FROM legal_categories ORDER BY id').then((r) => r[0]),
  ]);

  return (
    <div className="section">
      <div className="container">
        <div className="find-lawyer-header">
          <div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 4 }}>Find a Lawyer</h2>
            <p className="section-subtitle" style={{ textAlign: 'left', margin: 0 }}>
              Connect with trusted and experienced lawyers across Bangladesh.
            </p>
          </div>
          <Suspense fallback={<div className="district-filter" />}>
            <DistrictFilter currentDistrict={district} />
          </Suspense>
        </div>

        <form className="search-bar" style={{ maxWidth: 640, margin: '0 auto 26px', boxShadow: 'var(--shadow)' }}>
          {category && <input type="hidden" name="category" value={category} />}
          {district && <input type="hidden" name="district" value={district} />}
          <input name="q" defaultValue={q} placeholder="Search by name, expertise or district..." />
          <button type="submit">Search</button>
        </form>

        <div className="category-tabs">
          <Link href={district ? `/lawyers?district=${district}` : '/lawyers'} className={!category ? 'active' : ''}>All</Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/lawyers?category=${c.slug}${district ? `&district=${district}` : ''}`}
              className={category === c.slug ? 'active' : ''}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {district && (
          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-muted)', marginTop: -14, marginBottom: 20 }}>
            Showing lawyers in <b style={{ color: 'var(--navy)' }}>{district}</b> ·{' '}
            <Link href={category ? `/lawyers?category=${category}` : '/lawyers'} style={{ color: 'var(--gold)', fontWeight: 600 }}>
              Clear district filter
            </Link>
          </p>
        )}

        {lawyers.length ? (
          <div className="grid grid-4 lawyer-grid">
            {lawyers.map((l) => (
              <LawyerCard key={l.id} lawyer={l} />
            ))}
          </div>
        ) : (
          <div className="empty-state">No lawyers found. Try a different search, district or category.</div>
        )}
      </div>
    </div>
  );
}
