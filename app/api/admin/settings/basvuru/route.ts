import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;
    if (!sessionCookie) return false;
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const adminSnap = await adminDb.collection('admins').doc(decoded.uid).get();
    return adminSnap.exists;
  } catch {
    return false;
  }
}

export async function GET() {
  const snap = await adminDb.collection('settings').doc('basvuru').get();
  return NextResponse.json({ acik: snap.data()?.acik === true });
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { acik } = await req.json();
  await adminDb.collection('settings').doc('basvuru').set({ acik: Boolean(acik) }, { merge: true });
  return NextResponse.json({ acik: Boolean(acik) });
}
