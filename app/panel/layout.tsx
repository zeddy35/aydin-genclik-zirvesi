'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getBasvuruDurumu } from '@/lib/firebase/basvuru';
import { FolderOpen, Search, Paperclip, Target, LogOut, Gamepad2, Lock } from 'lucide-react';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, kullanici, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [onaylandi, setOnaylandi] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/auth/login'); return; }
    if (!user.emailVerified && !kullanici?.betaTester) { router.replace('/auth/verify-email'); return; }
    getBasvuruDurumu(user.uid).then(doc => {
      const approved = doc?.durum === 'onaylandi';
      setOnaylandi(approved);
      const lockedPaths = ['/panel/belgelerim', '/panel/proje'];
      if (!approved && lockedPaths.some(p => pathname.startsWith(p))) {
        router.replace('/panel/durum');
      }
    });
  }, [user, kullanici, loading, router, pathname]);

  if (loading || !user || (!user.emailVerified && !kullanici?.betaTester)) {
    return (
      <div style={{ minHeight: '100vh', background: kullanici?.etkinlikTuru === 'hackathon' ? '#0c0900' : '#0d0b1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 13, color: '#6858a0', letterSpacing: '0.3em' }}>YÜKLENİYOR...</div>
      </div>
    );
  }

  const isHack  = kullanici?.etkinlikTuru === 'hackathon';
  const accent  = isHack ? '#e8c84a'               : '#a78bfa';
  const bg      = isHack ? '#0c0900'               : '#0d0b1a';
  const cardBg  = isHack ? '#140f02'               : '#131028';
  const border  = isHack ? 'rgba(196,154,40,0.18)' : 'rgba(124,58,237,0.2)';

  const navItems = [
    { href: '/panel',            icon: <FolderOpen size={17} />, label: 'Dosyam',       mono: 'GENEL',    locked: false },
    { href: '/panel/durum',      icon: <Search     size={17} />, label: 'Durum',        mono: 'DURUM',    locked: false },
    { href: '/panel/belgelerim', icon: <Paperclip  size={17} />, label: 'Belgelerim',   mono: 'DOSYALAR', locked: !onaylandi },
    { href: '/panel/proje',      icon: <Target     size={17} />, label: 'Proje Gönder', mono: 'PROJE',    locked: !onaylandi },
  ];

  const initials = kullanici
    ? `${kullanici.isim[0]}${kullanici.soyisim[0]}`.toUpperCase()
    : (user.email?.[0] ?? '?').toUpperCase();

  // ── GAME JAM: top topbar + bottom tab-bar ────────────────────────────────
  if (!isHack) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Share+Tech+Mono&display=swap');
          * { box-sizing: border-box; }
          .gj-root { min-height: 100vh; background: ${bg}; display: flex; flex-direction: column; font-family: 'DM Sans', sans-serif; }

          /* topbar */
          .gj-topbar { height: 56px; background: ${cardBg}; border-bottom: 1px solid ${border}; display: flex; align-items: center; padding: 0 24px; gap: 12px; flex-shrink: 0; position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 8px rgba(0,0,0,0.4); }
          .gj-logo { font-family: 'Lexend', sans-serif; font-weight: 800; font-size: 15px; letter-spacing: 0.05em; flex: 1; }
          .gj-logo-blue   { color: #5BC8F5; }
          .gj-logo-purple { color: #a78bfa; }
          .gj-user { display: flex; align-items: center; gap: 10px; }
          .gj-user-name { font-size: 13px; font-weight: 500; color: #c4b8f5; line-height: 1.2; }
          .gj-user-tag  { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.2em; color: #a78bfa; text-transform: uppercase; display: flex; align-items: center; gap: 3px; }
          @media (max-width: 480px) { .gj-user-name { display: none; } }
          .gj-avatar { width: 34px; height: 34px; border-radius: 50%; background: rgba(167,139,250,0.15); border: 1.5px solid #a78bfa; display: flex; align-items: center; justify-content: center; font-family: 'Lexend', sans-serif; font-weight: 800; font-size: 13px; color: #a78bfa; flex-shrink: 0; }
          .gj-logout-btn { background: none; border: none; cursor: pointer; color: #6858a0; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 150ms; }
          .gj-logout-btn:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

          /* bottom tab-bar */
          .gj-tabbar { background: ${cardBg}; border-top: 1px solid ${border}; display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; box-shadow: 0 -2px 16px rgba(0,0,0,0.5); padding-bottom: env(safe-area-inset-bottom); }
          .gj-tab { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; flex: 1; padding: 8px 4px; color: #6858a0; font-size: 10px; font-weight: 600; text-decoration: none; border-top: 2px solid transparent; transition: all 150ms; letter-spacing: 0.03em; text-transform: uppercase; font-family: 'Share Tech Mono', monospace; min-width: 0; line-height: 1; }
          .gj-tab:hover { color: #9080c0; background: rgba(167,139,250,0.05); }
          .gj-tab.active { color: #a78bfa; border-top-color: #a78bfa; background: rgba(167,139,250,0.08); }
          .gj-tab.locked { opacity: 0.35; cursor: not-allowed; pointer-events: none; }
          .gj-tab-icon { flex-shrink: 0; display: flex; align-items: center; justify-content: center; line-height: 0; }
          .gj-tab-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; text-align: center; }
          @media (max-width: 360px) { .gj-tab-label { display: none; } .gj-tab { padding: 12px 4px; } }

          /* content */
          .gj-content { flex: 1; padding-bottom: calc(64px + env(safe-area-inset-bottom)); }
        `}</style>

        <div className="gj-root">
          <header className="gj-topbar">
            <div className="gj-logo">
              <span className="gj-logo-blue">AYDIN </span>
              <span className="gj-logo-purple">Gençlik </span>
              <span className="gj-logo-blue">Zirvesi</span>
            </div>
            <div className="gj-user">
              {kullanici && (
                <div style={{ textAlign: 'right' }}>
                  <div className="gj-user-name">{kullanici.isim} {kullanici.soyisim}</div>
                  <div className="gj-user-tag"><Gamepad2 size={9} />Game Jam</div>
                </div>
              )}
              <div className="gj-avatar">{initials}</div>
              <button className="gj-logout-btn" onClick={() => signOut().then(() => router.push('/auth/login'))} aria-label="Çıkış Yap">
                <LogOut size={16} />
              </button>
            </div>
          </header>

          <main className="gj-content">
            {children}
          </main>

          <nav className="gj-tabbar">
            {navItems.map(item => (
              item.locked ? (
                <span key={item.href} className="gj-tab locked">
                  <span className="gj-tab-icon"><Lock size={17} /></span>
                  <span className="gj-tab-label">{item.mono}</span>
                </span>
              ) : (
                <Link key={item.href} href={item.href} className={`gj-tab${pathname === item.href ? ' active' : ''}`}>
                  <span className="gj-tab-icon">{item.icon}</span>
                  <span className="gj-tab-label">{item.mono}</span>
                </Link>
              )
            ))}
          </nav>
        </div>
      </>
    );
  }

  // ── HACKATHON: icon rail layout ───────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Share+Tech+Mono&display=swap');
        * { box-sizing: border-box; }
        .hk-root { min-height: 100vh; background: ${bg}; display: flex; font-family: 'DM Sans', sans-serif; }

        /* icon rail */
        .hk-rail { width: 56px; background: ${cardBg}; border-right: 1px solid ${border}; display: flex; flex-direction: column; align-items: center; padding: 12px 0; position: fixed; top: 0; bottom: 0; left: 0; z-index: 100; box-shadow: 1px 0 8px rgba(0,0,0,0.4); }
        .hk-rail-logo { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #c49a28, #e8c84a); display: flex; align-items: center; justify-content: center; font-family: 'Lexend', sans-serif; font-weight: 800; font-size: 15px; color: #0c0900; margin-bottom: 20px; flex-shrink: 0; letter-spacing: -0.02em; }
        .hk-rail-divider { width: 28px; height: 1px; background: ${border}; margin-bottom: 8px; }
        .hk-rail-nav { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; width: 100%; padding: 0 8px; }
        .hk-rail-btn { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #706030; background: none; border: none; cursor: pointer; text-decoration: none; transition: all 150ms; position: relative; flex-shrink: 0; line-height: 0; }
        .hk-rail-btn:hover { background: rgba(196,154,40,0.12); color: #c49a28; }
        .hk-rail-btn.active { background: rgba(196,154,40,0.18); color: ${accent}; box-shadow: inset 0 0 0 1px rgba(196,154,40,0.35); }
        .hk-rail-btn.active::before { content: ''; position: absolute; left: -8px; top: 50%; transform: translateY(-50%); width: 3px; height: 20px; background: ${accent}; border-radius: 0 3px 3px 0; }
        .hk-rail-btn.locked { opacity: 0.3; cursor: not-allowed; pointer-events: none; }
        .hk-rail-btn::after { content: attr(data-tip); position: absolute; left: calc(100% + 12px); top: 50%; transform: translateY(-50%); background: #1a1200; color: #f5edd0; font-size: 12px; font-family: 'DM Sans', sans-serif; font-weight: 500; padding: 5px 10px; border-radius: 7px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 120ms; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        .hk-rail-btn:hover::after { opacity: 1; }
        .hk-rail-footer { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 8px 0 0; border-top: 1px solid ${border}; width: 100%; }
        .hk-rail-avatar { width: 32px; height: 32px; border-radius: 50%; background: rgba(196,154,40,0.15); border: 1.5px solid ${accent}; display: flex; align-items: center; justify-content: center; font-family: 'Lexend', sans-serif; font-weight: 800; font-size: 12px; color: ${accent}; cursor: default; position: relative; }
        .hk-rail-avatar::after { content: attr(data-tip); position: absolute; left: calc(100% + 12px); top: 50%; transform: translateY(-50%); background: #1a1200; color: #f5edd0; font-size: 12px; font-family: 'DM Sans', sans-serif; font-weight: 500; padding: 5px 10px; border-radius: 7px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 120ms; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        .hk-rail-avatar:hover::after { opacity: 1; }
        .hk-rail-logout { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #706030; background: none; border: none; cursor: pointer; transition: all 150ms; position: relative; line-height: 0; }
        .hk-rail-logout:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
        .hk-rail-logout::after { content: 'Çıkış Yap'; position: absolute; left: calc(100% + 12px); top: 50%; transform: translateY(-50%); background: #1a1200; color: #f5edd0; font-size: 12px; font-family: 'DM Sans', sans-serif; font-weight: 500; padding: 5px 10px; border-radius: 7px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 120ms; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        .hk-rail-logout:hover::after { opacity: 1; }

        /* content */
        .hk-content { flex: 1; margin-left: 56px; overflow-y: auto; min-height: 100vh; }

        /* mobile: bottom tab bar */
        @media (max-width: 640px) {
          .hk-rail { display: none; }
          .hk-content { margin-left: 0; padding-bottom: calc(60px + env(safe-area-inset-bottom)); }
          .hk-mob-bar { display: flex !important; }
        }
        .hk-mob-bar { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: ${cardBg}; border-top: 1px solid ${border}; padding-bottom: env(safe-area-inset-bottom); box-shadow: 0 -2px 16px rgba(0,0,0,0.5); }
        .hk-mob-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 8px 4px; text-decoration: none; color: #706030; font-size: 9px; font-family: 'Share Tech Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase; border-top: 2px solid transparent; transition: all 150ms; line-height: 0; }
        .hk-mob-tab span { line-height: 1; }
        .hk-mob-tab.active { color: ${accent}; border-top-color: ${accent}; background: rgba(196,154,40,0.06); }
        .hk-mob-tab.locked { opacity: 0.3; cursor: not-allowed; }
      `}</style>

      <div className="hk-root">
        <nav className="hk-rail">
          <div className="hk-rail-logo">A</div>
          <div className="hk-rail-divider" />
          <div className="hk-rail-nav">
            {navItems.map(item => (
              item.locked ? (
                <span key={item.href} className="hk-rail-btn locked" data-tip={item.label}>
                  <Lock size={17} />
                </span>
              ) : (
                <Link key={item.href} href={item.href} className={`hk-rail-btn${pathname === item.href ? ' active' : ''}`} data-tip={item.label}>
                  {item.icon}
                </Link>
              )
            ))}
          </div>
          <div className="hk-rail-footer">
            <div className="hk-rail-avatar" data-tip={kullanici ? `${kullanici.isim} ${kullanici.soyisim}` : (user.email ?? '')}>{initials}</div>
            <button className="hk-rail-logout" onClick={() => signOut().then(() => router.push('/auth/login'))}>
              <LogOut size={16} />
            </button>
          </div>
        </nav>

        <main className="hk-content">
          {children}
        </main>

        <nav className="hk-mob-bar">
          {navItems.map(item => (
            item.locked ? (
              <span key={item.href} className="hk-mob-tab locked">
                <Lock size={17} />
                <span>{item.mono}</span>
              </span>
            ) : (
              <Link key={item.href} href={item.href} className={`hk-mob-tab${pathname === item.href ? ' active' : ''}`}>
                {item.icon}
                <span>{item.mono}</span>
              </Link>
            )
          ))}
        </nav>
      </div>
    </>
  );
}
