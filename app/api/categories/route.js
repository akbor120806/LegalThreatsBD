import { db } from '@/lib/db';

export async function GET() {
  const [rows] = await db().query('SELECT * FROM legal_categories ORDER BY id');
  return Response.json({ ok: true, categories: rows });
}
