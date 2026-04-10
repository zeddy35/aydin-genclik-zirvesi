'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart2, Users, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/admin/login') return;
    if (!loading && !user) router.replace('/admin/login');
    if (!loading && user && !isAdmin) router.replace('/panel');
  }, [user, isAdmin, loading, router, pathname]);

  if (pathname === '/admin/login') return <>{children}</>;

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="font-[Share_Tech_Mono] text-[13px] text-[#4a4568] tracking-[0.3em]">
          YETKİ KONTROL EDİLİYOR...
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin',             icon: <BarChart2 size={17} />, label: 'Genel Bakış' },
    { href: '/admin/kullanicilar', icon: <Users size={17} />,    label: 'Kullanıcılar' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col font-[Lexend]">
      {/* Topbar */}
      <header className="h-14 bg-[#13111f] border-b border-[#1e1a2e] flex items-center px-5 gap-3 flex-shrink-0 sticky top-0 z-50">
        <div className="font-[Lexend] font-extrabold text-[15px] tracking-wide flex-1">
          <span className="text-[#5BC8F5]">AYDIN </span>
          <span className="text-[#9240CC]">Gençlik </span>
          <span className="text-[#5BC8F5]">Zirvesi</span>
        </div>
        <span className="font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] bg-red-500/15 text-red-400 border border-red-500/30 rounded px-2 py-0.5">
          ADMIN
        </span>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-[220px] bg-[#13111f] border-r border-[#1e1a2e] p-5 flex-shrink-0 hidden md:block">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-150 border mb-0.5 ${
                  isActive
                    ? 'bg-red-500/8 border-red-500/25 text-red-400'
                    : 'text-[#6b6485] border-transparent hover:bg-white/3 hover:text-[#9490b0]'
                }`}
              >
                <span className="w-[22px] flex items-center justify-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          <hr className="border-none border-t border-dashed border-[#1e1a2e] my-3" />

          <Link href="/panel" className="flex items-center gap-2 px-3 py-2 text-[#4a4568] text-[13px] no-underline rounded-md transition-all duration-150 hover:bg-white/2 hover:text-[#6b6485]">
            <LogOut size={13} /> Kullanıcı Paneli
          </Link>
        </nav>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
