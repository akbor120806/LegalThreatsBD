import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createUserSession } from '@/lib/session';
import { isNonEmptyString, isValidEmail, toPositiveInt, clampString, isOneOf } from '@/lib/validate';
import DISTRICTS from '@/lib/districts';

export async function POST(req) {
  const body = await req.json();
  const { name, email, phone, password, role, district } = body;
  const userRole = role === 'lawyer' ? 'lawyer' : 'client';

  if (!isNonEmptyString(name, 150) || !isValidEmail(email) || typeof password !== 'string' || password.length < 6 || password.length > 200) {
    return Response.json(
      { ok: false, message: 'A valid name, email and a password of at least 6 characters are required.' },
      { status: 400 }
    );
  }

  if (!isOneOf(district, DISTRICTS)) {
    return Response.json({ ok: false, message: 'Please select your district.' }, { status: 400 });
  }

  if (userRole === 'lawyer' && (!isNonEmptyString(body.expertise, 150) || !toPositiveInt(body.category_id))) {
    return Response.json(
      { ok: false, message: 'Please provide your expertise and practice area to register as a lawyer.' },
      { status: 400 }
    );
  }

  const conn = db();

  try {
    const [existing] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return Response.json({ ok: false, message: 'An account with this email already exists.' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await conn.execute(
      'INSERT INTO users (name, email, phone, password_hash, role, district) VALUES (?, ?, ?, ?, ?, ?)',
      [clampString(name, 150), email, clampString(phone, 30), hash, userRole, district]
    );
    const userId = result.insertId;

    if (userRole === 'lawyer') {
      await conn.execute(
        `INSERT INTO lawyers
          (user_id, name, expertise, category_id, experience_years, address, district, consultation_fee, bar_council_id, bio, is_verified, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 4.5)`,
        [
          userId,
          clampString(name, 150),
          clampString(body.expertise, 150),
          toPositiveInt(body.category_id),
          Number(body.experience_years) || 0,
          clampString(body.address, 255),
          district,
          Number(body.consultation_fee) || 0,
          clampString(body.bar_council_id, 100),
          clampString(body.bio, 2000),
        ]
      );
    }

    const user = { id: userId, name, email, role: userRole };
    await createUserSession(user);

    return Response.json({ ok: true, message: 'Registration successful.', user });
  } catch (err) {
    // Log the real error server-side so schema/config issues (e.g. a
    // missing column after a database update) are easy to diagnose,
    // while still only ever showing the person a safe generic message.
    console.error('Registration failed:', err);
    const hint =
      err?.code === 'ER_BAD_FIELD_ERROR'
        ? ' (Your database schema looks out of date — re-run database/schema.sql or the latest database/migrate_v*.sql file.)'
        : '';
    return Response.json(
      { ok: false, message: `Registration failed. Please try again.${hint}` },
      { status: 500 }
    );
  }
}
