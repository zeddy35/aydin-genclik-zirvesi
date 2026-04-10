'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { Eye, EyeOff } from 'lucide-react';
import FluidBackground from '@/components/FluidBackground';

export default function LoginPage() {
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
      const idToken = await user.getIdToken(true);
      await fetch('/api/auth/session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken }),
      });
      const adminSnap = await getDoc(doc(db, 'admins', user.uid));
      router.push(adminSnap.exists() ? '/admin' : '/panel');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setHata('E-posta veya şifre hatalı.');
      } else if (code === 'auth/wrong-password') {
        setHata('Şifre hatalı.');
      } else if (code === 'auth/invalid-email') {
        setHata('Geçersiz e-posta adresi.');
      } else if (code === 'auth/too-many-requests') {
        setHata('Çok fazla başarısız deneme. Lütfen bir süre bekleyin.');
      } else {
        setHata('Giriş başarısız. Lütfen tekrar deneyin.');
      }
    } finally {
      setYukleniyor(false);
    }
  };

  const inputClass =
    'w-full bg-[#0d0b18] border border-[#2a2545] rounded-lg px-3.5 py-2.5 text-[#d1cfe8] font-[Lexend] text-base outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#3d3660] focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15';

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-6 font-[Lexend] relative overflow-hidden">
      <FluidBackground />
      <div className="relative z-10 w-full max-w-[420px] bg-[#13111f]/80 backdrop-blur-xl border border-[#1e1a2e] rounded-2xl px-8 py-10">

        <p className="font-[Share_Tech_Mono] text-sm tracking-[0.35em] text-[#4a4568] uppercase text-center mb-2">
          ◈ AGZ — GİRİŞ SİSTEMİ ◈
        </p>
        <h1 className="font-[Lexend] font-extrabold text-[28px] text-[#d1cfe8] text-center mb-1">
          Giriş Yap
        </h1>
        <p className="text-base text-[#6b6485] text-center mb-8">
          Hesabınıza erişmek için giriş yapın.
        </p>

        {hata && (
          <div className="bg-red-500/8 border border-red-500/30 rounded-lg px-3.5 py-2.5 text-red-300 text-sm mb-5 leading-relaxed">
            {hata}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="mb-5">
            <label className="block text-[13px] text-[#9490b0] tracking-wide mb-1.5" htmlFor="eposta">
              E-POSTA
            </label>
            <input
              id="eposta" type="email" className={inputClass}
              placeholder="ornek@eposta.com"
              value={eposta} onChange={e => setEposta(e.target.value)}
              autoComplete="email" required
            />
          </div>

          <div className="mb-5">
            <label className="block text-[13px] text-[#9490b0] tracking-wide mb-1.5" htmlFor="sifre">
              ŞİFRE
            </label>
            <div className="relative">
              <input
                id="sifre" type={sifreGoster ? 'text' : 'password'}
                className={`${inputClass} pr-11`}
                placeholder="············"
                value={sifre} onChange={e => setSifre(e.target.value)}
                autoComplete="current-password" required
              />
              <button
                type="button"
                onClick={() => setSifreGoster(v => !v)}
                aria-label={sifreGoster ? 'Şifreyi gizle' : 'Şifreyi göster'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6485] hover:text-[#9490b0] transition-colors duration-150 p-1 cursor-pointer bg-transparent border-none"
              >
                {sifreGoster ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={yukleniyor}
            className="mt-2 w-full bg-violet-700 hover:enabled:bg-violet-800 hover:enabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl py-3.5 cursor-pointer border-none transition-all duration-150 tracking-wide"
          >
            {yukleniyor ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP →'}
          </button>
        </form>

        <hr className="border-none border-t border-dashed border-[#1e1a2e] my-6" />

        <div className="flex flex-col gap-2 text-center">
          <a href="/auth/register" className="text-sm text-[#6b6485] no-underline ">
            Hesabın yok mu? <span className="text-violet-600 hover:text-[#c4b5fd] transition-colors duration-150">Kayıt Ol →</span>
          </a>
        </div>

      </div>
    </div>
  );
}
