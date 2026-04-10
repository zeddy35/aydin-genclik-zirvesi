'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getBasvuruDurumu } from '@/lib/firebase/basvuru';
import { FolderOpen, Search, Paperclip, Target, LogOut, Gamepad2, Lock } from 'lucide-react';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, kullanici, loading, signOut } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [onaylandi, setOnaylandi] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/auth/login'); return; }
    if (!user.emailVerified && !kullanici?.betaTester) { router.replace('/auth/verify-email'); return; }
    getBasvuruDurumu(user.uid).then(doc => {
      const approved = doc?.durum === 'onaylandi';
      setOnaylandi(approved);
      if (!approved && ['/panel/belgelerim', '/panel/proje'].some(p => pathname.startsWith(p))) {
        router.replace('/panel/durum');
      }
    });
  }, [user, kullanici, loading, router, pathname]);

  if (loading || !user || (!user.emailVerified && !kullanici?.betaTester)) {
    const loadBg = kullanici?.etkinlikTuru === 'hackathon' ? '#0c0900' : '#0d0b1a';
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: loadBg }}>
        <div className="font-[Share_Tech_Mono] text-[13px] text-[#6858a0] tracking-[0.3em]">YÜKLENİYOR...</div>
      </div>
    );
  }

  const isHack  = kullanici?.etkinlikTuru === 'hackathon';
  const accent  = isHack ? '#e8c84a'               : '#a78bfa';
  const bg      = isHack ? '#0c0900'               : '#0d0b1a';
  const cardBg  = isHack ? '#140f02'               : '#131028';
  const border  = isHack ? 'rgba(196,154,40,0.18)' : 'rgba(124,58,237,0.2)';
  const textDim = isHack ? '#706030'               : '#6858a0';

  const navItems = [
    { href: '/panel',            icon: <FolderOpen size={17} />, label: 'Dosyam',       mono: 'GENEL',    locked: false },
    { href: '/panel/durum',      icon: <Search     size={17} />, label: 'Durum',        mono: 'DURUM',    locked: false },
    { href: '/panel/belgelerim', icon: <Paperclip  size={17} />, label: 'Belgelerim',   mono: 'DOSYALAR', locked: !onaylandi },
    { href: '/panel/proje',      icon: <Target     size={17} />, label: 'Proje Gönder', mono: 'PROJE',    locked: !onaylandi },
  ];

  const initials = kullanici
    ? `${kullanici.isim[0]}${kullanici.soyisim[0]}`.toUpperCase()
    : (user.email?.[0] ?? '?').toUpperCase();

  /* ── Game Jam layout ──────────────────────────────────────── */
  if (!isHack) {
    return (
      <div className="min-h-screen flex flex-col font-[Lexend]" style={{ background: bg }}>
        {/* Topbar */}
        <header className="h-14 flex items-center px-6 gap-3 flex-shrink-0 sticky top-0 z-50 shadow-[0_1px_8px_rgba(0,0,0,0.4)]"
          style={{ background: cardBg, borderBottom: `1px solid ${border}` }}>
          <div className="font-[Lexend] font-extrabold text-[15px] tracking-wide flex-1">
            <span className="text-[#5BC8F5]">AYDIN </span>
            <span style={{ color: accent }}>Gençlik </span>
            <span className="text-[#5BC8F5]">Zirvesi</span>
          </div>
          <div className="flex items-center gap-2.5">
            {kullanici && (
              <div className="text-right hidden sm:block">
                <div className="text-[13px] font-medium text-[#c4b8f5]">{kullanici.isim} {kullanici.soyisim}</div>
                <div className="flex items-center justify-end gap-1 font-[Share_Tech_Mono] text-[9px] tracking-[0.2em] uppercase" style={{ color: accent }}>
                  <Gamepad2 size={9} /> Game Jam
                </div>
              </div>
            )}
            <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-[Lexend] font-extrabold text-[13px] flex-shrink-0"
              style={{ background: `${accent}25`, border: `1.5px solid ${accent}`, color: accent }}>
              {initials}
            </div>
            <button onClick={() => signOut().then(() => router.push('/auth/login'))} aria-label="Çıkış Yap"
              className="flex items-center justify-center p-1.5 rounded-md transition-all duration-150 hover:bg-red-500/10 hover:text-red-400"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: textDim }}>
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 pb-[calc(64px+env(safe-area-inset-bottom))]">{children}</main>

        {/* Bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex shadow-[0_-2px_16px_rgba(0,0,0,0.5)]"
          style={{ background: cardBg, borderTop: `1px solid ${border}`, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {navItems.map(item => item.locked ? (
            <span key={item.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 font-[Share_Tech_Mono] text-[10px] tracking-wide uppercase opacity-35 cursor-not-allowed border-t-2 border-transparent"
              style={{ color: textDim }}>
              <span className="flex items-center justify-center leading-none"><Lock size={17} /></span>
              <span className="whitespace-nowrap overflow-hidden text-ellipsis text-center">{item.mono}</span>
            </span>
          ) : (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 font-[Share_Tech_Mono] text-[10px] tracking-wide uppercase no-underline border-t-2 transition-all duration-150"
              style={pathname === item.href
                ? { color: accent, borderTopColor: accent, background: `${accent}0d` }
                : { color: textDim, borderTopColor: 'transparent' }}>
              <span className="flex items-center justify-center leading-none">{item.icon}</span>
              <span className="whitespace-nowrap overflow-hidden text-ellipsis text-center">{item.mono}</span>
            </Link>
          ))}
        </nav>
      </div>
    );
  }

  /* ── Hackathon layout ─────────────────────────────────────── */
  return (
    <>
      <style>{`
        .hk-rail-btn { position: relative; }
        .hk-rail-btn.hk-active::before {
          content: ''; position: absolute; left: -8px; top: 50%; transform: translateY(-50%);
          width: 3px; height: 20px; border-radius: 0 3px 3px 0;
          background: ${accent};
        }
        .hk-tip::after {
          content: attr(data-tip); position: absolute; left: calc(100% + 12px); top: 50%; transform: translateY(-50%);
          background: #1a1200; color: #f5edd0; font-size: 12px; font-family: 'Lexend', sans-serif; font-weight: 500;
          padding: 5px 10px; border-radius: 7px; white-space: nowrap;
          opacity: 0; pointer-events: none; transition: opacity 120ms;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 200;
        }
        .hk-tip:hover::after { opacity: 1; }
      `}</style>

      <div className="min-h-screen flex font-[Lexend]" style={{ background: bg }}>
        {/* Icon rail */}
        <nav className="hidden sm:flex w-14 flex-col items-center py-3 fixed top-0 bottom-0 left-0 z-50 shadow-[1px_0_8px_rgba(0,0,0,0.4)]"
          style={{ background: cardBg, borderRight: `1px solid ${border}` }}>
          {/* Logo */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-[Lexend] font-extrabold text-[15px] text-[#0c0900] mb-5 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#c49a28,#e8c84a)' }}>
            A
          </div>
          <div className="w-7 h-px mb-2 flex-shrink-0" style={{ background: border }} />

          {/* Nav */}
          <div className="flex flex-col items-center gap-1 flex-1 w-full px-2">
            {navItems.map(item => item.locked ? (
              <span key={item.href}
                className="hk-rail-btn hk-tip w-10 h-10 rounded-xl flex items-center justify-center opacity-30 cursor-not-allowed leading-none"
                style={{ color: textDim }} data-tip={item.label}>
                <Lock size={17} />
              </span>
            ) : (
              <Link key={item.href} href={item.href} data-tip={item.label}
                className={`hk-rail-btn hk-tip w-10 h-10 rounded-xl flex items-center justify-center no-underline leading-none transition-all duration-150 ${pathname === item.href ? 'hk-active' : ''}`}
                style={pathname === item.href
                  ? { background: `${accent}25`, color: accent, boxShadow: `inset 0 0 0 1px ${accent}55` }
                  : { color: textDim, background: 'none' }}>
                {item.icon}
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center gap-1.5 pt-2 w-full" style={{ borderTop: `1px solid ${border}` }}>
            <div className="hk-tip w-8 h-8 rounded-full flex items-center justify-center font-[Lexend] font-extrabold text-xs leading-none cursor-default"
              style={{ background: `${accent}20`, border: `1.5px solid ${accent}`, color: accent }}
              data-tip={kullanici ? `${kullanici.isim} ${kullanici.soyisim}` : (user.email ?? '')}>
              {initials}
            </div>
            <button onClick={() => signOut().then(() => router.push('/auth/login'))}
              className="hk-tip w-9 h-9 rounded-lg flex items-center justify-center leading-none transition-all duration-150 hover:bg-red-500/10 hover:!text-red-400"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: textDim }}
              data-tip="Çıkış Yap">
              <LogOut size={16} />
            </button>
          </div>
        </nav>

        <main className="flex-1 sm:ml-14 overflow-y-auto min-h-screen pb-[calc(60px+env(safe-area-inset-bottom))] sm:pb-0">
          {children}
        </main>

        {/* Mobile bottom bar */}
        <nav className="flex sm:hidden fixed bottom-0 left-0 right-0 z-50 shadow-[0_-2px_16px_rgba(0,0,0,0.5)]"
          style={{ background: cardBg, borderTop: `1px solid ${border}`, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {navItems.map(item => item.locked ? (
            <span key={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 font-[Share_Tech_Mono] text-[9px] tracking-wider uppercase opacity-30 cursor-not-allowed border-t-2 border-transparent leading-none"
              style={{ color: textDim }}>
              <Lock size={17} /><span>{item.mono}</span>
            </span>
          ) : (
            <Link key={item.href} href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 font-[Share_Tech_Mono] text-[9px] tracking-wider uppercase no-underline border-t-2 transition-all duration-150 leading-none"
              style={pathname === item.href
                ? { color: accent, borderTopColor: accent, background: `${accent}0a` }
                : { color: textDim, borderTopColor: 'transparent' }}>
              {item.icon}<span>{item.mono}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
