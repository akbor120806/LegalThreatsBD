import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { toPositiveInt, isNonEmptyString } from '@/lib/validate';

export async function PUT(req, { params }) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const numericId = toPositiveInt(id);
  if (!numericId) return Response.json({ ok: false, message: 'Invalid lawyer id.' }, { status: 400 });

  const b = await req.json();
  if (!isNonEmptyString(b.name, 150) || !isNonEmptyString(b.expertise, 150)) {
    return Response.json({ ok: false, message: 'Name and expertise are required.' }, { status: 400 });
  }

  await db().execute(
    `UPDATE lawyers SET name=?, expertise=?, category_id=?, experience_years=?, address=?, district=?,
       consultation_fee=?, bar_council_id=?, bio=?, is_verified=?, rating=? WHERE id=?`,
    [
      b.name,
      b.expertise,
      toPositiveInt(b.category_id) || null,
      Number(b.experience_years) || 0,
      b.address || null,
      b.district || null,
      Number(b.consultation_fee) || 0,
      b.bar_council_id || null,
      b.bio || null,
      b.is_verified ? 1 : 0,
      Number(b.rating) || 4.5,
      numericId,
    ]
  );

  return Response.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const numericId = toPositiveInt(id);
  if (!numericId) return Response.json({ ok: false, message: 'Invalid lawyer id.' }, { status: 400 });

  await db().execute('DELETE FROM lawyers WHERE id = ?', [numericId]);
  return Response.json({ ok: true });
}
