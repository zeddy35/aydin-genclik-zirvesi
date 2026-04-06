import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { generatePresignedUploadUrl } from '@/lib/r2';

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const adminDoc = await adminDb.collection('admins').doc(uid).get();
  if (!adminDoc.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { kullaniciId, belgeTuru, dosyaAdi, contentType } = body as {
    kullaniciId: string;
    belgeTuru: string;
    dosyaAdi: string;
    contentType: string;
  };

  if (!kullaniciId || !belgeTuru || !dosyaAdi || !contentType) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Limit: max 20 belgeler per user
  const existingSnap = await adminDb
    .collection('belgeler')
    .where('kullaniciId', '==', kullaniciId)
    .count()
    .get();
  if (existingSnap.data().count >= 20) {
    return NextResponse.json({ error: 'Belge limiti aşıldı (max 20).' }, { status: 422 });
  }

  // Allowed MIME types only
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(contentType)) {
    return NextResponse.json({ error: 'Desteklenmeyen dosya türü.' }, { status: 422 });
  }

  const safeFileName = dosyaAdi.replace(/[^a-zA-Z0-9._-]/g, '_');
  const r2Key = `admin_belgeler/${kullaniciId}/${belgeTuru}/${Date.now()}_${safeFileName}`;

  const uploadUrl = await generatePresignedUploadUrl(r2Key, contentType);

  return NextResponse.json({ uploadUrl, r2Key });
}
