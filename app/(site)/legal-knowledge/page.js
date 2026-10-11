export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { query } from '@/lib/db';

export default async function LegalKnowledgePage() {
  const categories = await query('SELECT * FROM legal_categories ORDER BY name');
  const counts = await query(
    'SELECT category_id, COUNT(*) as c FROM legal_documents GROUP BY category_id'
  );
  const countMap = Object.fromEntries(counts.map((c) => [c.category_id, c.c]));

  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Legal Knowledge</span>
          <h1 style={{ marginBottom: 6 }}>Understand your rights, in plain language</h1>
          <p style={{ marginBottom: 0 }}>
            Browse legal topics by category to find relevant acts, procedures, and explanations.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/legal-knowledge/${cat.slug}`} className="card card-hover">
                <span className="tag">{countMap[cat.id] || 0} resources</span>
                <h2 style={{ fontSize: 22, margin: '12px 0 8px' }}>{cat.name}</h2>
                <p style={{ marginBottom: 0 }}>{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
