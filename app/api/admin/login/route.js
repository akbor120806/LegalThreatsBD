import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createAdminSession } from '@/lib/session';
import { isNonEmptyString } from '@/lib/validate';

// There is no public registration endpoint for admins on purpose.
// Admin accounts can only be created via `npm run create-admin` on the server.
//
// SECURITY NOTE: a previous version of this file checked the password
// against a hardcoded string ("admin123") instead of the bcrypt hash stored
// in the database — meaning ANY existing admin username could be logged
// into with that one password, regardless of what password was actually
// set. That has been fixed below: the password is now verified with
// bcrypt.compare() against admins.password_hash, exactly like the public
// user login and like scripts/create-admin.js already hash it.
export async function POST(req) {
  const { username, password } = await req.json();

  if (!isNonEmptyString(username, 100) || typeof password !== 'string' || !password || password.length > 200) {
    return Response.json({ ok: false, message: 'Username and password are required.' }, { status: 400 });
  }

  try {
    const [rows] = await db().execute(
      'SELECT id, username, password_hash FROM admins WHERE username = ?',
      [username]
    );

    if (!rows.length) {
      return Response.json({ ok: false, message: 'Invalid admin credentials.' }, { status: 401 });
    }

    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) {
      return Response.json({ ok: false, message: 'Invalid admin credentials.' }, { status: 401 });
    }

    await createAdminSession({ id: rows[0].id, username: rows[0].username });

    return Response.json({ ok: true, message: 'Login successful.' });
  } catch (err) {
    return Response.json({ ok: false, message: 'Login failed. Please try again.' }, { status: 500 });
  }
}
