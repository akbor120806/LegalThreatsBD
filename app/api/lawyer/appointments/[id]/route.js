import { db } from '@/lib/db';
import { getUserSession } from '@/lib/session';
import { toPositiveInt, isOneOf, isValidDateString, isValidTimeString, clampString } from '@/lib/validate';

// action: 'accept' | 'reject' | 'reschedule' | 'complete'
export async function PUT(req, { params }) {
  const session = await getUserSession();
  if (!session || session.role !== 'lawyer') {
    return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const numericId = toPositiveInt(id);
  if (!numericId) return Response.json({ ok: false, message: 'Invalid appointment id.' }, { status: 400 });

  const conn = db();

  const [[lawyerRow]] = await conn.query('SELECT id FROM lawyers WHERE user_id = ?', [session.id]);
  if (!lawyerRow) return Response.json({ ok: false, message: 'Lawyer profile not found.' }, { status: 404 });

  const [[appt]] = await conn.query('SELECT * FROM appointments WHERE id = ? AND lawyer_id = ?', [numericId, lawyerRow.id]);
  if (!appt) return Response.json({ ok: false, message: 'Appointment not found.' }, { status: 404 });

  const body = await req.json();
  const action = body.action;
  const lawyerNote = clampString(body.lawyer_note, 500);

  if (!isOneOf(action, ['accept', 'reject', 'reschedule', 'complete'])) {
    return Response.json({ ok: false, message: 'Invalid action.' }, { status: 400 });
  }

  if (action === 'accept') {
    await conn.execute("UPDATE appointments SET status = 'confirmed', cancelled_by = NULL WHERE id = ?", [numericId]);
  } else if (action === 'reject') {
    await conn.execute(
      "UPDATE appointments SET status = 'cancelled', cancelled_by = 'lawyer', lawyer_note = ? WHERE id = ?",
      [lawyerNote, numericId]
    );
  } else if (action === 'reschedule') {
    if (!isValidDateString(body.proposed_date) || !isValidTimeString(body.proposed_time)) {
      return Response.json({ ok: false, message: 'A valid proposed date and time are required.' }, { status: 400 });
    }
    await conn.execute(
      "UPDATE appointments SET status = 'reschedule_requested', proposed_date = ?, proposed_time = ?, lawyer_note = ? WHERE id = ?",
      [body.proposed_date, body.proposed_time, lawyerNote, numericId]
    );
  } else if (action === 'complete') {
    await conn.execute("UPDATE appointments SET status = 'completed' WHERE id = ?", [numericId]);
  }

  return Response.json({ ok: true });
}
