import { getAdminSession } from '@/lib/session';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ admin: null });
  return Response.json({ admin: { id: session.id, username: session.name } });
}
