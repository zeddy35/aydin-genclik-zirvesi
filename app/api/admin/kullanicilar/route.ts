import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(header.slice(7));
    const adminSnap = await adminDb.collection('admins').doc(decoded.uid).get();
    return adminSnap.exists ? decoded.uid : null;
  } catch {
    return null;
  }
}

// GET /api/admin/kullanicilar
// Returns all users + their basvuru_durumlari merged.
// Paginated: ?limit=100&startAfter=<uid>
export async function GET(request: NextRequest) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const limit      = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200);
  const startAfter = searchParams.get('startAfter') ?? null;

  // Fetch users (paginated)
  let usersQuery = adminDb.collection('users').orderBy('createdAt', 'desc').limit(limit);
  if (startAfter) {
    const cursorSnap = await adminDb.collection('users').doc(startAfter).get();
    if (cursorSnap.exists) usersQuery = usersQuery.startAfter(cursorSnap);
  }

  const [usersSnap, durumlarSnap] = await Promise.all([
    usersQuery.get(),
    adminDb.collection('basvuru_durumlari').get(),
  ]);

  const durumMap: Record<string, string> = {};
  durumlarSnap.docs.forEach((d) => {
    durumMap[d.id] = (d.data() as { durum: string }).durum;
  });

  const users = usersSnap.docs.map((d) => ({
    ...d.data(),
    basvuruDurumu: durumMap[d.id] ?? 'beklemede',
  }));

  return NextResponse.json({
    users,
    hasMore: usersSnap.docs.length === limit,
    lastUid: usersSnap.docs.at(-1)?.id ?? null,
  });
}
