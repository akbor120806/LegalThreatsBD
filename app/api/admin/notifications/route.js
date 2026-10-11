import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const [[pendingLawyers]] = await db().query(
    "SELECT COUNT(*) AS count FROM lawyers WHERE is_verified = 0"
  );

  return Response.json({ ok: true, pendingLawyers: pendingLawyers.count });
}
