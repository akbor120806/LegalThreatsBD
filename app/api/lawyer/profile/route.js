import { db } from '@/lib/db';
import { getUserSession } from '@/lib/session';

async function requireLawyer() {
  const session = await getUserSession();
  if (!session || session.role !== 'lawyer') return null;
  return session;
}

export async function GET() {
  const session = await requireLawyer();
  if (!session) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const [rows] = await db().query(
    `SELECT l.*, c.name AS category_name FROM lawyers l
     LEFT JOIN legal_categories c ON c.id = l.category_id WHERE l.user_id = ?`,
    [session.id]
  );

  if (!rows.length) {
    return Response.json({ ok: false, message: 'Lawyer profile not found.' }, { status: 404 });
  }

  return Response.json({ ok: true, lawyer: rows[0] });
}

export async function PUT(req) {
  const session = await requireLawyer();
  if (!session) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const b = await req.json();

  const [result] = await db().execute(
    `UPDATE lawyers SET expertise=?, category_id=?, experience_years=?, address=?, district=?,
       consultation_fee=?, bar_council_id=?, bio=? WHERE user_id=?`,
    [
      b.expertise,
      b.category_id || null,
      b.experience_years || 0,
      b.address || null,
      b.district || null,
      b.consultation_fee || 0,
      b.bar_council_id || null,
      b.bio || null,
      session.id,
    ]
  );

  if (!result.affectedRows) {
    return Response.json({ ok: false, message: 'Lawyer profile not found.' }, { status: 404 });
  }

  return Response.json({ ok: true, message: 'Profile updated.' });
}

// A lawyer may withdraw (delete) their own profile ONLY while it is still
// pending admin approval. Once approved, self-deletion is blocked so a
// lawyer can't take client payments and then erase their account to avoid
// accountability — after approval only an admin can remove the profile.
export async function DELETE() {
  const session = await requireLawyer();
  if (!session) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const conn = db();
  const [[row]] = await conn.query('SELECT id, is_verified FROM lawyers WHERE user_id = ?', [session.id]);
  if (!row) {
    return Response.json({ ok: false, message: 'Lawyer profile not found.' }, { status: 404 });
  }

  if (row.is_verified) {
    return Response.json(
      {
        ok: false,
        message:
          'Your profile has already been approved, so it can no longer be deleted by you. Please contact the admin if you need it removed.',
      },
      { status: 403 }
    );
  }

  await conn.execute('DELETE FROM lawyers WHERE id = ?', [row.id]);
  // Keep the login working as a normal client account.
  await conn.execute("UPDATE users SET role = 'client' WHERE id = ?", [session.id]);

  return Response.json({ ok: true, message: 'Your lawyer application has been withdrawn.' });
}
