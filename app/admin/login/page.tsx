'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

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
      const adminSnap = await getDoc(doc(db, 'admins', user.uid));
      if (!adminSnap.exists()) {
        setHata('Bu hesabın admin yetkisi yok.');
        setYukleniyor(false);
        return;
      }
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
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .adm-page {
          min-height: 100vh;
          background: #07060f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Lexend', sans-serif;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* arka plan ızgara */
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

        .adm-card {
          width: 100%;
          max-width: 400px;
          background: #0f0d1a;
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px;
          padding: 40px 36px;
          position: relative;
          box-shadow: 0 0 60px rgba(239,68,68,0.06), 0 24px 48px rgba(0,0,0,0.5);
        }

        /* üst kırmızı çizgi */
        .adm-card::before {
          content: '';
          position: absolute;
          top: 0; left: 20px; right: 20px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ef4444, transparent);
          border-radius: 0 0 2px 2px;
        }

        .adm-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.25em;
          color: #f87171;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 4px;
          padding: 4px 10px;
          margin-bottom: 20px;
        }
        .adm-badge::before { content: '◈'; }

        .adm-title {
          font-family: 'Lexend', sans-serif;
          font-weight: 800;
          font-size: 26px;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }

        .adm-sub {
          font-size: 13px;
          color: #4a4568;
          margin-bottom: 28px;
          line-height: 1.5;
        }

        .adm-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 8px;
          padding: 10px 14px;
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .adm-group { margin-bottom: 18px; }

        .adm-label {
          display: block;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #6b6485;
          margin-bottom: 7px;
        }

        .adm-input {
          width: 100%;
          background: #0a0814;
          border: 1px solid #1e1a2e;
          border-radius: 8px;
          padding: 11px 14px;
          color: #e8e4f8;
          font-family: 'Lexend', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 150ms;
        }
        .adm-input::placeholder { color: #302a48; }
        .adm-input:focus { border-color: rgba(239,68,68,0.4); box-shadow: 0 0 0 3px rgba(239,68,68,0.07); }

        .adm-pw-wrap { position: relative; }
        .adm-pw-wrap .adm-input { padding-right: 44px; }

        .adm-eye {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: #4a4568;
          font-size: 16px; line-height: 1;
          padding: 4px;
          transition: color 150ms;
        }
        .adm-eye:hover { color: #9490b0; }

        .adm-btn {
          width: 100%;
          margin-top: 8px;
          padding: 13px;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.15em;
          cursor: pointer;
          transition: opacity 150ms, transform 100ms;
        }
        .adm-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .adm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .adm-hr {
          border: none;
          border-top: 1px solid #1a1726;
          margin: 24px 0 16px;
        }

        .adm-back {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #4a4568;
          font-size: 13px;
          text-decoration: none;
          transition: color 150ms;
        }
        .adm-back:hover { color: #9490b0; }
      `}</style>

      <div className="adm-page">
        <div className="adm-card">
          <div className="adm-badge">AGZ ADMİN PANELİ</div>
          <h1 className="adm-title">Yetkili Girişi</h1>
          <p className="adm-sub">Bu alan yalnızca yetkili personele açıktır.</p>

          {hata && <div className="adm-error">{hata}</div>}

          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="adm-group">
              <label className="adm-label" htmlFor="eposta">E-POSTA</label>
              <input
                id="eposta" type="email" className="adm-input"
                placeholder="admin@eposta.com"
                value={eposta} onChange={e => setEposta(e.target.value)}
                autoComplete="email" required
              />
            </div>

            <div className="adm-group">
              <label className="adm-label" htmlFor="sifre">ŞİFRE</label>
              <div className="adm-pw-wrap">
                <input
                  id="sifre" type={sifreGoster ? 'text' : 'password'} className="adm-input"
                  placeholder="············"
                  value={sifre} onChange={e => setSifre(e.target.value)}
                  autoComplete="current-password" required
                />
                <button type="button" className="adm-eye"
                  onClick={() => setSifreGoster(v => !v)}
                  aria-label={sifreGoster ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {sifreGoster ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" className="adm-btn" disabled={yukleniyor}>
              {yukleniyor ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP →'}
            </button>
          </form>

          <hr className="adm-hr" />

          <a href="/auth/login" className="adm-back">
            ← Kullanıcı girişine dön
          </a>
        </div>
      </div>
    </>
  );
}
