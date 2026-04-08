import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

const SESSION_DAYS = 5;
const SESSION_MS   = SESSION_DAYS * 24 * 60 * 60 * 1000;

// POST — exchange ID token for httpOnly session cookie
export async function POST(request: NextRequest) {
  let idToken: string | undefined;
  try {
    const body = await request.json();
    idToken = body?.idToken;
  } catch {
    return NextResponse.json({ code: 'invalid_request' }, { status: 400 });
  }

  if (!idToken) return NextResponse.json({ code: 'missing_token' }, { status: 400 });

  try {
    // Basic verification — createSessionCookie enforces freshness (< 5 min) internally
    await adminAuth.verifyIdToken(idToken);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   SESSION_MS / 1000,
      path:     '/',
    });
    return response;
  } catch (err: unknown) {
    console.error('[session] error:', (err as { code?: string; message?: string })?.code, (err as { message?: string })?.message);
    return NextResponse.json({ code: 'invalid_token' }, { status: 401 });
  }
}

// DELETE — clear session cookie on sign-out
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('__session', '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   0,
    path:     '/',
  });
  return response;
}
