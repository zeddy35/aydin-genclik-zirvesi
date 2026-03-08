import { Timestamp } from 'firebase/firestore';

export type EtkinlikTuru = 'hackathon' | 'gamejam';
export type KatilimTuru = 'bireysel' | 'takim';
export type BasvuruDurumu = 'beklemede' | 'inceleniyor' | 'onaylandi' | 'reddedildi' | 'bekleme_listesi';
export type BelgeTuru = 'ogrenci_belgesi' | 'nufus_fotokopisi' | 'cv' | 'katilim_sertifikasi' | 'diger';
export type AdminBelgeTuru = 'katilim_sertifikasi' | 'finalist_belgesi' | 'odul_belgesi' | 'diger';

export interface TakimUyesi {
  isim: string;
  soyisim: string;
  eposta: string;
  telefon: string;
  universite: string;
  bolum: string;
}

export interface Kullanici {
  uid: string;
  isim: string;
  soyisim: string;
  eposta: string;
  telefon: string;
  universite: string;
  bolum: string;
  etkinlikTuru: EtkinlikTuru;
  katilimTuru: KatilimTuru;
  takimAdi?: string;
  takimUyeleri?: TakimUyesi[];
  motivasyon: string;
  deneyimSeviyesi: 'yeni_basliyor' | 'orta' | 'ileri';
  rol: string[];
  dahaOnceKatildi: boolean;
  dahaOnceHangi?: string;
  neOgrenmekIstiyor?: string;
  projeFikri?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BasvuruDurumuDoc {
  kullaniciId: string;
  durum: BasvuruDurumu;
  adminNotu?: string;
  adminGizliNot?: string;
  guncellenmeTarihi: Timestamp;
  guncelleyenAdmin?: string;
}

export interface Belge {
  id: string;
  kullaniciId: string;
  belgeTuru: BelgeTuru | AdminBelgeTuru;
  dosyaUrl: string;
  dosyaAdi: string;
  dosyaBoyutu: number;
  r2Key?: string;
  yukleyenTip: 'kullanici' | 'admin';
  yuklenmeTarihi: Timestamp;
  durum: 'yuklendi' | 'inceleniyor' | 'onaylandi' | 'reddedildi';
}

export interface ProjeGonderi {
  kullaniciId: string;
  etkinlikTuru: EtkinlikTuru;
  projeDosyaUrl?: string;
  projeDosyaAdi?: string;
  itchioUrl?: string;
  projeAdi?: string;
  projeAciklamasi?: string;
  gonderimTarihi: Timestamp;
  guncellenmeTarihi: Timestamp;
}

export interface AdminKullanici {
  uid: string;
  isim: string;
  eposta: string;
  rol: 'super_admin' | 'moderator';
}
