import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { getUserSession, getAdminSession } from '@/lib/session';
import {
  toPositiveInt,
  isOneOf,
  isValidDateString,
  isValidTimeString,
  clampString,
  isNonEmptyString,
  isValidEmail,
} from '@/lib/validate';

const BOOKING_FEES = { online: 300, offline: 500 };
const PLATFORM_CHARGE = 50;
const PAYMENT_METHODS = ['visa', 'bank', 'bkash', 'nagad', 'rocket'];
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'payments');
const ALLOWED_IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_SCREENSHOT_BYTES = 4 * 1024 * 1024; // 4MB

export async function GET() {
  // Admin: return every appointment, with client + lawyer details.
  // LEFT JOIN users because a booking may belong to a guest (no account).
  const admin = await getAdminSession();
  if (admin) {
    const [rows] = await db().query(
      `SELECT a.*, l.name AS lawyer_name, l.expertise, l.consultation_fee,
              COALESCE(u.name, a.guest_name) AS client_name,
              COALESCE(u.email, a.guest_email) AS client_email,
              COALESCE(u.phone, a.guest_phone) AS client_phone,
              (a.user_id IS NULL) AS is_guest
       FROM appointments a
       JOIN lawyers l ON l.id = a.lawyer_id
       LEFT JOIN users u ON u.id = a.user_id
       ORDER BY a.appointment_date DESC, a.created_at DESC`
    );
    return Response.json({ ok: true, appointments: rows });
  }

  // Client: return only their own appointments (guests have no account to
  // list appointments under — they rely on the confirmation shown right
  // after booking, and its downloadable PDF).
  const session = await getUserSession();
  if (!session) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const [rows] = await db().query(
    `SELECT a.*, l.name AS lawyer_name, l.expertise, l.consultation_fee
     FROM appointments a JOIN lawyers l ON l.id = a.lawyer_id
     WHERE a.user_id = ? ORDER BY a.appointment_date DESC, a.created_at DESC`,
    [session.id]
  );

  return Response.json({ ok: true, appointments: rows });
}

export async function POST(req) {
  // Booking no longer requires an account — a logged-in session is used
  // when present, otherwise the person's name/phone/email are collected
  // directly on the booking form and stored as a guest booking.
  const session = await getUserSession();

  // Payment is real and off-platform: the client sends money themselves to
  // the account shown (set in Admin → Settings), then submits a
  // transaction ID and/or a screenshot as proof — so this is multipart
  // form data rather than plain JSON, to allow the optional file.
  const formData = await req.formData();
  const body = Object.fromEntries(formData.entries());
  const screenshotFile = formData.get('payment_screenshot');

  const lawyerId = toPositiveInt(body.lawyer_id);
  const mode = body.mode === 'offline' ? 'offline' : 'online';

  if (!lawyerId) {
    return Response.json({ ok: false, message: 'A valid lawyer must be selected.' }, { status: 400 });
  }
  if (!isValidDateString(body.appointment_date)) {
    return Response.json({ ok: false, message: 'A valid appointment date is required.' }, { status: 400 });
  }
  if (!isValidTimeString(body.appointment_time)) {
    return Response.json({ ok: false, message: 'A valid appointment time is required.' }, { status: 400 });
  }
  if (!isOneOf(body.payment_method, PAYMENT_METHODS)) {
    return Response.json({ ok: false, message: 'Please choose a valid payment method.' }, { status: 400 });
  }
  if (!isNonEmptyString(body.payment_transaction_id, 100)) {
    return Response.json(
      { ok: false, message: 'Please enter the transaction ID from your payment.' },
      { status: 400 }
    );
  }

  let guestName = null;
  let guestPhone = null;
  let guestEmail = null;

  if (!session) {
    if (!isNonEmptyString(body.guest_name, 150) || !isNonEmptyString(body.guest_phone, 30)) {
      return Response.json(
        { ok: false, message: 'Please provide your name and phone number to book.' },
        { status: 400 }
      );
    }
    if (body.guest_email && !isValidEmail(body.guest_email)) {
      return Response.json({ ok: false, message: 'Please provide a valid email, or leave it blank.' }, { status: 400 });
    }
    guestName = clampString(body.guest_name, 150);
    guestPhone = clampString(body.guest_phone, 30);
    guestEmail = body.guest_email ? clampString(body.guest_email, 190) : null;
  }

  const conn = db();

  // Only allow booking a lawyer who actually exists and is admin-approved —
  // stops someone bypassing the UI and hitting the API directly to book an
  // unverified/pending lawyer profile.
  const [[lawyer]] = await conn.query('SELECT id FROM lawyers WHERE id = ? AND is_verified = 1', [lawyerId]);
  if (!lawyer) {
    return Response.json({ ok: false, message: 'This lawyer is not available for booking.' }, { status: 404 });
  }

  // Optional payment screenshot upload.
  let screenshotUrl = null;
  if (screenshotFile && typeof screenshotFile !== 'string' && screenshotFile.size > 0) {
    const ext = ALLOWED_IMAGE_TYPES[screenshotFile.type];
    if (!ext) {
      return Response.json({ ok: false, message: 'Payment screenshot must be a JPG, PNG or WEBP image.' }, { status: 400 });
    }
    if (screenshotFile.size > MAX_SCREENSHOT_BYTES) {
      return Response.json({ ok: false, message: 'Payment screenshot must be smaller than 4MB.' }, { status: 400 });
    }
    await mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `payment-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
    const buffer = Buffer.from(await screenshotFile.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
    screenshotUrl = `/uploads/payments/${filename}`;
  }

  // The booking fee + platform charge is fixed and computed server-side
  // from the consultation mode — never trust a client-supplied amount here.
  const paymentAmount = BOOKING_FEES[mode] + PLATFORM_CHARGE;
  const notes = clampString(body.notes, 1000);

  const [result] = await conn.execute(
    `INSERT INTO appointments
      (user_id, lawyer_id, guest_name, guest_phone, guest_email, mode, appointment_date, appointment_time, notes,
       payment_status, payment_method, payment_amount, payment_transaction_id, payment_screenshot_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?, ?, ?)`,
    [
      session ? session.id : null,
      lawyerId,
      guestName,
      guestPhone,
      guestEmail,
      mode,
      body.appointment_date,
      body.appointment_time,
      notes,
      body.payment_method,
      paymentAmount,
      clampString(body.payment_transaction_id, 100),
      screenshotUrl,
    ]
  );

  return Response.json({
    ok: true,
    id: result.insertId,
    payment_amount: paymentAmount,
    message: 'Your appointment request has been submitted. We will confirm your payment shortly.',
  });
}
