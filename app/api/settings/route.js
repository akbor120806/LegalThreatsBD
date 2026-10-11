import { db } from '@/lib/db';

export async function GET() {
  const [[settings]] = await db().query('SELECT * FROM site_settings WHERE id = 1');
  return Response.json({ ok: true, settings: settings || null });
}
