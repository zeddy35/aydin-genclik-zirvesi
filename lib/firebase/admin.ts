import {
  doc,
  getDoc,
  getDocs,
  collection,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Kullanici, BasvuruDurumuDoc, BasvuruDurumu } from './types';

export interface KullaniciWithDurum extends Kullanici {
  basvuruDurumu: BasvuruDurumu | null;
}

export interface AdminStats {
  toplamKullanici: number;
  hackathonKullanici: number;
  gamejamKullanici: number;
  durumDagilimi: Record<string, number>;
  sonKayitlar: Pick<Kullanici, 'uid' | 'isim' | 'soyisim' | 'etkinlikTuru'>[];
}

export async function getAllKullanicilarWithDurum(): Promise<KullaniciWithDurum[]> {
  const [kullanicilarSnap, durumlarSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'basvuru_durumlari')),
  ]);

  const durumMap: Record<string, BasvuruDurumuDoc> = {};
  durumlarSnap.docs.forEach(d => {
    durumMap[d.id] = d.data() as BasvuruDurumuDoc;
  });

  return kullanicilarSnap.docs.map(d => {
    const k = d.data() as Kullanici;
    const durum = durumMap[d.id]?.durum ?? null;
    return { ...k, basvuruDurumu: durum } as KullaniciWithDurum;
  });
}

export async function bulkUpdateDurum(
  uids: string[],
  durum: BasvuruDurumu,
  adminUid: string
): Promise<void> {
  const batch = writeBatch(db);
  uids.forEach(uid => {
    batch.set(
      doc(db, 'basvuru_durumlari', uid),
      {
        kullaniciId: uid,
        durum,
        guncellenmeTarihi: serverTimestamp(),
        guncelleyenAdmin: adminUid,
      },
      { merge: true }
    );
  });
  await batch.commit();
}

export async function isAdminUser(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}

export async function getAdminStats(): Promise<AdminStats> {
  const [kullanicilarSnap, durumlarSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'basvuru_durumlari')),
  ]);

  let hackathonKullanici = 0;
  let gamejamKullanici = 0;
  const durumDagilimi: Record<string, number> = {};
  const sonKayitlar: AdminStats['sonKayitlar'] = [];

  kullanicilarSnap.docs.forEach(d => {
    const k = d.data() as Kullanici;
    if (k.etkinlikTuru === 'hackathon') hackathonKullanici++;
    else if (k.etkinlikTuru === 'gamejam') gamejamKullanici++;
    if (sonKayitlar.length < 5) {
      sonKayitlar.push({ uid: k.uid, isim: k.isim, soyisim: k.soyisim, etkinlikTuru: k.etkinlikTuru });
    }
  });

  durumlarSnap.docs.forEach(d => {
    const durum = (d.data() as BasvuruDurumuDoc).durum;
    durumDagilimi[durum] = (durumDagilimi[durum] ?? 0) + 1;
  });

  return {
    toplamKullanici: kullanicilarSnap.size,
    hackathonKullanici,
    gamejamKullanici,
    durumDagilimi,
    sonKayitlar,
  };
}
