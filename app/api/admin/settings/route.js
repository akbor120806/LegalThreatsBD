import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { clampString, isValidEmail } from '@/lib/validate';

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const [[settings]] = await db().query('SELECT * FROM site_settings WHERE id = 1');
  return Response.json({ ok: true, settings: settings || null });
}

export async function PUT(req) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const b = await req.json();

  if (b.email && !isValidEmail(b.email)) {
    return Response.json({ ok: false, message: 'Please enter a valid email address.' }, { status: 400 });
  }

  await db().execute(
    `INSERT INTO site_settings
      (id, phone, email, website, address, bkash_number, nagad_number, rocket_number, bank_name, bank_account_name, bank_account_number, bank_branch)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       phone = VALUES(phone), email = VALUES(email), website = VALUES(website), address = VALUES(address),
       bkash_number = VALUES(bkash_number), nagad_number = VALUES(nagad_number), rocket_number = VALUES(rocket_number),
       bank_name = VALUES(bank_name), bank_account_name = VALUES(bank_account_name),
       bank_account_number = VALUES(bank_account_number), bank_branch = VALUES(bank_branch)`,
    [
      clampString(b.phone, 30),
      clampString(b.email, 190),
      clampString(b.website, 255),
      clampString(b.address, 255),
      clampString(b.bkash_number, 30),
      clampString(b.nagad_number, 30),
      clampString(b.rocket_number, 30),
      clampString(b.bank_name, 150),
      clampString(b.bank_account_name, 150),
      clampString(b.bank_account_number, 60),
      clampString(b.bank_branch, 150),
    ]
  );

  return Response.json({ ok: true, message: 'Settings updated.' });
}
