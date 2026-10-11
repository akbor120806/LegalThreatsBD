import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const [rows] = await db().query('SELECT * FROM contact_requests ORDER BY created_at DESC');
  return Response.json({ ok: true, messages: rows });
}

export async function PUT(req) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id, status } = await req.json();
  const allowed = ['new', 'contacted', 'closed'];
  if (!allowed.includes(status)) {
    return Response.json({ ok: false, message: 'Invalid status.' }, { status: 400 });
  }

  await db().execute('UPDATE contact_requests SET status = ? WHERE id = ?', [status, id]);
  return Response.json({ ok: true });
}
