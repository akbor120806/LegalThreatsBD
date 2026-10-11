import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createUserSession } from '@/lib/session';
import { isValidEmail } from '@/lib/validate';

export async function POST(req) {
  const { email, password } = await req.json();

  if (!isValidEmail(email) || typeof password !== 'string' || !password || password.length > 200) {
    return Response.json({ ok: false, message: 'Email and password are required.' }, { status: 400 });
  }

  try {
    const [rows] = await db().execute(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      return Response.json({ ok: false, message: 'Invalid email or password.' }, { status: 401 });
    }

    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) {
      return Response.json({ ok: false, message: 'Invalid email or password.' }, { status: 401 });
    }

    const user = { id: rows[0].id, name: rows[0].name, email: rows[0].email, role: rows[0].role };
    await createUserSession(user);

    return Response.json({ ok: true, message: 'Login successful.', user });
  } catch (err) {
    console.error('Login failed:', err);
    return Response.json({ ok: false, message: 'Login failed. Please try again.' }, { status: 500 });
  }
}
