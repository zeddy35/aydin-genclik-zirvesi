import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { sendKapasiteDoluEmail } from '@/lib/email';
import { z } from 'zod';

const bodySchema = z.object({
  uids:      z.array(z.string().min(1)).min(1).max(100),
  adminNotu: z.string().optional(),
});

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const decoded   = await adminAuth.verifyIdToken(header.slice(7));
    const adminSnap = await adminDb.collection('admins').doc(decoded.uid).get();
    return adminSnap.exists ? decoded.uid : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) return NextResponse.json({ code: 'unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ code: 'invalid_request' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: 'validation_error' }, { status: 422 });
  }

  const { uids, adminNotu } = parsed.data;

  let sent = 0;
  let failed = 0;

  for (const uid of uids) {
    try {
      const userSnap = await adminDb.collection('users').doc(uid).get();
      if (userSnap.exists) {
        const u = userSnap.data() as { eposta: string; isim: string };
        await sendKapasiteDoluEmail(u.eposta, u.isim, adminNotu);
        sent++;
      }
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed });
}
