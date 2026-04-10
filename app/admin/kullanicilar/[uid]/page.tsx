'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

const cardCls = 'bg-[#13111f] border border-[#1e1a2e] rounded-xl p-6 mb-[18px]';
const secLabelCls = 'font-[Share_Tech_Mono] text-[11px] tracking-[0.3em] text-[#4a4568] uppercase mb-[18px] pb-2.5 border-b border-dashed border-[#1e1a2e]';
const inputCls = 'w-full bg-[#0d0b18] border border-[#2a2545] rounded-lg px-3 py-2.5 text-[#d1cfe8] font-[Lexend] text-sm outline-none transition-[border-color] duration-150 mb-3.5 focus:border-violet-600';
const labelCls = 'block text-xs text-[#9490b0] mb-1.5';

export default function KullaniciDetailPage() {
  const { uid } = useParams() as { uid: string };
  const { user } = useAuth();
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

  if (loading) return (
    <div className="p-10 font-[Share_Tech_Mono] text-[13px] tracking-[0.3em] text-[#4a4568]">YÜKLENİYOR...</div>
  );

  const isHack = kullanici?.etkinlikTuru === 'hackathon';
  const durumKey = basvuru?.durum ?? 'beklemede';

  return (
    <div className="p-7 max-w-[800px] mx-auto">
      <Link href="/admin/kullanicilar"
        className="inline-flex items-center gap-1.5 text-[#6b6485] text-[13px] no-underline mb-5 transition-colors duration-150 hover:text-[#9490b0]">
        ← Kullanıcılara Dön
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-7">
        <div className="w-[52px] h-[52px] rounded-full bg-[#2a2545] border-2 border-[#3a3060] flex items-center justify-center font-[Lexend] font-extrabold text-[18px] text-[#9490b0] flex-shrink-0">
          {kullanici?.isim[0]}{kullanici?.soyisim[0]}
        </div>
        <div>
          <div className="font-[Lexend] font-extrabold text-[22px] text-[#d1cfe8]">{kullanici?.isim} {kullanici?.soyisim}</div>
          <div className="text-[13px] text-[#6b6485] mt-0.5">{kullanici?.eposta} · {isHack ? '🔍 Hackathon' : '🎮 Game Jam'} · {kullanici?.universite}</div>
        </div>
        <div className="ml-auto">
          <span className="font-[Share_Tech_Mono] text-[12px] tracking-[0.15em] px-3 py-1 rounded-full"
            style={{ background: DURUM_COLORS[durumKey] + '20', color: DURUM_COLORS[durumKey] }}>
            {durumKey}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e1a2e] mb-6">
        {(['genel', 'belgeler', 'durum'] as const).map(tab => (
          <button key={tab}
            className={`px-4 py-2.5 text-[13px] cursor-pointer border-b-2 transition-all duration-150 bg-transparent border-x-0 border-t-0 font-[Lexend] ${aktifTab === tab ? 'text-[#d1cfe8] border-b-violet-600' : 'text-[#6b6485] border-b-transparent hover:text-[#9490b0]'}`}
            onClick={() => setAktifTab(tab)}>
            {tab === 'genel' ? 'Genel' : tab === 'belgeler' ? `Belgeler (${belgeler.length})` : 'Durum Yönetimi'}
          </button>
        ))}
      </div>

      {/* General tab */}
      {aktifTab === 'genel' && kullanici && (
        <>
          <div className={cardCls}>
            <p className={secLabelCls}>// KİŞİSEL BİLGİLER</p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
              {[
                ['Ad', kullanici.isim], ['Soyad', kullanici.soyisim], ['E-posta', kullanici.eposta],
                ['Telefon', kullanici.telefon], ['Üniversite', kullanici.universite], ['Bölüm', kullanici.bolum],
                ['Katılım', kullanici.katilimTuru === 'takim' ? `Takım · ${kullanici.takimAdi ?? '-'}` : 'Bireysel'],
                ['Deneyim', kullanici.deneyimSeviyesi ?? '-'],
              ].map(([l, v]) => (
                <div key={String(l)}>
                  <div className="text-[11px] text-[#4a4568] mb-0.5">{l}</div>
                  <div className="text-[14px] text-[#c8c4e0] leading-snug">{v}</div>
                </div>
              ))}
            </div>
          </div>
          {kullanici.motivasyon && (
            <div className={cardCls}>
              <p className={secLabelCls}>// MOTİVASYON</p>
              <p className="text-[14px] text-[#c8c4e0] leading-relaxed">{kullanici.motivasyon}</p>
            </div>
          )}
          {kullanici.rol && kullanici.rol.length > 0 && (
            <div className={cardCls}>
              <p className={secLabelCls}>// ROLLER</p>
              <div className="flex flex-wrap gap-1.5">
                {kullanici.rol.map((r: string) => (
                  <span key={r} className="inline-flex items-center px-2.5 py-0.5 rounded-full font-[Share_Tech_Mono] text-[10px] tracking-[0.1em]"
                    style={{ background: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.3)' }}>{r}</span>
                ))}
              </div>
            </div>
          )}
          {kullanici.takimUyeleri && kullanici.takimUyeleri.length > 0 && (
            <div className={cardCls}>
              <p className={secLabelCls}>// TAKIM ÜYELERİ</p>
              {kullanici.takimUyeleri.map((uye: { isim: string; soyisim: string; eposta: string }, i: number) => (
                <div key={i} className="py-2.5 border-b border-dashed border-[#1e1a2e] last:border-0">
                  <div className="text-[14px] text-[#c8c4e0] font-medium">{uye.isim} {uye.soyisim}</div>
                  <div className="text-xs text-[#6b6485] mt-0.5">{uye.eposta}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Documents tab */}
      {aktifTab === 'belgeler' && (
        <>
          <div className={cardCls}>
            <p className={secLabelCls}>// ADMİN BELGE YÜKLE</p>
            <label className={labelCls}>BELGE TÜRÜ</label>
            <select className={inputCls} value={uploadTur} onChange={e => setUploadTur(e.target.value)}>
              <option value="katilim_sertifikasi">Katılım Sertifikası</option>
              <option value="finalist_belgesi">Finalist Belgesi</option>
              <option value="odul_belgesi">Ödül Belgesi</option>
              <option value="diger">Diğer</option>
            </select>
            <div className="border-2 border-dashed border-[#2a2545] rounded-lg p-5 text-center cursor-pointer text-[#6b6485] text-[13px] transition-[border-color] duration-150 hover:border-violet-600"
              onClick={() => document.getElementById('kd-file-input')?.click()}>
              {uploading ? 'Yükleniyor...' : '📤 Belge yüklemek için tıklayın'}
            </div>
            <input id="kd-file-input" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleAdminUpload(f); }} />
            {uploadMsg && (
              <p className={`text-[13px] mt-2 ${uploadMsg.startsWith('✓') ? 'text-emerald-300' : 'text-red-300'}`}>{uploadMsg}</p>
            )}
          </div>
          <div className={cardCls}>
            <p className={secLabelCls}>// TÜM BELGELER ({belgeler.length})</p>
            {belgeler.length === 0 ? (
              <p className="text-[13px] text-[#4a4568] py-4">Henüz belge yok.</p>
            ) : belgeler.map(b => (
              <div key={b.id} className="flex items-center gap-2.5 px-3 py-2.5 bg-[#0d0b18] border border-[#1e1a2e] rounded-lg mb-2">
                <span className="text-[18px]">{b.yukleyenTip === 'admin' ? '📩' : '📄'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-[Share_Tech_Mono] text-[10px] tracking-[0.15em] text-[#4a4568] uppercase">{BELGE_LABELS[b.belgeTuru] ?? b.belgeTuru} · {b.yukleyenTip}</div>
                  <div className="text-[13px] text-[#c8c4e0] whitespace-nowrap overflow-hidden text-ellipsis">{b.dosyaAdi}</div>
                </div>
                <a href={b.dosyaUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-500 no-underline">İndir ↗</a>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Status management tab */}
      {aktifTab === 'durum' && (
        <div className={cardCls}>
          <p className={secLabelCls}>// DURUM YÖNETİMİ</p>
          <label className={labelCls}>DURUM</label>
          <select className={inputCls} value={yeniDurum} onChange={e => setYeniDurum(e.target.value as BasvuruDurumu)}>
            {DURUM_SECIMLERI.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <label className={labelCls}>
            ADMİN NOTU <span className="text-[#4a4568] text-[11px]">(kullanıcıya görünür) {yeniDurum === 'reddedildi' ? '— ZORUNLU' : '(opsiyonel)'}</span>
          </label>
          <textarea className={`${inputCls} resize-y min-h-[90px]`} value={adminNotu}
            onChange={e => setAdminNotu(e.target.value)} placeholder="Kullanıcıya iletilecek mesaj..." />
          <label className={labelCls}>
            GİZLİ NOT <span className="text-[#4a4568] text-[11px]">(sadece adminler görür)</span>
          </label>
          <textarea className={`${inputCls} resize-y min-h-[90px]`} value={adminGizliNot}
            onChange={e => setAdminGizliNot(e.target.value)} placeholder="İç not, kullanıcıya gösterilmez..." />
          <button className="bg-violet-700 text-white border-none rounded-lg px-5 py-2.5 font-[Lexend] font-bold text-[14px] cursor-pointer transition-opacity duration-150 hover:opacity-85 disabled:opacity-50"
            disabled={saving} onClick={handleDurumGuncelle}>
            {saving ? '⟳ Kaydediliyor...' : 'Durumu Güncelle'}
          </button>
          {saveMsg && (
            <p className={`text-[13px] mt-2 ${saveMsg.startsWith('✓') ? 'text-emerald-300' : 'text-red-300'}`}>{saveMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}
