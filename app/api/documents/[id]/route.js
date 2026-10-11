import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/session';
import { toPositiveInt } from '@/lib/validate';

export async function DELETE(req, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const numericId = toPositiveInt(id);
  if (!numericId) {
    return NextResponse.json({ error: 'Invalid document id.' }, { status: 400 });
  }
  await query('DELETE FROM legal_documents WHERE id = ?', [numericId]);
  return NextResponse.json({ success: true });
}
