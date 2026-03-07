import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import type { Kullanici } from './types';

export async function getKullanici(uid: string): Promise<Kullanici | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as Kullanici;
}

export async function getAllKullanicilar(): Promise<Kullanici[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => d.data() as Kullanici);
}

export async function getKullanicilarByEtkinlik(etkinlikTuru: 'hackathon' | 'gamejam'): Promise<Kullanici[]> {
  const all = await getAllKullanicilar();
  return all.filter(k => k.etkinlikTuru === etkinlikTuru);
}

export async function getRecentKullanicilar(count: number = 5): Promise<Kullanici[]> {
  const snap = await getDocs(
    query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(count))
  );
  return snap.docs.map(d => d.data() as Kullanici);
}
