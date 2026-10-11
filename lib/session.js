import { cookies } from 'next/headers';
import { signToken, verifyToken } from './auth';

const USER_COOKIE = 'lt_session';
const ADMIN_COOKIE = 'lt_admin_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ---------- Public site user session ----------

export async function createUserSession(user) {
  const token = await signToken({ id: user.id, name: user.name, email: user.email, role: user.role || 'client' });
  const store = await cookies();
  store.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function getUserSession() {
  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || (payload.role !== 'client' && payload.role !== 'lawyer')) return null;
  return payload;
}

export async function clearUserSession() {
  const store = await cookies();
  store.delete(USER_COOKIE);
}

// ---------- Admin session (completely separate) ----------

export async function createAdminSession(admin) {
  const token = await signToken({ id: admin.id, name: admin.username, role: 'admin' });
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export const COOKIE_NAMES = { USER_COOKIE, ADMIN_COOKIE };

// Alias used by some admin routes.
export const getCurrentAdmin = getAdminSession;
