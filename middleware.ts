import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Route groups ──────────────────────────────────────────────────────────────
const USER_ROUTES  = ['/panel'];
const ADMIN_ROUTES = ['/admin'];
const AUTH_ROUTES  = ['/auth/login', '/auth/register'];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

// ── Brute-force guard for login API ──────────────────────────────────────────
// Simple in-process counter (resets on cold-start; first line of defence only).
// The real rate-limiting for /api/auth/register is Firestore-backed (route.ts).
const loginAttempts = new Map<string, { count: number; windowStart: number }>();
const LOGIN_RL_MAX    = 20;
const LOGIN_RL_WINDOW = 10 * 60 * 1000; // 10 min

function loginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now - entry.windowStart > LOGIN_RL_WINDOW) {
    loginAttempts.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= LOGIN_RL_MAX) return false;
  entry.count++;
  return true;
}

// ── Main middleware ───────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";

  // Subdomain routing: lore.* → /lore
  // Skip rewrite for static asset requests (files with extensions)
  if (hostname.startsWith("lore.") && !/\.[a-zA-Z0-9]+$/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/lore" + (pathname === "/" ? "" : pathname);
    return NextResponse.rewrite(url);
  }

  // 1. Rate-limit Firebase Auth sign-in calls that go through the app
  if (pathname === '/auth/login' && request.method === 'POST') {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';
    if (!loginRateLimit(ip)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // 2. Panel routes: require __session cookie (set by Firebase client SDK on sign-in)
  //    This is a fast, edge-level check; the panel layout also does a full auth check.
  if (matchesPrefix(pathname, USER_ROUTES)) {
    const session = request.cookies.get('__session');
    if (!session?.value) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Admin routes: same session-cookie check.
  //    Deep auth (isAdmin) is enforced by Firestore rules + admin layout.
  if (matchesPrefix(pathname, ADMIN_ROUTES) && pathname !== '/admin/login') {
    const session = request.cookies.get('__session');
    if (!session?.value) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. Redirect already-logged-in users away from auth pages
  if (matchesPrefix(pathname, AUTH_ROUTES)) {
    const session = request.cookies.get('__session');
    if (session?.value) {
      return NextResponse.redirect(new URL('/panel', request.url));
    }
  }

  // 5. Security headers on all responses
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://www.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com",
      "frame-src https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '),
  );
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
