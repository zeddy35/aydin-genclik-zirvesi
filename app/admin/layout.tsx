'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/admin/login') return; // giriş sayfasında yönlendirme yapma
    if (!loading && !user) router.replace('/admin/login');
    if (!loading && user && !isAdmin) router.replace('/panel');
  }, [user, isAdmin, loading, router, pathname]);

  if (pathname === '/admin/login') return <>{children}</>;

  if (loading || !user || !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 13, color: '#4a4568', letterSpacing: '0.3em' }}>YETKİ KONTROL EDİLİYOR...</div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', icon: '📊', label: 'Genel Bakış' },
    { href: '/admin/kullanicilar', icon: '👥', label: 'Kullanıcılar' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Share+Tech+Mono&display=swap');
        * { box-sizing: border-box; }
        .al-root { min-height: 100vh; background: #0a0a0f; display: flex; flex-direction: column; font-family: 'DM Sans', sans-serif; }
        .al-topbar { height: 56px; background: #13111f; border-bottom: 1px solid #1e1a2e; display: flex; align-items: center; padding: 0 20px; gap: 12px; flex-shrink: 0; position: sticky; top: 0; z-index: 100; }
        .al-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; color: #ef4444; letter-spacing: 0.05em; flex: 1; }
        .al-badge { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.2em; background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); border-radius: 4px; padding: 3px 8px; }
        .al-body { display: flex; flex: 1; }
        .al-sidebar { width: 220px; background: #13111f; border-right: 1px solid #1e1a2e; padding: 20px 12px; flex-shrink: 0; }
        @media (max-width: 768px) { .al-sidebar { display: none; } }
        .al-nav { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #6b6485; font-size: 14px; font-weight: 500; text-decoration: none; transition: all 150ms; border: 1px solid transparent; margin-bottom: 2px; }
        .al-nav:hover { background: rgba(255,255,255,0.03); color: #9490b0; }
        .al-nav.active { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.25); color: #f87171; }
        .al-nav-icon { font-size: 17px; width: 22px; text-align: center; }
        .al-content { flex: 1; overflow-y: auto; }
        .al-sep { border: none; border-top: 1px dashed #1e1a2e; margin: 12px 0; }
        .al-panel-link { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: #4a4568; font-size: 13px; text-decoration: none; border-radius: 6px; transition: all 150ms; }
        .al-panel-link:hover { background: rgba(255,255,255,0.02); color: #6b6485; }
      `}</style>

      <div className="al-root">
        <header className="al-topbar">
          <div className="al-logo">[ AGZ ADMIN ]</div>
          <span className="al-badge">ADMIN</span>
        </header>
        <div className="al-body">
          <nav className="al-sidebar">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={`al-nav ${pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)) ? 'active' : ''}`}>
                <span className="al-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <hr className="al-sep" />
            <Link href="/panel" className="al-panel-link">↩ Kullanıcı Paneli</Link>
          </nav>
          <main className="al-content">{children}</main>
        </div>
      </div>
    </>
  );
}
