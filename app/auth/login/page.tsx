'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import './login.css';

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

      // Set __session cookie so middleware can detect authenticated state.
      // We use the ID token as the cookie value (short-lived, 1h).
      const idToken = await user.getIdToken();
      document.cookie = `__session=${idToken}; path=/; max-age=3600; SameSite=Strict; Secure`;

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

  return (
    <div className="lgn-page">
        <div className="lgn-card">
          <p className="lgn-eyebrow">◈ AGZ — GİRİŞ SİSTEMİ ◈</p>
          <h1 className="lgn-title">Giriş Yap</h1>
          <p className="lgn-sub">Hesabınıza erişmek için giriş yapın.</p>

          {hata && <div className="lgn-error">{hata}</div>}

          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="lgn-group">
              <label className="lgn-label" htmlFor="eposta">E-POSTA</label>
              <input
                id="eposta" type="email" className="lgn-input"
                placeholder="ornek@eposta.com"
                value={eposta} onChange={e => setEposta(e.target.value)}
                autoComplete="email" required
              />
            </div>

            <div className="lgn-group">
              <label className="lgn-label" htmlFor="sifre">ŞİFRE</label>
              <div className="lgn-pw-wrap">
                <input
                  id="sifre" type={sifreGoster ? 'text' : 'password'} className="lgn-input"
                  placeholder="············"
                  value={sifre} onChange={e => setSifre(e.target.value)}
                  autoComplete="current-password" required
                />
                <button type="button" className="lgn-eye"
                  onClick={() => setSifreGoster(v => !v)}
                  aria-label={sifreGoster ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {sifreGoster ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" className="lgn-btn" disabled={yukleniyor}>
              {yukleniyor ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP →'}
            </button>
          </form>

          <hr className="lgn-hr" />

          <div className="lgn-links">
            <a href="/auth/register">Hesabın yok mu? <span>Kayıt Ol →</span></a>
          </div>
        </div>
    </div>
  );
}
