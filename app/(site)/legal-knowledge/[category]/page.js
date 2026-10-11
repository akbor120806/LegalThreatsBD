export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { query } from '@/lib/db';

async function getCategory(slug) {
  const rows = await query('SELECT * FROM legal_categories WHERE slug = ?', [slug]);
  return rows[0] || null;
}

export default async function CategoryPage({ params }) {
  const { category: categorySlug } = await params;
  const category = await getCategory(categorySlug);
  if (!category) notFound();

  const documents = await query(
    'SELECT * FROM legal_documents WHERE category_id = ? ORDER BY title',
    [category.id]
  );
  const lawyers = await query(
    'SELECT * FROM lawyers WHERE expertise LIKE ? LIMIT 3',
    [`%${category.name}%`]
  );

  return (
    <>
      <section className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/legal-knowledge">Legal Knowledge</Link> / {category.name}
          </div>
          <span className="eyebrow">{category.name}</span>
          <h1 style={{ marginBottom: 6 }}>{category.name} Law</h1>
          <p style={{ marginBottom: 0, maxWidth: 640 }}>{category.description}</p>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>Related Legal Documents</h3>
          {documents.length === 0 ? (
            <div className="empty-state">No documents in this category yet.</div>
          ) : (
            <div className="grid grid-2">
              {documents.map((doc) => (
                <div key={doc.id} className="card">
                  <span className="tag">{category.name}</span>
                  <h4 style={{ fontSize: 16, margin: '10px 0 6px' }}>{doc.title}</h4>
                  <p style={{ fontSize: 13.5, marginBottom: 12 }}>{doc.description}</p>
                  <a href={doc.file_url} className="btn btn-outline btn-sm">
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}

          {lawyers.length > 0 && (
            <>
              <h3 style={{ fontSize: 18, margin: '40px 0 16px' }}>Lawyers Practicing {category.name} Law</h3>
              <div className="grid grid-3">
                {lawyers.map((lawyer) => (
                  <Link key={lawyer.id} href={`/lawyers/${lawyer.id}`} className="card card-hover">
                    <h4 style={{ fontSize: 16, marginBottom: 4 }}>{lawyer.name}</h4>
                    <p style={{ fontSize: 13.5, marginBottom: 0 }}>{lawyer.experience_years} years experience</p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
