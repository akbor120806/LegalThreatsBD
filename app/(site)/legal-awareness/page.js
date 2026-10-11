import { db } from '@/lib/db';
import T from '@/components/T';

async function getData() {
  const conn = db();
  const [categories] = await conn.query('SELECT * FROM legal_categories ORDER BY id');
  const [documents] = await conn.query(
    `SELECT d.*, c.slug AS category_slug FROM legal_documents d
     LEFT JOIN legal_categories c ON c.id = d.category_id ORDER BY d.id`
  );
  return { categories, documents };
}

export default async function LegalAwarenessPage() {
  const { categories, documents } = await getData();

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title"><T k="nav_legal_knowledge" /></h2>
        <p className="section-subtitle">
          Simplified explanations of the laws that matter most to everyday
          citizens of Bangladesh, organized by practice area.
        </p>

        {categories.map((cat) => {
          const docs = documents.filter((d) => d.category_slug === cat.slug);
          if (!docs.length) return null;
          return (
            <div key={cat.id} style={{ marginBottom: 44 }}>
              <h3 style={{ color: 'var(--navy)', fontSize: 20, marginBottom: 6 }}>{cat.name}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 18, fontSize: 14 }}>{cat.description}</p>
              <div className="grid grid-3">
                {docs.map((d) => (
                  <div key={d.id} className="card card-pad">
                    <h4 style={{ margin: '0 0 8px', color: 'var(--navy)', fontSize: 15 }}>{d.title}</h4>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
                      {d.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
