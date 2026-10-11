import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { toPositiveInt, isValidDateString, clampString } from '@/lib/validate';

export async function GET(_req, { params }) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const lawyerId = toPositiveInt(id);
  if (!lawyerId) return Response.json({ ok: false, message: 'Invalid lawyer id.' }, { status: 400 });

  const [payouts] = await db().query(
    'SELECT * FROM lawyer_payouts WHERE lawyer_id = ? ORDER BY paid_on DESC, id DESC',
    [lawyerId]
  );
  const [[totals]] = await db().query(
    'SELECT COALESCE(SUM(amount), 0) AS total_paid FROM lawyer_payouts WHERE lawyer_id = ?',
    [lawyerId]
  );

  return Response.json({ ok: true, payouts, totalPaid: totals.total_paid });
}

export async function POST(req, { params }) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const lawyerId = toPositiveInt(id);
  if (!lawyerId) return Response.json({ ok: false, message: 'Invalid lawyer id.' }, { status: 400 });

  const b = await req.json();
  const amount = Number(b.amount);
  if (!(amount > 0)) {
    return Response.json({ ok: false, message: 'Enter a valid payout amount.' }, { status: 400 });
  }
  if (!isValidDateString(b.paid_on)) {
    return Response.json({ ok: false, message: 'Enter a valid payout date.' }, { status: 400 });
  }

  const [[lawyer]] = await db().query('SELECT id FROM lawyers WHERE id = ?', [lawyerId]);
  if (!lawyer) return Response.json({ ok: false, message: 'Lawyer not found.' }, { status: 404 });

  await db().execute(
    'INSERT INTO lawyer_payouts (lawyer_id, amount, paid_on, note) VALUES (?, ?, ?, ?)',
    [lawyerId, amount, b.paid_on, clampString(b.note, 255)]
  );

  return Response.json({ ok: true, message: 'Payout recorded.' });
}
