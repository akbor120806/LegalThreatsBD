import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function POST(_req, { params }) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return Response.json({ ok: false, message: 'Invalid lawyer id.' }, { status: 400 });
  }

  const [result] = await db().execute('UPDATE lawyers SET is_verified = 1 WHERE id = ?', [numericId]);
  if (!result.affectedRows) {
    return Response.json({ ok: false, message: 'Lawyer not found.' }, { status: 404 });
  }

  return Response.json({ ok: true, message: 'Lawyer approved.' });
}
