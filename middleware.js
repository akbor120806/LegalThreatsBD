import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// A handful of standard security headers, applied to every response. These
// are cheap, well-established hardening (clickjacking, MIME sniffing, etc.)
// and complement the SQL-injection protection used throughout the API
// (parameterized queries + input validation in lib/validate.js) — headers
// alone don't stop SQL injection, they just close off some other common
// attack surfaces.
function applySecurityHeaders(res) {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return res;
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // ---- Admin panel: everything under /admin except /admin/login ----
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('lt_admin_session')?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  // ---- Client dashboard (clients only) ----
  if (pathname.startsWith('/dashboard')) {
    const token = req.cookies.get('lt_session')?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || (payload.role !== 'client' && payload.role !== 'lawyer')) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return applySecurityHeaders(NextResponse.redirect(url));
    }
    if (payload.role === 'lawyer') {
      const url = req.nextUrl.clone();
      url.pathname = '/lawyer-dashboard';
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  // ---- Lawyer dashboard (lawyers only) ----
  if (pathname.startsWith('/lawyer-dashboard')) {
    const token = req.cookies.get('lt_session')?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || (payload.role !== 'client' && payload.role !== 'lawyer')) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return applySecurityHeaders(NextResponse.redirect(url));
    }
    if (payload.role === 'client') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
};
