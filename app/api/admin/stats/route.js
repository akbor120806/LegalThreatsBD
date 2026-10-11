import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const conn = db();
  const [[users]] = await conn.query('SELECT COUNT(*) AS count FROM users');
  const [[lawyers]] = await conn.query('SELECT COUNT(*) AS count FROM lawyers');
  const [[appointments]] = await conn.query('SELECT COUNT(*) AS count FROM appointments');
  const [[pending]] = await conn.query("SELECT COUNT(*) AS count FROM appointments WHERE status = 'pending'");
  const [[messages]] = await conn.query('SELECT COUNT(*) AS count FROM contact_requests');
  const [recentAppointments] = await conn.query(
    `SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.mode,
            COALESCE(u.name, a.guest_name) AS user_name,
            COALESCE(u.name, a.guest_name) AS client_name,
            l.name AS lawyer_name
     FROM appointments a
     LEFT JOIN users u ON u.id = a.user_id
     JOIN lawyers l ON l.id = a.lawyer_id
     ORDER BY a.created_at DESC LIMIT 6`
  );

  return Response.json({
    ok: true,
    stats: {
      users: users.count,
      lawyers: lawyers.count,
      appointments: appointments.count,
      pending: pending.count,
      pendingAppointments: pending.count,
      messages: messages.count,
    },
    // Both keys included: `recent` is what the current dashboard page reads,
    // `recentAppointments` kept for backward compatibility.
    recent: recentAppointments,
    recentAppointments,
  });
}
