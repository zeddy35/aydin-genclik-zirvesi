'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getBasvuruDurumu, updateBasvuruDurumu } from '@/lib/firebase/basvuru';
import { getKullaniciBelgeler, uploadAdminBelge } from '@/lib/firebase/belgeler';
import { useAuth } from '@/contexts/AuthContext';
import type { Kullanici, BasvuruDurumuDoc, Belge, BasvuruDurumu } from '@/lib/firebase/types';

const DURUM_COLORS: Record<string, string> = {
  beklemede: '#f59e0b', inceleniyor: '#3b82f6', onaylandi: '#10b981', reddedildi: '#ef4444', bekleme_listesi: '#8b5cf6',
};
const DURUM_SECIMLERI: { value: BasvuruDurumu; label: string }[] = [
  { value: 'beklemede', label: 'Beklemede' },
  { value: 'inceleniyor', label: 'İnceleniyor' },
  { value: 'onaylandi', label: 'Onaylandı' },
  { value: 'reddedildi', label: 'Reddedildi' },
  { value: 'bekleme_listesi', label: 'Bekleme Listesi' },
];
const BELGE_LABELS: Record<string, string> = {
  ogrenci_belgesi: 'Öğrenci Belgesi', nufus_fotokopisi: 'Kimlik', cv: 'CV', katilim_sertifikasi: 'Katılım Sertifikası',
  odul_belgesi: 'Ödül Belgesi', diger: 'Diğer',
};

export default function KullaniciDetailPage() {
  const { uid } = useParams() as { uid: string };
  const { user } = useAuth();
  const router = useRouter();
  const [aktifTab, setAktifTab] = useState<'genel' | 'belgeler' | 'durum'>('genel');
  const [kullanici, setKullanici] = useState<Kullanici | null>(null);
  const [basvuru, setBasvuru] = useState<BasvuruDurumuDoc | null>(null);
  const [belgeler, setBelgeler] = useState<Belge[]>([]);
  const [loading, setLoading] = useState(true);
  const [yeniDurum, setYeniDurum] = useState<BasvuruDurumu>('beklemede');
  const [adminNotu, setAdminNotu] = useState('');
  const [adminGizliNot, setAdminGizliNot] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [uploadTur, setUploadTur] = useState<string>('katilim_sertifikasi');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      const [kDoc, bDoc, bList] = await Promise.all([
        getDoc(doc(db, 'users', uid)),
        getBasvuruDurumu(uid),
        getKullaniciBelgeler(uid),
      ]);
      if (kDoc.exists()) setKullanici(kDoc.data() as Kullanici);
      if (bDoc) { setBasvuru(bDoc); setYeniDurum(bDoc.durum); setAdminNotu(bDoc.adminNotu ?? ''); setAdminGizliNot(bDoc.adminGizliNot ?? ''); }
      setBelgeler(bList);
      setLoading(false);
    };
    fetchAll();
  }, [uid]);

  const handleDurumGuncelle = async () => {
    if (!user) return;
    if (yeniDurum === 'reddedildi' && !adminNotu.trim()) { setSaveMsg('❌ Reddedildi durumu için admin notu zorunludur.'); return; }
    setSaving(true); setSaveMsg('');
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/basvuru/durum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ uid, durum: yeniDurum, adminNotu: adminNotu || undefined, adminGizliNot: adminGizliNot || undefined }),
      });
      setSaveMsg(res.ok ? '✓ Durum güncellendi.' : '❌ Güncelleme başarısız.');
    } catch { setSaveMsg('❌ Güncelleme başarısız.'); }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 4000);
  };

  const handleAdminUpload = async (file: File) => {
    if (!user) return;
    setUploading(true); setUploadMsg('');
    try {
      const idToken = await user.getIdToken();
      await uploadAdminBelge(uid, file, uploadTur as Parameters<typeof uploadAdminBelge>[2], idToken);
      setUploadMsg('✓ Belge yüklendi.');
      const updated = await getKullaniciBelgeler(uid);
      setBelgeler(updated);
    } catch { setUploadMsg('❌ Yükleme hatası.'); }
    setUploading(false);
    setTimeout(() => setUploadMsg(''), 4000);
  };

  if (loading) return <div style={{ padding: 40, color: '#4a4568', fontFamily: 'Share Tech Mono, monospace', fontSize: 13, letterSpacing: '0.3em' }}>YÜKLENİYOR...</div>;

  const isHack = kullanici?.etkinlikTuru === 'hackathon';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Share+Tech+Mono&display=swap');
        .kd-page { padding: 28px; max-width: 800px; margin: 0 auto; }
        .kd-back { display: inline-flex; align-items: center; gap: 6px; color: #6b6485; font-size: 13px; text-decoration: none; margin-bottom: 20px; transition: color 150ms; }
        .kd-back:hover { color: #9490b0; }
        .kd-hdr { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
        .kd-avatar { width: 52px; height: 52px; border-radius: 50%; background: #2a2545; border: 2px solid #3a3060; display: flex; align-items: center; justify-content: center; font-family: 'Lexend', sans-serif; font-weight: 800; font-size: 18px; color: #9490b0; }
        .kd-name { font-family: 'Lexend', sans-serif; font-weight: 800; font-size: 22px; color: #d1cfe8; }
        .kd-sub { font-size: 13px; color: #6b6485; margin-top: 2px; }
        .kd-tabs { display: flex; gap: 4px; border-bottom: 1px solid #1e1a2e; margin-bottom: 24px; }
        .kd-tab { padding: 9px 16px; font-size: 13px; color: #6b6485; cursor: pointer; border: none; background: none; font-family: 'DM Sans', sans-serif; border-bottom: 2px solid transparent; transition: all 150ms; }
        .kd-tab:hover { color: #9490b0; }
        .kd-tab.on { color: #d1cfe8; border-bottom-color: #7c3aed; }
        .kd-card { background: #13111f; border: 1px solid #1e1a2e; border-radius: 12px; padding: 24px; margin-bottom: 18px; }
        .kd-sec { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.3em; color: #4a4568; text-transform: uppercase; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 1px dashed #1e1a2e; }
        .kd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 14px; }
        .kd-field-lbl { font-size: 11px; color: #4a4568; margin-bottom: 3px; }
        .kd-field-val { font-size: 14px; color: #c8c4e0; line-height: 1.5; }
        .kd-label { display: block; font-size: 12px; color: #9490b0; margin-bottom: 6px; }
        .kd-inp, .kd-ta, .kd-sel { width: 100%; background: #0d0b18; border: 1px solid #2a2545; border-radius: 8px; padding: 9px 13px; color: #d1cfe8; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 150ms; margin-bottom: 14px; }
        .kd-inp:focus, .kd-ta:focus, .kd-sel:focus { border-color: #7c3aed; }
        .kd-ta { resize: vertical; min-height: 90px; }
        .kd-sel option { background: #13111f; }
        .kd-btn { background: #7c3aed; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-family: 'Lexend', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; transition: opacity 150ms; }
        .kd-btn:hover:not(:disabled) { opacity: 0.85; }
        .kd-msg-ok { color: #6ee7b7; font-size: 13px; margin-top: 8px; }
        .kd-msg-err { color: #fca5a5; font-size: 13px; margin-top: 8px; }
        .kd-file-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #0d0b18; border: 1px solid #1e1a2e; border-radius: 8px; margin-bottom: 8px; }
        .kd-file-tur { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.15em; color: #4a4568; text-transform: uppercase; }
        .kd-file-name { font-size: 13px; color: #c8c4e0; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .kd-file-link { font-size: 12px; color: #7c3aed; text-decoration: none; }
        .kd-empty { color: #4a4568; font-size: 13px; padding: 16px 0; }
        .kd-chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 12px; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.1em; margin-right: 6px; margin-bottom: 4px; }
        .kd-upload-drop { border: 2px dashed #2a2545; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; color: #6b6485; font-size: 13px; transition: all 150ms; }
        .kd-upload-drop:hover { border-color: #7c3aed; }
      `}</style>

      <div className="kd-page">
        <Link href="/admin/kullanicilar" className="kd-back">← Kullanıcılara Dön</Link>

        <div className="kd-hdr">
          <div className="kd-avatar">{kullanici?.isim[0]}{kullanici?.soyisim[0]}</div>
          <div>
            <div className="kd-name">{kullanici?.isim} {kullanici?.soyisim}</div>
            <div className="kd-sub">{kullanici?.eposta} · {isHack ? '🔍 Hackathon' : '🎮 Game Jam'} · {kullanici?.universite}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontFamily: 'Share Tech Mono', fontSize: 12, letterSpacing: '0.15em', padding: '4px 12px', borderRadius: 12, background: DURUM_COLORS[basvuru?.durum ?? 'beklemede'] + '20', color: DURUM_COLORS[basvuru?.durum ?? 'beklemede'] }}>
              {basvuru?.durum ?? 'beklemede'}
            </span>
          </div>
        </div>

        <div className="kd-tabs">
          <button className={`kd-tab ${aktifTab === 'genel' ? 'on' : ''}`} onClick={() => setAktifTab('genel')}>Genel</button>
          <button className={`kd-tab ${aktifTab === 'belgeler' ? 'on' : ''}`} onClick={() => setAktifTab('belgeler')}>Belgeler ({belgeler.length})</button>
          <button className={`kd-tab ${aktifTab === 'durum' ? 'on' : ''}`} onClick={() => setAktifTab('durum')}>Durum Yönetimi</button>
        </div>

        {aktifTab === 'genel' && kullanici && (
          <>
            <div className="kd-card">
              <p className="kd-sec">// KİŞİSEL BİLGİLER</p>
              <div className="kd-grid">
                {[
                  ['Ad', kullanici.isim], ['Soyad', kullanici.soyisim], ['E-posta', kullanici.eposta],
                  ['Telefon', kullanici.telefon], ['Üniversite', kullanici.universite], ['Bölüm', kullanici.bolum],
                  ['Katılım', kullanici.katilimTuru === 'takim' ? `Takım · ${kullanici.takimAdi ?? '-'}` : 'Bireysel'],
                  ['Deneyim', kullanici.deneyimSeviyesi ?? '-'],
                ].map(([l, v]) => (
                  <div key={String(l)}>
                    <div className="kd-field-lbl">{l}</div>
                    <div className="kd-field-val">{v}</div>
                  </div>
                ))}
              </div>
            </div>
            {kullanici.motivasyon && (
              <div className="kd-card">
                <p className="kd-sec">// MOTİVASYON</p>
                <p style={{ fontSize: 14, color: '#c8c4e0', lineHeight: 1.7, margin: 0 }}>{kullanici.motivasyon}</p>
              </div>
            )}
            {kullanici.rol && kullanici.rol.length > 0 && (
              <div className="kd-card">
                <p className="kd-sec">// ROLLER</p>
                {kullanici.rol.map((r: string) => (
                  <span key={r} className="kd-chip" style={{ background: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.3)' }}>{r}</span>
                ))}
              </div>
            )}
            {kullanici.takimUyeleri && kullanici.takimUyeleri.length > 0 && (
              <div className="kd-card">
                <p className="kd-sec">// TAKIM ÜYELERİ</p>
                {kullanici.takimUyeleri.map((uye: { isim: string; soyisim: string; eposta: string }, i: number) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px dashed #1e1a2e' }}>
                    <div style={{ fontSize: 14, color: '#c8c4e0', fontWeight: 500 }}>{uye.isim} {uye.soyisim}</div>
                    <div style={{ fontSize: 12, color: '#6b6485', marginTop: 2 }}>{uye.eposta}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {aktifTab === 'belgeler' && (
          <>
            <div className="kd-card">
              <p className="kd-sec">// ADMİN BELGE YÜKLE</p>
              <label className="kd-label">BELGE TÜRÜ</label>
              <select className="kd-sel" value={uploadTur} onChange={e => setUploadTur(e.target.value)}>
                <option value="katilim_sertifikasi">Katılım Sertifikası</option>
                <option value="finalist_belgesi">Finalist Belgesi</option>
                <option value="odul_belgesi">Ödül Belgesi</option>
                <option value="diger">Diğer</option>
              </select>
              <div className="kd-upload-drop" onClick={() => document.getElementById('kd-file-input')?.click()}>
                {uploading ? 'Yükleniyor...' : '📤 Belge yüklemek için tıklayın'}
              </div>
              <input id="kd-file-input" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleAdminUpload(f); }} />
              {uploadMsg && <p className={uploadMsg.startsWith('✓') ? 'kd-msg-ok' : 'kd-msg-err'}>{uploadMsg}</p>}
            </div>
            <div className="kd-card">
              <p className="kd-sec">// TÜM BELGELER ({belgeler.length})</p>
              {belgeler.length === 0 ? (
                <p className="kd-empty">Henüz belge yok.</p>
              ) : belgeler.map(b => (
                <div key={b.id} className="kd-file-row">
                  <span style={{ fontSize: 18 }}>{b.yukleyenTip === 'admin' ? '📩' : '📄'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="kd-file-tur">{BELGE_LABELS[b.belgeTuru] ?? b.belgeTuru} · {b.yukleyenTip}</div>
                    <div className="kd-file-name">{b.dosyaAdi}</div>
                  </div>
                  <a href={b.dosyaUrl} target="_blank" rel="noopener noreferrer" className="kd-file-link">İndir ↗</a>
                </div>
              ))}
            </div>
          </>
        )}

        {aktifTab === 'durum' && (
          <div className="kd-card">
            <p className="kd-sec">// DURUM YÖNETİMİ</p>
            <label className="kd-label">DURUM</label>
            <select className="kd-sel" value={yeniDurum} onChange={e => setYeniDurum(e.target.value as BasvuruDurumu)}>
              {DURUM_SECIMLERI.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <label className="kd-label">ADMİN NOTU <span style={{ color: '#4a4568', fontSize: 11 }}>(kullanıcıya görünür) {yeniDurum === 'reddedildi' ? '— ZORUNLU' : '(opsiyonel)'}</span></label>
            <textarea className="kd-ta" value={adminNotu} onChange={e => setAdminNotu(e.target.value)} placeholder="Kullanıcıya iletilecek mesaj..." />
            <label className="kd-label">GİZLİ NOT <span style={{ color: '#4a4568', fontSize: 11 }}>(sadece adminler görür)</span></label>
            <textarea className="kd-ta" value={adminGizliNot} onChange={e => setAdminGizliNot(e.target.value)} placeholder="İç not, kullanıcıya gösterilmez..." />
            <button className="kd-btn" disabled={saving} onClick={handleDurumGuncelle}>
              {saving ? '⟳ Kaydediliyor...' : 'Durumu Güncelle'}
            </button>
            {saveMsg && <p className={saveMsg.startsWith('✓') ? 'kd-msg-ok' : 'kd-msg-err'}>{saveMsg}</p>}
          </div>
        )}
      </div>
    </>
  );
}
