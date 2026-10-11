import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const [rows] = await db().query(
    `SELECT l.*, c.name AS category_name,
       (SELECT COUNT(*) FROM appointments a WHERE a.lawyer_id = l.id AND a.status IN ('confirmed','completed')) AS accepted_count,
       (SELECT COUNT(*) FROM appointments a WHERE a.lawyer_id = l.id AND a.status = 'cancelled' AND a.cancelled_by = 'lawyer') AS rejected_count,
       (SELECT COUNT(*) FROM appointments a WHERE a.lawyer_id = l.id AND a.status = 'pending') AS pending_count,
       (SELECT COUNT(*) FROM appointments a WHERE a.lawyer_id = l.id) AS total_count
     FROM lawyers l
     LEFT JOIN legal_categories c ON c.id = l.category_id
     ORDER BY l.created_at DESC`
  );
  return Response.json({ ok: true, lawyers: rows });
}

export async function POST(req) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const b = await req.json();
  if (!b.name || !b.expertise) {
    return Response.json({ ok: false, message: 'Name and expertise are required.' }, { status: 400 });
  }

  const [result] = await db().execute(
    `INSERT INTO lawyers
      (name, expertise, category_id, experience_years, address, district, consultation_fee, bar_council_id, bio, is_verified, rating)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      b.name,
      b.expertise,
      b.category_id || null,
      b.experience_years || 0,
      b.address || null,
      b.district || null,
      b.consultation_fee || 0,
      b.bar_council_id || null,
      b.bio || null,
      b.is_verified ? 1 : 0,
      b.rating || 4.5,
    ]
  );

  return Response.json({ ok: true, id: result.insertId });
}
