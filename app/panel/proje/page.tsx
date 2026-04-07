'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';

interface HackathonProje { projeAdi: string; aciklama: string; githubUrl?: string; canlıUrl?: string; dosya?: FileList; }
interface GameJamProje { oyunAdi: string; aciklama: string; itchUrl: string; }

export default function ProjePage() {
  const { user, kullanici } = useAuth();
  const [basarili, setBasarili] = useState(false);
  const [hata, setHata] = useState('');
  const isHack    = kullanici?.etkinlikTuru === 'hackathon';
  const accent    = isHack ? '#c49a28' : '#7c3aed';
  const cardBg    = isHack ? '#fffef5' : '#ffffff';
  const innerBg   = isHack ? '#fdf9e8' : '#f8f7ff';
  const border    = isHack ? '#ede5b8' : '#e8e3f8';
  const textPri   = isHack ? '#1a1200' : '#1a1630';
  const textSub   = isHack ? '#5a4a10' : '#5a5280';
  const textDim   = isHack ? '#9a8a50' : '#9590b0';

  const { register: regH, handleSubmit: hsH, formState: { errors: eH, isSubmitting: isH } } = useForm<HackathonProje>();
  const { register: regJ, handleSubmit: hsJ, formState: { errors: eJ, isSubmitting: isJ } } = useForm<GameJamProje>();

  const postProje = async (body: object) => {
    if (!user) return;
    setHata('');
    const idToken = await user.getIdToken();
    const res = await fetch('/api/proje/gonder', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body:    JSON.stringify(body),
    });
    if (res.status === 403) { setHata('Proje gönderimi şu anda kapalı.'); return; }
    if (!res.ok)            { setHata('Gönderim sırasında hata oluştu.'); return; }
    setBasarili(true);
  };

  const onHack = async (data: HackathonProje) => {
    await postProje({ type: 'hackathon', ...data });
  };

  const onJam = async (data: GameJamProje) => {
    await postProje({ type: 'gamejam', ...data });
  };

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Share+Tech+Mono&display=swap');
        @keyframes stampIn { from { transform: rotate(-15deg) scale(2); opacity: 0; } to { transform: rotate(-15deg) scale(1); opacity: 0.9; } }
        .prj-page { padding: 28px; max-width: 680px; margin: 0 auto; }
        .prj-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.35em; color: ${textDim}; text-transform: uppercase; margin-bottom: 6px; }
        .prj-title { font-family: 'Lexend', sans-serif; font-weight: 800; font-size: clamp(20px,4vw,30px); color: ${textPri}; margin-bottom: 28px; }
        .prj-card { background: ${cardBg}; border: 1px solid ${border}; border-radius: 12px; padding: 28px; box-shadow: 0 1px 8px ${isHack ? 'rgba(196,154,40,0.08)' : 'rgba(124,58,237,0.06)'}; }
        .prj-label { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.3em; color: ${textDim}; text-transform: uppercase; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px dashed ${border}; }
        .prj-group { margin-bottom: 18px; }
        .prj-fl { display: block; font-size: 12px; color: ${textSub}; letter-spacing: 0.05em; margin-bottom: 6px; font-weight: 600; }
        .prj-inp, .prj-ta { width: 100%; background: ${innerBg}; border: 1px solid ${border}; border-radius: 8px; padding: 10px 14px; color: ${textPri}; font-family: 'DM Sans', sans-serif; font-size: 15px; outline: none; transition: border-color 150ms; }
        .prj-inp:focus, .prj-ta:focus { border-color: ${accent}; box-shadow: 0 0 0 3px ${accent}18; }
        .prj-inp::placeholder, .prj-ta::placeholder { color: ${isHack ? '#c8b870' : '#c0b8d8'}; }
        .prj-ta { resize: vertical; min-height: 120px; line-height: 1.6; }
        .prj-err { font-size: 12px; color: #ef4444; margin-top: 4px; display: block; }
        .prj-hint { font-size: 12px; color: ${textDim}; margin-top: 4px; }
        .prj-btn-hack { width: 100%; background: linear-gradient(135deg,#c49a28,#e8c84a); color: #ffffff; border: none; border-radius: 10px; padding: 14px; font-family: 'Lexend', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 150ms; box-shadow: 0 2px 12px rgba(196,154,40,0.3); }
        .prj-btn-hack:hover:not(:disabled) { background: linear-gradient(135deg,#b08820,#d4b638); }
        .prj-btn-jam { width: 100%; background: linear-gradient(135deg,#7c3aed,#ec4899); color: #fff; border: none; border-radius: 10px; padding: 14px; font-family: 'Lexend', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; box-shadow: 0 2px 12px rgba(124,58,237,0.3); }
        .prj-glob-err { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; padding: 12px 16px; color: #ef4444; font-size: 14px; margin-bottom: 16px; }
        .prj-scs { text-align: center; padding: 40px; }
        .prj-scs-stamp { font-family: 'Lexend', sans-serif; font-weight: 800; font-size: 28px; color: ${accent}; border: 3px solid ${accent}; padding: 12px 24px; display: inline-block; animation: stampIn 0.6s ease forwards; }
        .prj-scs-sub { font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 0.25em; color: ${textDim}; margin-top: 16px; }
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
                <label className="prj-fl">GITHUB URL <span style={{ color: textDim, fontSize: 11 }}>(opsiyonel)</span></label>
                <input {...regH('githubUrl')} className="prj-inp" placeholder="https://github.com/..." />
              </div>
              <div className="prj-group">
                <label className="prj-fl">CANLI DEMO URL <span style={{ color: textDim, fontSize: 11 }}>(opsiyonel)</span></label>
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
