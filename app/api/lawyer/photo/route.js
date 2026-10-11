import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { getUserSession } from '@/lib/session';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'lawyers');
const ALLOWED_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
const COOLDOWN_DAYS = 90; // ~3 months between photo changes

// Rule: the very first photo a lawyer adds is free. After that, once they
// CHANGE (replace or remove) their photo, they must wait 3 months before
// changing it again. `photo_updated_at` records the last change and is what
// this check runs against. Deleting counts as a change too, otherwise
// "delete then re-upload" would be a loophole around the cooldown.
function cooldownInfo(photoUpdatedAt) {
  if (!photoUpdatedAt) return { locked: false };
  const unlockAt = new Date(new Date(photoUpdatedAt).getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  const locked = unlockAt.getTime() > Date.now();
  return { locked, unlockAt };
}

function cooldownMessage(unlockAt) {
  return `You can change your profile photo again on ${unlockAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} (photos can be changed once every 3 months).`;
}

async function requireLawyer() {
  const session = await getUserSession();
  if (!session || session.role !== 'lawyer') return null;
  return session;
}

async function deleteExistingPhoto(photoUrl) {
  if (!photoUrl || !photoUrl.startsWith('/uploads/lawyers/')) return;
  try {
    await unlink(path.join(process.cwd(), 'public', photoUrl));
  } catch {
    // File may already be gone — that's fine, nothing to clean up.
  }
}

export async function POST(req) {
  const session = await requireLawyer();
  if (!session) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('photo');

  if (!file || typeof file === 'string') {
    return Response.json({ ok: false, message: 'No photo was uploaded.' }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return Response.json(
      { ok: false, message: 'Only JPG, PNG or WEBP images are allowed.' },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return Response.json({ ok: false, message: 'Photo must be smaller than 3MB.' }, { status: 400 });
  }

  const conn = db();
  const [[lawyerRow]] = await conn.query('SELECT id, photo_url, photo_updated_at FROM lawyers WHERE user_id = ?', [session.id]);
  if (!lawyerRow) {
    return Response.json({ ok: false, message: 'Lawyer profile not found.' }, { status: 404 });
  }

  const cd = cooldownInfo(lawyerRow.photo_updated_at);
  if (cd.locked) {
    return Response.json({ ok: false, message: cooldownMessage(cd.unlockAt) }, { status: 403 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `lawyer-${lawyerRow.id}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  const publicUrl = `/uploads/lawyers/${filename}`;

  // Clean up the old photo file (if any) now that the new one is saved.
  await deleteExistingPhoto(lawyerRow.photo_url);

  // The very first upload (no photo ever set) doesn't start the cooldown;
  // replacing an existing photo does.
  const isFirstEver = !lawyerRow.photo_url && !lawyerRow.photo_updated_at;
  if (isFirstEver) {
    await conn.execute('UPDATE lawyers SET photo_url = ? WHERE id = ?', [publicUrl, lawyerRow.id]);
    return Response.json({ ok: true, photo_url: publicUrl, photo_updated_at: null });
  }

  await conn.execute('UPDATE lawyers SET photo_url = ?, photo_updated_at = NOW() WHERE id = ?', [publicUrl, lawyerRow.id]);
  const [[fresh]] = await conn.query('SELECT photo_updated_at FROM lawyers WHERE id = ?', [lawyerRow.id]);
  return Response.json({ ok: true, photo_url: publicUrl, photo_updated_at: fresh.photo_updated_at });
}

export async function DELETE() {
  const session = await requireLawyer();
  if (!session) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const conn = db();
  const [[lawyerRow]] = await conn.query('SELECT id, photo_url, photo_updated_at FROM lawyers WHERE user_id = ?', [session.id]);
  if (!lawyerRow) {
    return Response.json({ ok: false, message: 'Lawyer profile not found.' }, { status: 404 });
  }

  const cd = cooldownInfo(lawyerRow.photo_updated_at);
  if (cd.locked) {
    return Response.json({ ok: false, message: cooldownMessage(cd.unlockAt) }, { status: 403 });
  }

  await deleteExistingPhoto(lawyerRow.photo_url);
  await conn.execute('UPDATE lawyers SET photo_url = NULL, photo_updated_at = NOW() WHERE id = ?', [lawyerRow.id]);
  const [[fresh]] = await conn.query('SELECT photo_updated_at FROM lawyers WHERE id = ?', [lawyerRow.id]);

  return Response.json({ ok: true, photo_updated_at: fresh.photo_updated_at });
}
