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
  const accent    = isHack ? '#e8c84a'               : '#a78bfa';
  const cardBg    = isHack ? '#140f02'               : '#131028';
  const innerBg   = isHack ? '#1c1500'               : '#1a1638';
  const border    = isHack ? 'rgba(196,154,40,0.18)' : 'rgba(124,58,237,0.2)';
  const textPri   = isHack ? '#fff5d0'               : '#ede8ff';
  const textSub   = isHack ? '#ddc880'               : '#c4b8f5';
  const textDim   = isHack ? '#706030'               : '#6858a0';

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

  const onHack = async (data: HackathonProje) => { await postProje({ type: 'hackathon', ...data }); };
  const onJam  = async (data: GameJamProje)   => { await postProje({ type: 'gamejam',   ...data }); };

  if (!user) return null;

  const inputCls = `w-full rounded-lg px-3.5 py-2.5 text-[15px] font-[Lexend] outline-none transition-[border-color,box-shadow] duration-150`;
  const fieldLblCls = `block text-[12px] font-semibold tracking-[0.05em] mb-1.5`;
  const errCls = 'text-xs text-red-500 mt-1 block';
  const hintCls = 'text-xs mt-1';

  return (
    <>
      <style>{`@keyframes stampIn { from { transform: rotate(-15deg) scale(2); opacity: 0; } to { transform: rotate(-15deg) scale(1); opacity: 0.9; } }`}</style>

      <div className="p-7 max-w-[680px] mx-auto">
        <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.35em] uppercase mb-1.5" style={{ color: textDim }}>
          ◈ PROJE GÖNDER
        </p>
        <h1 className="font-[Lexend] font-extrabold text-[clamp(20px,4vw,30px)] mb-7" style={{ color: textPri }}>
          Projeyi Teslim Et
        </h1>

        {basarili ? (
          <div className="rounded-xl p-7" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <div className="text-center py-10">
              <div className="font-[Lexend] font-extrabold text-[28px] border-[3px] px-6 py-3 inline-block"
                style={{ color: accent, borderColor: accent, animation: 'stampIn 0.6s ease forwards' }}>
                {isHack ? 'TESLİM EDİLDİ ✓' : 'GAME SHIPPED! 🎮'}
              </div>
              <p className="font-[Share_Tech_Mono] text-[12px] tracking-[0.25em] mt-4" style={{ color: textDim }}>
                Proje başarıyla gönderildi.
              </p>
            </div>
          </div>
        ) : isHack ? (
          <div className="rounded-xl p-7" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.3em] uppercase mb-[18px] pb-3 border-b border-dashed" style={{ color: textDim, borderColor: border }}>
              // HACKATHON PROJESİ
            </p>
            {hata && <div className="bg-red-500/6 border border-red-500/20 rounded-lg px-4 py-3 text-red-500 text-[14px] mb-4">{hata}</div>}
            <form onSubmit={hsH(onHack)} noValidate>
              <div className="mb-[18px]">
                <label className={fieldLblCls} style={{ color: textSub }}>PROJE ADI *</label>
                <input {...regH('projeAdi', { required: 'Proje adı zorunludur.' })}
                  className={inputCls}
                  style={{ background: innerBg, border: `1px solid ${border}`, color: textPri }}
                  placeholder="Projenizin adı" />
                {eH.projeAdi && <span className={errCls}>{eH.projeAdi.message}</span>}
              </div>
              <div className="mb-[18px]">
                <label className={fieldLblCls} style={{ color: textSub }}>AÇIKLAMA *</label>
                <textarea {...regH('aciklama', { required: 'Açıklama zorunludur.', minLength: { value: 50, message: 'En az 50 karakter giriniz.' } })}
                  className={`${inputCls} resize-y min-h-[120px] leading-relaxed`}
                  style={{ background: innerBg, border: `1px solid ${border}`, color: textPri }}
                  placeholder="Projenizin ne yaptığını, ne problemi çözdüğünü kısaca açıklayın." />
                {eH.aciklama && <span className={errCls}>{eH.aciklama.message}</span>}
              </div>
              <div className="mb-[18px]">
                <label className={fieldLblCls} style={{ color: textSub }}>
                  GITHUB URL <span className="text-[11px]" style={{ color: textDim }}>(opsiyonel)</span>
                </label>
                <input {...regH('githubUrl')}
                  className={inputCls}
                  style={{ background: innerBg, border: `1px solid ${border}`, color: textPri }}
                  placeholder="https://github.com/..." />
              </div>
              <div className="mb-[18px]">
                <label className={fieldLblCls} style={{ color: textSub }}>
                  CANLI DEMO URL <span className="text-[11px]" style={{ color: textDim }}>(opsiyonel)</span>
                </label>
                <input {...regH('canlıUrl')}
                  className={inputCls}
                  style={{ background: innerBg, border: `1px solid ${border}`, color: textPri }}
                  placeholder="https://..." />
                <span className={hintCls} style={{ color: textDim }}>Vercel, Netlify vb. deploy linki</span>
              </div>
              <button type="submit"
                className="w-full rounded-[10px] py-3.5 font-[Lexend] font-bold text-[15px] text-white border-none cursor-pointer transition-all duration-150 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#c49a28,#e8c84a)', boxShadow: '0 2px 12px rgba(196,154,40,0.3)' }}
                disabled={isH}>
                {isH ? '⟳ GÖNDERİLİYOR...' : 'DOSYAYI TESLİM ET →'}
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-xl p-7" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.3em] uppercase mb-[18px] pb-3 border-b border-dashed" style={{ color: textDim, borderColor: border }}>
              // GAME JAM PROJESİ
            </p>
            {hata && <div className="bg-red-500/6 border border-red-500/20 rounded-lg px-4 py-3 text-red-500 text-[14px] mb-4">{hata}</div>}
            <form onSubmit={hsJ(onJam)} noValidate>
              <div className="mb-[18px]">
                <label className={fieldLblCls} style={{ color: textSub }}>OYUN ADI *</label>
                <input {...regJ('oyunAdi', { required: 'Oyun adı zorunludur.' })}
                  className={inputCls}
                  style={{ background: innerBg, border: `1px solid ${border}`, color: textPri }}
                  placeholder="Oyununuzun adı" />
                {eJ.oyunAdi && <span className={errCls}>{eJ.oyunAdi.message}</span>}
              </div>
              <div className="mb-[18px]">
                <label className={fieldLblCls} style={{ color: textSub }}>AÇIKLAMA *</label>
                <textarea {...regJ('aciklama', { required: 'Açıklama zorunludur.', minLength: { value: 30, message: 'En az 30 karakter giriniz.' } })}
                  className={`${inputCls} resize-y min-h-[120px] leading-relaxed`}
                  style={{ background: innerBg, border: `1px solid ${border}`, color: textPri }}
                  placeholder="Oyununuzu kısaca tanıtın. Tema nasıl işlediniz?" />
                {eJ.aciklama && <span className={errCls}>{eJ.aciklama.message}</span>}
              </div>
              <div className="mb-[18px]">
                <label className={fieldLblCls} style={{ color: textSub }}>ITCH.IO SAYFASI *</label>
                <input {...regJ('itchUrl', { required: 'itch.io URL zorunludur.', pattern: { value: new RegExp('^https?://.+\.itch\.io/.+'), message: 'Geçerli bir itch.io URL girin.' } })}
                  className={inputCls}
                  style={{ background: innerBg, border: `1px solid ${border}`, color: textPri }}
                  placeholder="https://kullanici.itch.io/oyun-adi" />
                {eJ.itchUrl && <span className={errCls}>{eJ.itchUrl.message}</span>}
                <span className={hintCls} style={{ color: textDim }}>Oyununuzun itch.io publish linki</span>
              </div>
              <button type="submit"
                className="w-full rounded-[10px] py-3.5 font-[Lexend] font-bold text-[15px] text-white border-none cursor-pointer transition-all duration-150 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 2px 12px rgba(124,58,237,0.3)' }}
                disabled={isJ}>
                {isJ ? '⟳ GÖNDERİLİYOR...' : 'BAŞVURUYU GÖNDER 🚀'}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
