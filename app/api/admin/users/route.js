import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const [rows] = await db().query(
    `SELECT u.id, u.name, u.email, u.phone, u.created_at,
            (SELECT COUNT(*) FROM appointments a WHERE a.user_id = u.id) AS appointment_count
     FROM users u ORDER BY u.created_at DESC`
  );
  return Response.json({ ok: true, users: rows });
}
