import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { toPositiveInt, isOneOf } from '@/lib/validate';

export async function PUT(req, { params }) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const numericId = toPositiveInt(id);
  if (!numericId) return Response.json({ ok: false, message: 'Invalid appointment id.' }, { status: 400 });

  const { status } = await req.json();
  if (!isOneOf(status, ['pending', 'confirmed', 'completed', 'cancelled'])) {
    return Response.json({ ok: false, message: 'Invalid status.' }, { status: 400 });
  }

  await db().execute('UPDATE appointments SET status = ? WHERE id = ?', [status, numericId]);
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
