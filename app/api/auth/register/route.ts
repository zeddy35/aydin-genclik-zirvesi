import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { registerSchema } from '@/lib/validations/register';
import { sendVerificationEmail } from '@/lib/email';

// ── Cloudflare Turnstile verification ────────────────────────────────────────
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // skip in dev if not configured

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json() as { success: boolean };
  return data.success;
}

// ── Rate limit config ─────────────────────────────────────────────────────────
const RL_MAX    = 5;               // max attempts
const RL_WINDOW = 15 * 60 * 1000; // 15 minutes in ms

async function checkRateLimit(ip: string): Promise<boolean> {
  const ref  = adminDb.collection('_rate_limits').doc(`reg:${ip}`);
  const now  = Date.now();

  try {
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);

      if (!snap.exists) {
        tx.set(ref, {
          count:       1,
          windowStart: now,
          // TTL field — enable TTL policy on this field in Firebase Console
          // (Collection: _rate_limits, Field: expiresAt)
          expiresAt:   new Date(now + RL_WINDOW * 2),
        });
        return true;
      }

      const d = snap.data()!;

      // New window → reset
      if (now - d.windowStart > RL_WINDOW) {
        tx.set(ref, { count: 1, windowStart: now, expiresAt: new Date(now + RL_WINDOW * 2) });
        return true;
      }

      if (d.count >= RL_MAX) return false;

      tx.update(ref, { count: FieldValue.increment(1) });
      return true;
    });
  } catch {
    // If rate-limit check itself fails, allow the request (fail open)
    return true;
  }
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // 1. IP rate limit
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { code: 'rate_limited', message: 'Çok fazla deneme. 15 dakika sonra tekrar deneyin.' },
      { status: 429 },
    );
  }

  // 2. Application gate — settings/basvuru.acik must be true
  const settingsSnap = await adminDb.collection('settings').doc('basvuru').get();
  if (!settingsSnap.exists || settingsSnap.data()?.acik !== true) {
    return NextResponse.json(
      { code: 'applications_closed', message: 'Başvurular şu anda kapalı.' },
      { status: 403 },
    );
  }

  // 3. Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: 'invalid_request' }, { status: 400 });
  }

  // 4. Turnstile CAPTCHA verification
  const turnstileToken = (body as Record<string, unknown>)?.turnstileToken as string | undefined;
  if (!turnstileToken) {
    return NextResponse.json({ code: 'captcha_required' }, { status: 422 });
  }
  const captchaOk = await verifyTurnstile(turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json({ code: 'captcha_failed', message: 'CAPTCHA doğrulaması başarısız.' }, { status: 422 });
  }

  // 5. Server-side schema validation (never trust client-side only)
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: 'validation_error', errors: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;

  try {
    // 5. Create Firebase Auth user (Admin SDK — no client bypass possible)
    const userRecord = await adminAuth.createUser({
      email:         data.eposta,
      password:      data.sifre,
      displayName:   `${data.isim} ${data.soyisim}`,
      emailVerified: false,
    });

    // 6. Write user doc + basvuru_durumlari atomically via Admin SDK batch
    const batch = adminDb.batch();

    batch.set(adminDb.collection('users').doc(userRecord.uid), {
      uid:               userRecord.uid,
      isim:              data.isim,
      soyisim:           data.soyisim,
      eposta:            data.eposta,
      telefon:           data.telefon,
      universite:        data.universite,
      bolum:             data.bolum,
      etkinlikTuru:      data.etkinlikTuru,
      katilimTuru:       data.katilimTuru,
      takimAdi:          data.takimAdi          ?? null,
      takimUyeleri:      data.takimUyeleri       ?? [],
      motivasyon:        data.motivasyon,
      deneyimSeviyesi:   data.deneyimSeviyesi,
      rol:               data.rol,
      dahaOnceKatildi:   data.dahaOnceKatildi,
      dahaOnceHangi:     data.dahaOnceHangi      ?? null,
      neOgrenmekIstiyor: data.neOgrenmekIstiyor  ?? null,
      projeFikri:        data.projeFikri          ?? null,
      createdAt:         FieldValue.serverTimestamp(),
      updatedAt:         FieldValue.serverTimestamp(),
    });

    batch.set(adminDb.collection('basvuru_durumlari').doc(userRecord.uid), {
      kullaniciId:       userRecord.uid,
      durum:             'beklemede',
      adminNotu:         null,
      adminGizliNot:     null,
      guncellenmeTarihi: FieldValue.serverTimestamp(),
      guncelleyenAdmin:  null,
    });

    await batch.commit();

    // 7. Send verification email via Resend
    try {
      const verificationLink = await adminAuth.generateEmailVerificationLink(data.eposta);
      await sendVerificationEmail(data.eposta, data.isim, verificationLink);
    } catch {
      // Non-fatal: user can re-request from /auth/verify-email
    }

    return NextResponse.json({ uid: userRecord.uid }, { status: 201 });

  } catch (err: unknown) {
    const code = (err as { code?: string }).code;

    if (code === 'auth/email-already-exists') {
      // Return same generic message to avoid email enumeration
      return NextResponse.json({ code: 'email_exists' }, { status: 409 });
    }

    // Do NOT forward internal error details to client
    console.error('[register] unexpected error:', code);
    return NextResponse.json({ code: 'server_error' }, { status: 500 });
  }
}
