export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import DownloadDocumentPdfButton from '@/components/DownloadDocumentPdfButton';

async function getDocuments() {
  const [rows] = await db().query(
    `SELECT d.*, c.name AS category_name FROM legal_documents d
     LEFT JOIN legal_categories c ON c.id = d.category_id ORDER BY d.created_at DESC`
  );
  return rows;
}

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title">Legal Documents</h2>
        <p className="section-subtitle">
          Create, manage, and access legal documents, notices, and act
          summaries quickly and securely.
        </p>

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Category</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{d.title}</td>
                  <td>{d.category_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{d.description}</td>
                  <td>
                    <DownloadDocumentPdfButton document={d} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
