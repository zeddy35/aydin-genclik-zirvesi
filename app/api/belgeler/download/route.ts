import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { generatePresignedDownloadUrl } from '@/lib/r2';

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let callerUid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    callerUid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const belgeId = req.nextUrl.searchParams.get('belgeId');
  if (!belgeId) return NextResponse.json({ error: 'Missing belgeId' }, { status: 400 });

  const belgeDoc = await adminDb.collection('belgeler').doc(belgeId).get();
  if (!belgeDoc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const belge = belgeDoc.data()!;

  // Allow if the doc belongs to the caller or caller is admin
  if (belge.kullaniciId !== callerUid) {
    const adminDoc = await adminDb.collection('admins').doc(callerUid).get();
    if (!adminDoc.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!belge.r2Key) return NextResponse.json({ error: 'No R2 key for this document' }, { status: 400 });

  const downloadUrl = await generatePresignedDownloadUrl(belge.r2Key, 3600);

  return NextResponse.json({ downloadUrl });
}
