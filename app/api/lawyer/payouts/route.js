import { db } from '@/lib/db';
import { getUserSession } from '@/lib/session';

export async function GET() {
  const session = await getUserSession();
  if (!session || session.role !== 'lawyer') {
    return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const conn = db();
  const [[lawyerRow]] = await conn.query('SELECT id FROM lawyers WHERE user_id = ?', [session.id]);
  if (!lawyerRow) return Response.json({ ok: false, message: 'Lawyer profile not found.' }, { status: 404 });

  const [payouts] = await conn.query(
    'SELECT * FROM lawyer_payouts WHERE lawyer_id = ? ORDER BY paid_on DESC, id DESC',
    [lawyerRow.id]
  );
  const [[totals]] = await conn.query(
    'SELECT COALESCE(SUM(amount), 0) AS total_paid FROM lawyer_payouts WHERE lawyer_id = ?',
    [lawyerRow.id]
  );

  return Response.json({ ok: true, payouts, totalPaid: totals.total_paid });
}
