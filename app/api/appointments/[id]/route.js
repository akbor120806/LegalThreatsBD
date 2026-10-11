import { db } from '@/lib/db';
import { getUserSession, getAdminSession } from '@/lib/session';
import { toPositiveInt, isOneOf } from '@/lib/validate';

// Used by two different callers:
//  - Client dashboard sends { action: 'accept_reschedule' | 'decline_reschedule' | 'cancel' },
//    scoped to the logged-in client's own appointment.
//  - Admin panel sends { status: 'pending' | 'confirmed' | 'completed' | 'cancelled' } directly,
//    and can update any appointment.
export async function PUT(req, { params }) {
  const { id } = await params;
  const numericId = toPositiveInt(id);
  if (!numericId) return Response.json({ ok: false, message: 'Invalid appointment id.' }, { status: 400 });

  const conn = db();
  const body = await req.json();

  const admin = await getAdminSession();
  if (admin) {
    if (!isOneOf(body.status, ['pending', 'confirmed', 'completed', 'cancelled'])) {
      return Response.json({ ok: false, message: 'Invalid status.' }, { status: 400 });
    }
    await conn.execute('UPDATE appointments SET status = ?, cancelled_by = NULL WHERE id = ?', [
      body.status,
      numericId,
    ]);
    return Response.json({ ok: true });
  }

  const session = await getUserSession();
  if (!session) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const [[appt]] = await conn.query('SELECT * FROM appointments WHERE id = ? AND user_id = ?', [numericId, session.id]);
  if (!appt) return Response.json({ ok: false, message: 'Appointment not found.' }, { status: 404 });

  const action = body.action || (body.status === 'cancelled' ? 'cancel' : null);

  if (action === 'accept_reschedule') {
    if (appt.status !== 'reschedule_requested') {
      return Response.json({ ok: false, message: 'No pending reschedule proposal.' }, { status: 400 });
    }
    await conn.execute(
      `UPDATE appointments SET status = 'confirmed', appointment_date = proposed_date,
         appointment_time = proposed_time, proposed_date = NULL, proposed_time = NULL WHERE id = ?`,
      [numericId]
    );
  } else if (action === 'decline_reschedule' || action === 'cancel') {
    await conn.execute(
      "UPDATE appointments SET status = 'cancelled', cancelled_by = 'client', proposed_date = NULL, proposed_time = NULL WHERE id = ?",
      [numericId]
    );
  } else {
    return Response.json({ ok: false, message: 'Invalid action.' }, { status: 400 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const numericId = toPositiveInt(id);
  if (!numericId) return Response.json({ ok: false, message: 'Invalid appointment id.' }, { status: 400 });

  await db().execute('DELETE FROM appointments WHERE id = ?', [numericId]);
  return Response.json({ ok: true });
}
