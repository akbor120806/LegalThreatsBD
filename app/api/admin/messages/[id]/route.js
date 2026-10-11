import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/session';
import { toPositiveInt, isOneOf } from '@/lib/validate';

export async function PUT(req, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const numericId = toPositiveInt(id);
  if (!numericId) {
    return NextResponse.json({ error: 'Invalid message id.' }, { status: 400 });
  }
  const { status } = await req.json();
  if (!isOneOf(status, ['new', 'contacted', 'closed'])) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }
  await query('UPDATE contact_requests SET status = ? WHERE id = ?', [status, numericId]);
  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const numericId = toPositiveInt(id);
  if (!numericId) {
    return NextResponse.json({ error: 'Invalid message id.' }, { status: 400 });
  }
  await query('DELETE FROM contact_requests WHERE id = ?', [numericId]);
  return NextResponse.json({ success: true });
}
