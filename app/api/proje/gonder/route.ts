import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

const hackSchema = z.object({
  type:      z.literal('hackathon'),
  projeAdi:  z.string().min(1).max(120),
  aciklama:  z.string().min(50).max(2000),
  githubUrl: z.string().url().optional().or(z.literal('')),
  canlıUrl:  z.string().url().optional().or(z.literal('')),
});

const jamSchema = z.object({
  type:     z.literal('gamejam'),
  oyunAdi:  z.string().min(1).max(120),
  aciklama: z.string().min(30).max(2000),
  itchUrl:  z.string().regex(/^https?:\/\/.+\.itch\.io\/.+/, 'Geçerli itch.io URL girin'),
});

const bodySchema = z.discriminatedUnion('type', [hackSchema, jamSchema]);

export async function POST(request: NextRequest) {
  // 1. Verify Firebase ID token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 });
  }
  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 });
  }

  // 2. Submission gate — settings/proje_gonderimi.acik must be true
  const settingsSnap = await adminDb.collection('settings').doc('proje_gonderimi').get();
  if (!settingsSnap.exists || settingsSnap.data()?.acik !== true) {
    return NextResponse.json(
      { code: 'submissions_closed', message: 'Proje gönderimi şu anda kapalı.' },
      { status: 403 },
    );
  }

  // 3. Parse & validate body
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ code: 'invalid_request' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: 'validation_error', errors: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;

  try {
    if (data.type === 'hackathon') {
      await adminDb.collection('projeler').doc(uid).set({
        kullaniciId:   uid,
        etkinlikTuru:  'hackathon',
        projeAdi:      data.projeAdi,
        aciklama:      data.aciklama,
        githubUrl:     data.githubUrl || null,
        canlıUrl:      data.canlıUrl  || null,
        gonderiTarihi: FieldValue.serverTimestamp(),
      });
    } else {
      await adminDb.collection('projeler').doc(uid).set({
        kullaniciId:   uid,
        etkinlikTuru:  'gamejam',
        oyunAdi:       data.oyunAdi,
        aciklama:      data.aciklama,
        itchUrl:       data.itchUrl,
        gonderiTarihi: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ code: 'server_error' }, { status: 500 });
  }
}
