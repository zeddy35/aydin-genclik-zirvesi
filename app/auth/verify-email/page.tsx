'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendEmailVerification, reload } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase/config';

export default function VerifyEmailPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [gonderildi, setGonderildi] = useState(false);
  const [hata, setHata] = useState('');
  const [kontrol, setKontrol] = useState(false);

  // Redirect if already verified or not logged in
  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/auth/login'); return; }
    if (user.emailVerified) { router.replace('/panel'); }
  }, [user, loading, router]);

  // Poll every 4 seconds to detect when user clicks the verification link
  useEffect(() => {
    if (!user || user.emailVerified) return;
    const interval = setInterval(async () => {
      try {
        await reload(auth.currentUser!);
        if (auth.currentUser?.emailVerified) {
          router.replace('/panel');
        }
      } catch { /* ignore */ }
    }, 4000);
    return () => clearInterval(interval);
  }, [user, router]);

  const tekrarGonder = async () => {
    if (!user) return;
    setHata('');
    try {
      await sendEmailVerification(user);
      setGonderildi(true);
      setTimeout(() => setGonderildi(false), 60000); // re-enable after 60s
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/too-many-requests') {
        setHata('Çok fazla istek. Biraz bekleyin.');
      } else {
        setHata('E-posta gönderilemedi. Daha sonra tekrar deneyin.');
      }
    }
  };

  const dogrulaKontrol = async () => {
    if (!user) return;
    setKontrol(true);
    try {
      await reload(auth.currentUser!);
      if (auth.currentUser?.emailVerified) {
        router.replace('/panel');
      } else {
        setHata('E-posta henüz doğrulanmamış. Gelen kutunuzu kontrol edin.');
      }
    } catch {
      setHata('Kontrol sırasında hata oluştu.');
    } finally {
      setKontrol(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        maxWidth: 480, width: '100%', background: '#13111f',
        border: '1px solid #1e1a2e', borderRadius: 16, padding: '40px 32px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>

        <p style={{
          fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.3em',
          color: '#4a4568', textTransform: 'uppercase', marginBottom: 8,
        }}>
          ◈ E-POSTA DOĞRULAMA
        </p>

        <h1 style={{
          fontSize: 22, fontWeight: 800, color: '#d1cfe8',
          marginBottom: 12, lineHeight: 1.3,
        }}>
          E-postanı doğrula
        </h1>

        <p style={{ fontSize: 14, color: '#6b6485', lineHeight: 1.7, marginBottom: 8 }}>
          <strong style={{ color: '#9490b0' }}>{user.email}</strong> adresine
          doğrulama linki gönderdik.
        </p>
        <p style={{ fontSize: 13, color: '#4a4568', lineHeight: 1.7, marginBottom: 28 }}>
          Linke tıkladıktan sonra bu sayfa otomatik olarak yönlendirilecek.
        </p>

        {hata && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '10px 14px', color: '#fca5a5',
            fontSize: 13, marginBottom: 20,
          }}>
            {hata}
          </div>
        )}

        {gonderildi && (
          <div style={{
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 8, padding: '10px 14px', color: '#6ee7b7',
            fontSize: 13, marginBottom: 20,
          }}>
            ✓ Doğrulama e-postası tekrar gönderildi.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={dogrulaKontrol}
            disabled={kontrol}
            style={{
              background: '#7c3aed', color: '#fff', border: 'none',
              borderRadius: 10, padding: '13px', fontSize: 14,
              fontWeight: 700, cursor: 'pointer', opacity: kontrol ? 0.6 : 1,
            }}
          >
            {kontrol ? '⟳ Kontrol ediliyor...' : 'Doğruladım →'}
          </button>

          <button
            onClick={tekrarGonder}
            disabled={gonderildi}
            style={{
              background: 'none', color: gonderildi ? '#4a4568' : '#9490b0',
              border: '1px solid #2a2545', borderRadius: 10, padding: '13px',
              fontSize: 13, cursor: gonderildi ? 'not-allowed' : 'pointer',
            }}
          >
            {gonderildi ? 'E-posta gönderildi (60s)' : 'Tekrar gönder'}
          </button>

          <button
            onClick={() => signOut().then(() => router.push('/auth/login'))}
            style={{
              background: 'none', color: '#4a4568', border: 'none',
              fontSize: 12, cursor: 'pointer', padding: '8px',
            }}
          >
            Çıkış yap
          </button>
        </div>
      </div>
    </div>
  );
}
