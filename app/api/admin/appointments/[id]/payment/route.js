import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { toPositiveInt, isOneOf } from '@/lib/validate';

// Admin checks their real bKash/Nagad/Rocket/bank account for the
// transaction ID the client submitted, then marks it verified or rejected.
export async function PUT(req, { params }) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const numericId = toPositiveInt(id);
  if (!numericId) return Response.json({ ok: false, message: 'Invalid appointment id.' }, { status: 400 });

  const { action } = await req.json();
  if (!isOneOf(action, ['verify', 'reject'])) {
    return Response.json({ ok: false, message: 'Invalid action.' }, { status: 400 });
  }

  const conn = db();

  if (action === 'verify') {
    await conn.execute(
      "UPDATE appointments SET payment_status = 'verified', payment_verified_at = NOW() WHERE id = ?",
      [numericId]
    );
  } else {
    // A rejected payment invalidates the booking itself.
    await conn.execute(
      "UPDATE appointments SET payment_status = 'rejected', status = 'cancelled', cancelled_by = NULL WHERE id = ?",
      [numericId]
    );
  }

  return Response.json({ ok: true });
}
