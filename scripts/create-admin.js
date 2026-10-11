/**
 * Creates (or updates the password of) an admin account.
 * This is the ONLY way an admin account can be created — there is no
 * public sign-up route for admins, so only whoever has server/CLI
 * access can ever create one.
 *
 * Usage:
 *   npm run create-admin -- myadminname MyStrongPassword123
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const readline = require('readline');

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer); }));
}

async function main() {
  let [, , username, password] = process.argv;

  if (!username) username = await ask('Admin username: ');
  if (!password) password = await ask('Admin password: ');

  if (!username || !password || password.length < 6) {
    console.error('Username is required and password must be at least 6 characters.');
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'legalthreadbd',
  });

  const hash = await bcrypt.hash(password, 10);

  const [existing] = await conn.execute('SELECT id FROM admins WHERE username = ?', [username]);
  if (existing.length) {
    await conn.execute('UPDATE admins SET password_hash = ? WHERE username = ?', [hash, username]);
    console.log(`Password updated for existing admin "${username}".`);
  } else {
    await conn.execute('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [username, hash]);
    console.log(`Admin account "${username}" created successfully.`);
  }

  await conn.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to create admin:', err.message);
  process.exit(1);
});
