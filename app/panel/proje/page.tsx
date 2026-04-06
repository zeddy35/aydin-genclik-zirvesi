'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

interface HackathonProje { projeAdi: string; aciklama: string; githubUrl?: string; canlıUrl?: string; dosya?: FileList; }
interface GameJamProje { oyunAdi: string; aciklama: string; itchUrl: string; }

export default function ProjePage() {
  const { user, kullanici } = useAuth();
  const [basarili, setBasarili] = useState(false);
  const [hata, setHata] = useState('');
  const isHack = kullanici?.etkinlikTuru === 'hackathon';
  const accent = isHack ? '#d4a843' : '#7c3aed';

  const { register: regH, handleSubmit: hsH, formState: { errors: eH, isSubmitting: isH } } = useForm<HackathonProje>();
  const { register: regJ, handleSubmit: hsJ, formState: { errors: eJ, isSubmitting: isJ } } = useForm<GameJamProje>();

  const onHack = async (data: HackathonProje) => {
    if (!user) return;
    try {
      setHata('');
      await setDoc(doc(db, 'projeler', user.uid), {
        kullaniciId: user.uid,
        etkinlikTuru: 'hackathon',
        projeAdi: data.projeAdi,
        aciklama: data.aciklama,
        githubUrl: data.githubUrl ?? null,
        canlıUrl: data.canlıUrl ?? null,
        gonderiTarihi: serverTimestamp(),
      });
      setBasarili(true);
    } catch { setHata('Gönderim sırasında hata oluştu.'); }
  };

  const onJam = async (data: GameJamProje) => {
    if (!user) return;
    try {
      setHata('');
      await setDoc(doc(db, 'projeler', user.uid), {
        kullaniciId: user.uid,
        etkinlikTuru: 'gamejam',
        oyunAdi: data.oyunAdi,
        aciklama: data.aciklama,
        itchUrl: data.itchUrl,
        gonderiTarihi: serverTimestamp(),
      });
      setBasarili(true);
    } catch { setHata('Gönderim sırasında hata oluştu.'); }
  };

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Share+Tech+Mono&display=swap');
        @keyframes stampIn { from { transform: rotate(-15deg) scale(2); opacity: 0; } to { transform: rotate(-15deg) scale(1); opacity: 0.9; } }
        .prj-page { padding: 28px; max-width: 680px; margin: 0 auto; }
        .prj-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.35em; color: #4a4568; text-transform: uppercase; margin-bottom: 6px; }
        .prj-title { font-family: 'Lexend', sans-serif; font-weight: 800; font-size: clamp(20px,4vw,30px); color: #d1cfe8; margin-bottom: 28px; }
        .prj-card { background: #13111f; border: 1px solid #1e1a2e; border-radius: 12px; padding: 28px; }
        .prj-label { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.3em; color: #4a4568; text-transform: uppercase; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px dashed #1e1a2e; }
        .prj-group { margin-bottom: 18px; }
        .prj-fl { display: block; font-size: 12px; color: #9490b0; letter-spacing: 0.05em; margin-bottom: 6px; }
        .prj-inp, .prj-ta { width: 100%; background: #0d0b18; border: 1px solid #2a2545; border-radius: 8px; padding: 10px 14px; color: #d1cfe8; font-family: 'DM Sans', sans-serif; font-size: 15px; outline: none; transition: border-color 150ms; }
        .prj-inp:focus, .prj-ta:focus { border-color: ${accent}; }
        .prj-inp::placeholder, .prj-ta::placeholder { color: #3d3660; }
        .prj-ta { resize: vertical; min-height: 120px; line-height: 1.6; }
        .prj-err { font-size: 12px; color: #f87171; margin-top: 4px; display: block; }
        .prj-hint { font-size: 12px; color: #4a4568; margin-top: 4px; }
        .prj-btn-hack { width: 100%; background: #d4a843; color: #0a0a0f; border: none; border-radius: 10px; padding: 14px; font-family: 'Lexend', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 150ms; }
        .prj-btn-hack:hover:not(:disabled) { background: #c49930; }
        .prj-btn-jam { width: 100%; background: linear-gradient(135deg,#7c3aed,#ec4899); color: #fff; border: none; border-radius: 10px; padding: 14px; font-family: 'Lexend', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; }
        .prj-glob-err { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 12px 16px; color: #fca5a5; font-size: 14px; margin-bottom: 16px; }
        .prj-scs { text-align: center; padding: 40px; }
        .prj-scs-stamp { font-family: 'Lexend', sans-serif; font-weight: 800; font-size: 28px; color: ${accent}; border: 3px solid ${accent}; padding: 12px 24px; display: inline-block; animation: stampIn 0.6s ease forwards; }
        .prj-scs-sub { font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 0.25em; color: #4a4568; margin-top: 16px; }
      `}</style>

      <div className="prj-page">
        <p className="prj-eyebrow">◈ PROJE GÖNDER</p>
        <h1 className="prj-title">Projeyi Teslim Et</h1>

        {basarili ? (
          <div className="prj-card">
            <div className="prj-scs">
              <div className="prj-scs-stamp">{isHack ? 'TESLİM EDİLDİ ✓' : 'GAME SHIPPED! 🎮'}</div>
              <p className="prj-scs-sub">Proje başarıyla gönderildi.</p>
            </div>
          </div>
        ) : isHack ? (
          <div className="prj-card">
            <p className="prj-label">// HACKATHON PROJESİ</p>
            {hata && <div className="prj-glob-err">{hata}</div>}
            <form onSubmit={hsH(onHack)} noValidate>
              <div className="prj-group">
                <label className="prj-fl">PROJE ADI *</label>
                <input {...regH('projeAdi', { required: 'Proje adı zorunludur.' })} className="prj-inp" placeholder="Projenizin adı" />
                {eH.projeAdi && <span className="prj-err">{eH.projeAdi.message}</span>}
              </div>
              <div className="prj-group">
                <label className="prj-fl">AÇIKLAMA *</label>
                <textarea {...regH('aciklama', { required: 'Açıklama zorunludur.', minLength: { value: 50, message: 'En az 50 karakter giriniz.' } })} className="prj-ta" placeholder="Projenizin ne yaptığını, ne problemi çözdüğünü kısaca açıklayın." />
                {eH.aciklama && <span className="prj-err">{eH.aciklama.message}</span>}
              </div>
              <div className="prj-group">
                <label className="prj-fl">GITHUB URL <span style={{ color: '#4a4568', fontSize: 11 }}>(opsiyonel)</span></label>
                <input {...regH('githubUrl')} className="prj-inp" placeholder="https://github.com/..." />
              </div>
              <div className="prj-group">
                <label className="prj-fl">CANLI DEMO URL <span style={{ color: '#4a4568', fontSize: 11 }}>(opsiyonel)</span></label>
                <input {...regH('canlıUrl')} className="prj-inp" placeholder="https://..." />
                <span className="prj-hint">Vercel, Netlify vb. deploy linki</span>
              </div>
              <button type="submit" className="prj-btn-hack" disabled={isH}>{isH ? '⟳ GÖNDERİLİYOR...' : 'DOSYAYI TESLİM ET →'}</button>
            </form>
          </div>
        ) : (
          <div className="prj-card">
            <p className="prj-label">// GAME JAM PROJESİ</p>
            {hata && <div className="prj-glob-err">{hata}</div>}
            <form onSubmit={hsJ(onJam)} noValidate>
              <div className="prj-group">
                <label className="prj-fl">OYUN ADI *</label>
                <input {...regJ('oyunAdi', { required: 'Oyun adı zorunludur.' })} className="prj-inp" placeholder="Oyununuzun adı" />
                {eJ.oyunAdi && <span className="prj-err">{eJ.oyunAdi.message}</span>}
              </div>
              <div className="prj-group">
                <label className="prj-fl">AÇIKLAMA *</label>
                <textarea {...regJ('aciklama', { required: 'Açıklama zorunludur.', minLength: { value: 30, message: 'En az 30 karakter giriniz.' } })} className="prj-ta" placeholder="Oyununuzu kısaca tanıtın. Tema nasıl işlediniz?" />
                {eJ.aciklama && <span className="prj-err">{eJ.aciklama.message}</span>}
              </div>
              <div className="prj-group">
                <label className="prj-fl">ITCH.IO SAYFASI *</label>
                <input {...regJ('itchUrl', { required: 'itch.io URL zorunludur.', pattern: { value: new RegExp('^https?://.+\.itch\.io/.+'), message: 'Geçerli bir itch.io URL girin.' } })} className="prj-inp" placeholder="https://kullanici.itch.io/oyun-adi" />
                {eJ.itchUrl && <span className="prj-err">{eJ.itchUrl.message}</span>}
                <span className="prj-hint">Oyununuzun itch.io publish linki</span>
              </div>
              <button type="submit" className="prj-btn-jam" disabled={isJ ? true : false}>{isJ ? '⟳ GÖNDERİLİYOR...' : 'BAŞVURUYU GÖNDER 🚀'}</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
