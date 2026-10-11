import { db } from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const category = searchParams.get('category');

  let sql = `SELECT l.*, c.name AS category_name, c.slug AS category_slug
             FROM lawyers l LEFT JOIN legal_categories c ON c.id = l.category_id
             WHERE l.is_verified = 1`;
  const args = [];

  if (q) {
    sql += ' AND (l.name LIKE ? OR l.expertise LIKE ? OR l.district LIKE ?)';
    args.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category) {
    sql += ' AND c.slug = ?';
    args.push(category);
  }
  sql += ' ORDER BY l.rating DESC';

  const [rows] = await db().query(sql, args);
  return Response.json({ ok: true, lawyers: rows });
}
