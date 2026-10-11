import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const [rows] = await db().query(
    `SELECT a.*, COALESCE(u.name, a.guest_name) AS user_name,
            COALESCE(u.email, a.guest_email) AS user_email,
            (a.user_id IS NULL) AS is_guest,
            l.name AS lawyer_name
     FROM appointments a
     LEFT JOIN users u ON u.id = a.user_id
     JOIN lawyers l ON l.id = a.lawyer_id
     ORDER BY a.created_at DESC`
  );
  return Response.json({ ok: true, appointments: rows });
}
