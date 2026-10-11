import { db } from '@/lib/db';
import { getUserSession } from '@/lib/session';

export async function GET() {
  const session = await getUserSession();
  if (!session || session.role !== 'lawyer') {
    return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const conn = db();
  const [[lawyerRow]] = await conn.query('SELECT id FROM lawyers WHERE user_id = ?', [session.id]);
  if (!lawyerRow) {
    return Response.json({ ok: false, message: 'Lawyer profile not found.' }, { status: 404 });
  }

  const [appointments] = await conn.query(
    `SELECT a.*,
            COALESCE(u.name, a.guest_name) AS client_name,
            COALESCE(u.phone, a.guest_phone) AS client_phone,
            COALESCE(u.email, a.guest_email) AS client_email,
            (a.user_id IS NULL) AS is_guest
     FROM appointments a LEFT JOIN users u ON u.id = a.user_id
     WHERE a.lawyer_id = ? ORDER BY a.created_at DESC`,
    [lawyerRow.id]
  );

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    accepted: appointments.filter((a) => a.status === 'confirmed' || a.status === 'completed').length,
    rejected: appointments.filter((a) => a.status === 'cancelled' && a.cancelled_by === 'lawyer').length,
    rescheduleRequested: appointments.filter((a) => a.status === 'reschedule_requested').length,
  };

  return Response.json({ ok: true, appointments, stats });
}
