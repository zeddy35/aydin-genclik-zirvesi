import {
  doc,
  getDoc,
  getDocs,
  collection,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Kullanici, BasvuruDurumuDoc, BasvuruDurumu } from './types';

export interface ProjeWithKullanici {
  uid: string;
  etkinlikTuru: 'hackathon' | 'gamejam';
  gonderiTarihi: Timestamp | null;
  // hackathon
  projeAdi?: string;
  aciklama?: string;
  githubUrl?: string | null;
  canlıUrl?: string | null;
  // gamejam
  oyunAdi?: string;
  itchUrl?: string;
  // kullanici
  isim: string;
  soyisim: string;
  eposta: string;
}

export async function getAllProjelerWithKullanici(): Promise<ProjeWithKullanici[]> {
  const [projelerSnap, kullanicilarSnap] = await Promise.all([
    getDocs(collection(db, 'projeler')),
    getDocs(collection(db, 'users')),
  ]);

  const kullaniciMap: Record<string, Kullanici> = {};
  kullanicilarSnap.docs.forEach(d => {
    kullaniciMap[d.id] = d.data() as Kullanici;
  });

  return projelerSnap.docs.map(d => {
    const proje = d.data() as Record<string, unknown>;
    const k = kullaniciMap[d.id];
    return {
      uid: d.id,
      etkinlikTuru: proje.etkinlikTuru as 'hackathon' | 'gamejam',
      gonderiTarihi: (proje.gonderiTarihi as Timestamp) ?? null,
      projeAdi: proje.projeAdi as string | undefined,
      aciklama: proje.aciklama as string | undefined,
      githubUrl: proje.githubUrl as string | null | undefined,
      canlıUrl: proje.canlıUrl as string | null | undefined,
      oyunAdi: proje.oyunAdi as string | undefined,
      itchUrl: proje.itchUrl as string | undefined,
      isim: k?.isim ?? '—',
      soyisim: k?.soyisim ?? '',
      eposta: k?.eposta ?? '—',
    };
  });
}

export interface KullaniciWithDurum extends Kullanici {
  basvuruDurumu: BasvuruDurumu | null;
}

export interface AdminStats {
  toplamKullanici: number;
  toplamKisiSayisi: number;
  hackathonKullanici: number;
  gamejamKullanici: number;
  durumDagilimi: Record<string, number>;
  sonKayitlar: Pick<Kullanici, 'uid' | 'isim' | 'soyisim' | 'etkinlikTuru' | 'katilimTuru' | 'takimUyeleri'>[];
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
  let toplamKisiSayisi = 0;
  const durumDagilimi: Record<string, number> = {};
  const sonKayitlar: AdminStats['sonKayitlar'] = [];

  kullanicilarSnap.docs.forEach(d => {
    const k = d.data() as Kullanici;
    if (k.etkinlikTuru === 'hackathon') hackathonKullanici++;
    else if (k.etkinlikTuru === 'gamejam') gamejamKullanici++;
    toplamKisiSayisi += k.katilimTuru === 'takim' ? 1 + (k.takimUyeleri?.length ?? 0) : 1;
    if (sonKayitlar.length < 5) {
      sonKayitlar.push({ uid: k.uid, isim: k.isim, soyisim: k.soyisim, etkinlikTuru: k.etkinlikTuru, katilimTuru: k.katilimTuru, takimUyeleri: k.takimUyeleri });
    }
  });

  durumlarSnap.docs.forEach(d => {
    const durum = (d.data() as BasvuruDurumuDoc).durum;
    durumDagilimi[durum] = (durumDagilimi[durum] ?? 0) + 1;
  });

  return {
    toplamKullanici: kullanicilarSnap.size,
    toplamKisiSayisi,
    hackathonKullanici,
    gamejamKullanici,
    durumDagilimi,
    sonKayitlar,
  };
}
