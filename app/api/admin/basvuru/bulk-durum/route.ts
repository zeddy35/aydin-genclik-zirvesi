import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { sendApplicationStatusEmail } from '@/lib/email';
import { z } from 'zod';

const bodySchema = z.object({
  uids:  z.array(z.string().min(1)).min(1).max(100),
  durum: z.enum(['beklemede', 'inceleniyor', 'onaylandi', 'reddedildi', 'bekleme_listesi']),
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

  const { uids, durum, adminNotu } = parsed.data;

  // Batch write — Firestore max 500 ops per batch
  const chunks: string[][] = [];
  for (let i = 0; i < uids.length; i += 490) chunks.push(uids.slice(i, i + 490));

  for (const chunk of chunks) {
    const batch = adminDb.batch();
    chunk.forEach((uid) => {
      batch.set(
        adminDb.collection('basvuru_durumlari').doc(uid),
        {
          kullaniciId:       uid,
          durum,
          adminNotu:         adminNotu ?? null,
          guncellenmeTarihi: FieldValue.serverTimestamp(),
          guncelleyenAdmin:  adminUid,
        },
        { merge: true },
      );
    });
    await batch.commit();
  }

  // Send emails for final decisions (fire-and-forget, non-blocking)
  if (durum === 'onaylandi' || durum === 'reddedildi' || durum === 'bekleme_listesi') {
    void (async () => {
      for (const uid of uids) {
        try {
          const userSnap = await adminDb.collection('users').doc(uid).get();
          if (userSnap.exists) {
            const u = userSnap.data() as { eposta: string; isim: string };
            await sendApplicationStatusEmail(u.eposta, u.isim, durum, adminNotu);
          }
        } catch { /* ignore per-user failures */ }
      }
    })();
  }

  return NextResponse.json({ ok: true, updated: uids.length });
}
