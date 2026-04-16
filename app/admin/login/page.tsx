'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

const inputCls = 'w-full bg-[#0a0814] border border-[#1e1a2e] rounded-lg px-3.5 py-[11px] text-[#e8e4f8] font-[Lexend] text-[15px] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#302a48] focus:border-red-500/40 focus:ring-2 focus:ring-red-500/7';

export default function AdminLoginPage() {
  const [eposta, setEposta] = useState('');
  const [sifre, setSifre] = useState('');
  const [sifreGoster, setSifreGoster] = useState(false);
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, eposta, sifre);
      const [idToken, adminSnap] = await Promise.all([
        user.getIdToken(),
        getDoc(doc(db, 'admins', user.uid)),
      ]);
      if (!adminSnap.exists()) {
        setHata('Bu hesabın admin yetkisi yok.');
        setYukleniyor(false);
        return;
      }
      const sessionRes = await fetch('/api/auth/session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken }),
      });
      if (!sessionRes.ok) throw new Error('session_failed');
      router.push('/admin');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setHata('E-posta veya şifre hatalı.');
      } else if (code === 'auth/wrong-password') {
        setHata('Şifre hatalı.');
      } else if (code === 'auth/invalid-email') {
        setHata('Geçersiz e-posta adresi.');
      } else if (code === 'auth/too-many-requests') {
        setHata('Çok fazla başarısız deneme. Lütfen bekleyin.');
      } else {
        setHata('Giriş başarısız. Lütfen tekrar deneyin.');
      }
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <>
      <style>{`
        .adm-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(239,68,68,0.04) 1px, transparent 6px),
            linear-gradient(90deg, rgba(239,68,68,0.04) 1px, transparent 6px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .adm-card::before {
          content: '';
          position: absolute;
          top: 0; left: 20px; right: 20px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ef4444, transparent);
          border-radius: 0 0 2px 2px;
        }
        .adm-badge::before { content: '◈'; }
      `}</style>

      <div className="adm-page min-h-screen bg-[#07060f] flex items-center justify-center font-[Lexend] p-6 relative overflow-hidden">
        <div className="adm-card w-full max-w-[400px] bg-[#0f0d1a] border border-red-500/20 rounded-xl px-9 py-10 relative shadow-[0_0_60px_rgba(239,68,68,0.06),0_24px_48px_rgba(0,0,0,0.5)]">

          <div className="adm-badge inline-flex items-center gap-1.5 font-[Share_Tech_Mono] text-[10px] tracking-[0.25em] text-red-400 bg-red-500/10 border border-red-500/25 rounded px-2.5 py-1 mb-5">
            AGZ ADMİN PANELİ
          </div>

          <h1 className="font-extrabold text-[26px] text-white tracking-tight mb-1.5">Yetkili Girişi</h1>
          <p className="text-[13px] text-[#4a4568] leading-relaxed mb-7">Bu alan yalnızca yetkili personele açıktır.</p>

          {hata && (
            <div className="bg-red-500/8 border border-red-500/30 rounded-lg px-3.5 py-2.5 text-[#fca5a5] text-[13px] leading-snug mb-5">{hata}</div>
          )}

          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="mb-[18px]">
              <label className="block font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] text-[#6b6485] mb-1.5" htmlFor="eposta">E-POSTA</label>
              <input id="eposta" type="email" className={inputCls}
                placeholder="admin@eposta.com"
                value={eposta} onChange={e => setEposta(e.target.value)}
                autoComplete="email" required />
            </div>

            <div className="mb-[18px]">
              <label className="block font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] text-[#6b6485] mb-1.5" htmlFor="sifre">ŞİFRE</label>
              <div className="relative">
                <input id="sifre" type={sifreGoster ? 'text' : 'password'}
                  className={`${inputCls} pr-11`}
                  placeholder="············"
                  value={sifre} onChange={e => setSifre(e.target.value)}
                  autoComplete="current-password" required />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#4a4568] text-base leading-none p-1 transition-colors duration-150 hover:text-[#9490b0]"
                  onClick={() => setSifreGoster(v => !v)}
                  aria-label={sifreGoster ? 'Şifreyi gizle' : 'Şifreyi göster'}>
                  {sifreGoster ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit"
              className="w-full mt-2 py-[13px] bg-gradient-to-br from-red-600 to-red-700 border-none rounded-lg text-white font-[Share_Tech_Mono] text-[13px] tracking-[0.15em] cursor-pointer transition-[opacity,transform] duration-150 hover:not-disabled:opacity-90 hover:not-disabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={yukleniyor}>
              {yukleniyor ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP →'}
            </button>
          </form>

          <hr className="border-none border-t border-[#1a1726] my-6" />

          <a href="/auth/login" className="flex items-center justify-center gap-1.5 text-[#4a4568] text-[13px] no-underline transition-colors duration-150 hover:text-[#9490b0]">
            ← Kullanıcı girişine dön
          </a>
        </div>
      </div>
    </>
  );
}
