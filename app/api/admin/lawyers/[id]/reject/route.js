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

  const conn = db();
  const [[lawyer]] = await conn.query('SELECT user_id FROM lawyers WHERE id = ?', [numericId]);
  if (!lawyer) {
    return Response.json({ ok: false, message: 'Lawyer not found.' }, { status: 404 });
  }

  // Remove the lawyer profile. If it was a self-registered account, revert
  // their user role back to 'client' instead of deleting the account, so
  // they can still log in (just without a lawyer profile).
  await conn.execute('DELETE FROM lawyers WHERE id = ?', [numericId]);
  if (lawyer.user_id) {
    await conn.execute("UPDATE users SET role = 'client' WHERE id = ?", [lawyer.user_id]);
  }

  return Response.json({ ok: true, message: 'Lawyer application rejected.' });
}
