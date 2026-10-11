import { getUserSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getUserSession();
  if (!session) return Response.json({ user: null });

  // Look up fresh from the DB (rather than just trusting the JWT payload)
  // so a district change is reflected immediately without needing to log
  // back in — the homepage uses this to auto-filter lawyers by district.
  const [[row]] = await db().query('SELECT id, name, email, role, district FROM users WHERE id = ?', [session.id]);
  if (!row) return Response.json({ user: null });

  return Response.json({ user: row });
}
