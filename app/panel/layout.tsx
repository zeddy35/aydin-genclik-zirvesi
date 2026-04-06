'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FolderOpen, Search, Paperclip, Target, LogOut, Gamepad2, X } from 'lucide-react';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, kullanici, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuAcik, setMenuAcik] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/auth/login'); return; }
    if (!user.emailVerified) { router.replace('/auth/verify-email'); }
  }, [user, loading, router]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAcik(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading || !user || !user.emailVerified) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 13, color: '#4a4568', letterSpacing: '0.3em' }}>YÜKLENİYOR...</div>
      </div>
    );
  }

  const isHack = kullanici?.etkinlikTuru === 'hackathon';
  const accent = isHack ? '#d4a843' : '#7c3aed';

  const navItems = [
    { href: '/panel', icon: <FolderOpen size={17} />, label: 'Dosyam', mono: 'GENEL' },
    { href: '/panel/durum', icon: <Search size={17} />, label: 'Durum Sorgula', mono: 'DURUM' },
    { href: '/panel/belgelerim', icon: <Paperclip size={17} />, label: 'Belgelerim', mono: 'DOSYALAR' },
    { href: '/panel/proje', icon: <Target size={17} />, label: 'Proje Gönder', mono: 'PROJE' },
  ];

  const initials = kullanici
    ? `${kullanici.isim[0]}${kullanici.soyisim[0]}`.toUpperCase()
    : (user.email?.[0] ?? '?').toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Share+Tech+Mono&display=swap');
        * { box-sizing: border-box; }
        .pl-root { min-height: 100vh; background: ; display: flex; flex-direction: column; font-family: 'DM Sans', sans-serif; }
        .pl-topbar { height: 56px; background: #13111f; border-bottom: 1px solid #1e1a2e; display: flex; align-items: center; padding: 0 20px; gap: 12px; flex-shrink: 0; position: sticky; top: 0; z-index: 100; }
        .pl-logo { font-family: 'Lexend', sans-serif; font-weight: 800; font-size: 15px; letter-spacing: 0.05em; flex: 1; }
        .pl-logo-blue { color: #5BC8F5; }
        .pl-logo-purple { color: #9240CC; }
        .pl-avatar { width: 34px; height: 34px; border-radius: 50%; background: ${isHack ? 'rgba(212,168,67,0.2)' : 'rgba(124,58,237,0.2)'}; border: 1.5px solid ${accent}; display: flex; align-items: center; justify-content: center; font-family: 'Lexend', sans-serif; font-weight: 800; font-size: 13px; color: ${accent}; }
        .pl-hamburger { background: none; border: none; cursor: pointer; padding: 6px; display: flex; flex-direction: column; gap: 4px; }
        .pl-hamburger span { display: block; width: 22px; height: 2px; background: #9490b0; border-radius: 2px; transition: all 200ms; }
        .pl-body { display: flex; flex: 1; }
        .pl-sidebar { width: 240px; background: #13111f; border-right: 1px solid #1e1a2e; display: flex; flex-direction: column; padding: 20px 12px; flex-shrink: 0; }
        @media (max-width: 768px) { .pl-sidebar { display: none; } }
        .pl-side-profile { padding: 14px 12px; margin-bottom: 16px; background: #0d0b18; border-radius: 10px; border: 1px solid #1e1a2e; }
        .pl-side-name { font-family: 'Lexend', sans-serif; font-weight: 700; font-size: 14px; color: #d1cfe8; margin-bottom: 2px; }
        .pl-side-ev { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: ${accent}; text-transform: uppercase; }
        .pl-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #6b6485; font-size: 14px; font-weight: 500; text-decoration: none; transition: all 150ms; border: 1px solid transparent; margin-bottom: 2px; }
        .pl-nav-item:hover { background: rgba(255,255,255,0.03); color: #9490b0; }
        .pl-nav-item.active { background: ${isHack ? 'rgba(212,168,67,0.1)' : 'rgba(124,58,237,0.1)'}; border-color: ${isHack ? 'rgba(212,168,67,0.3)' : 'rgba(124,58,237,0.3)'}; color: ${accent}; }
        .pl-nav-icon { font-size: 17px; width: 22px; text-align: center; }
        .pl-nav-mono { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.2em; color: inherit; margin-left: auto; opacity: 0.6; display: none; }
        .pl-nav-item.active .pl-nav-mono { display: block; }
        .pl-side-footer { margin-top: auto; padding-top: 16px; border-top: 1px dashed #1e1a2e; }
        .pl-logout { width: 100%; background: none; border: none; color: #4a4568; font-size: 13px; cursor: pointer; padding: 8px 12px; border-radius: 6px; text-align: left; transition: all 150ms; display: flex; align-items: center; gap: 8px; font-family: 'DM Sans', sans-serif; }
        .pl-logout:hover { background: rgba(239,68,68,0.08); color: #f87171; }
        .pl-content { flex: 1; overflow-y: auto; }
        .pl-mob-drawer { position: fixed; inset: 0; z-index: 200; }
        .pl-mob-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); }
        .pl-mob-panel { position: absolute; top: 0; left: 0; bottom: 0; width: 280px; background: #13111f; border-right: 1px solid #1e1a2e; padding: 20px 16px; display: flex; flex-direction: column; animation: slideIn 200ms ease; }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .pl-mob-close { position: absolute; top: 16px; right: 16px; background: none; border: none; cursor: pointer; color: #6b6485; font-size: 20px; }
      `}</style>

      <div className="pl-root">
        <header className="pl-topbar">
          <button className="pl-hamburger" style={{ display: 'none' }} id="pl-ham-btn" onClick={() => setMenuAcik(true)} aria-label="Menü">
            <span /><span /><span />
          </button>
          <style>{`@media(max-width:768px){#pl-ham-btn{display:flex!important}}`}</style>
          <div className="pl-logo">
            <span className="pl-logo-blue">AYDIN </span>
            <span className="pl-logo-purple">Gençlik </span>
            <span className="pl-logo-blue">Zirvesi</span>
          </div>
        </header>

        <div className="pl-body">
          <nav className="pl-sidebar">
            <div className="pl-side-profile">
              <div className="pl-side-name">{kullanici ? `${kullanici.isim} ${kullanici.soyisim}` : user.email}</div>
              <div className="pl-side-ev" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{isHack ? <Search size={11} /> : <Gamepad2 size={11} />}{isHack ? ' Hackathon' : ' Game Jam'} · {kullanici?.katilimTuru === 'takim' ? 'Takım' : 'Bireysel'}</div>
            </div>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={`pl-nav-item ${pathname === item.href ? 'active' : ''}`}>
                <span className="pl-nav-icon">{item.icon}</span>
                {item.label}
                <span className="pl-nav-mono">{item.mono}</span>
              </Link>
            ))}
            <div className="pl-side-footer">
              <button className="pl-logout" onClick={() => signOut().then(() => router.push('/auth/login'))}>
                <LogOut size={14} /> Çıkış Yap
              </button>
            </div>
          </nav>

          <main className="pl-content">
            {children}
          </main>
        </div>

        {menuAcik && (
          <div className="pl-mob-drawer" ref={menuRef}>
            <div className="pl-mob-overlay" onClick={() => setMenuAcik(false)} />
            <div className="pl-mob-panel">
              <button className="pl-mob-close" onClick={() => setMenuAcik(false)}><X size={20} /></button>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
                  <span style={{ color: '#5BC8F5' }}>AYDIN </span>
                  <span style={{ color: '#9240CC' }}>Gençlik </span>
                  <span style={{ color: '#5BC8F5' }}>Zirvesi</span>
                </div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: '#6b6485', letterSpacing: '0.2em' }}>
                  {kullanici ? `${kullanici.isim} ${kullanici.soyisim}` : user.email}
                </div>
              </div>
              {navItems.map(item => (
                <Link key={item.href} href={item.href} className={`pl-nav-item ${pathname === item.href ? 'active' : ''}`} onClick={() => setMenuAcik(false)}>
                  <span className="pl-nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
