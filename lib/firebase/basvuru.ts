import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { BasvuruDurumuDoc, BasvuruDurumu } from './types';

export async function getBasvuruDurumu(uid: string): Promise<BasvuruDurumuDoc | null> {
  const snap = await getDoc(doc(db, 'basvuru_durumlari', uid));
  if (!snap.exists()) return null;
  return snap.data() as BasvuruDurumuDoc;
}

export async function updateBasvuruDurumu(
  uid: string,
  durum: BasvuruDurumu,
  adminNotu?: string,
  adminGizliNot?: string,
  adminUid?: string
): Promise<void> {
  await setDoc(
    doc(db, 'basvuru_durumlari', uid),
    {
      kullaniciId: uid,
      durum,
      adminNotu: adminNotu ?? null,
      adminGizliNot: adminGizliNot ?? null,
      guncellenmeTarihi: serverTimestamp(),
      guncelleyenAdmin: adminUid ?? null,
    },
    { merge: true }
  );
}
