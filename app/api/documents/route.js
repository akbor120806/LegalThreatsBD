import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  let sql = `SELECT d.*, c.name AS category_name FROM legal_documents d
             LEFT JOIN legal_categories c ON c.id = d.category_id`;
  const args = [];
  if (category) {
    sql += ' WHERE c.slug = ?';
    args.push(category);
  }
  sql += ' ORDER BY d.created_at DESC';

  const [rows] = await db().query(sql, args);
  return Response.json({ ok: true, documents: rows });
}

export async function POST(req) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const b = await req.json();
  if (!b.title) {
    return Response.json({ error: 'Title is required.' }, { status: 400 });
  }

  const [result] = await db().execute(
    'INSERT INTO legal_documents (title, description, category_id, file_url) VALUES (?, ?, ?, ?)',
    [b.title, b.description || null, b.category_id || null, b.file_url || '#']
  );

  return Response.json({ ok: true, id: result.insertId });
}
