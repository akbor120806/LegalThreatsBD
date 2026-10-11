import { db } from '@/lib/db';
import { isNonEmptyString, clampString } from '@/lib/validate';

export async function POST(req) {
  const { name, phone, area, message } = await req.json();

  if (!isNonEmptyString(name, 150) || !isNonEmptyString(phone, 30)) {
    return Response.json({ ok: false, message: 'Name and phone are required.' }, { status: 400 });
  }

  await db().execute(
    'INSERT INTO contact_requests (name, phone, area, message) VALUES (?, ?, ?, ?)',
    [clampString(name, 150), clampString(phone, 30), clampString(area, 100), clampString(message, 1000)]
  );

  return Response.json({ ok: true, message: 'Request received.' });
}
