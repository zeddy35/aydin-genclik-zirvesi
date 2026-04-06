import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { sendApplicationStatusEmail } from '@/lib/email';
import { z } from 'zod';

const bodySchema = z.object({
  uid:           z.string().min(1),
  durum:         z.enum(['beklemede', 'inceleniyor', 'onaylandi', 'reddedildi', 'bekleme_listesi']),
  adminNotu:     z.string().optional(),
  adminGizliNot: z.string().optional(),
});

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const decoded  = await adminAuth.verifyIdToken(header.slice(7));
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

  const { uid, durum, adminNotu, adminGizliNot } = parsed.data;

  // Update Firestore via Admin SDK
  await adminDb.collection('basvuru_durumlari').doc(uid).set(
    {
      kullaniciId:       uid,
      durum,
      adminNotu:         adminNotu     ?? null,
      adminGizliNot:     adminGizliNot ?? null,
      guncellenmeTarihi: FieldValue.serverTimestamp(),
      guncelleyenAdmin:  adminUid,
    },
    { merge: true },
  );

  // Send status email for final decisions
  if (durum === 'onaylandi' || durum === 'reddedildi' || durum === 'bekleme_listesi') {
    try {
      const userSnap = await adminDb.collection('users').doc(uid).get();
      if (userSnap.exists) {
        const u = userSnap.data() as { eposta: string; isim: string };
        await sendApplicationStatusEmail(u.eposta, u.isim, durum, adminNotu);
      }
    } catch {
      // Non-fatal: status was saved, email failed silently
    }
  }

  return NextResponse.json({ ok: true });
}
