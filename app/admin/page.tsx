'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminStats } from '@/lib/firebase/admin';
import type { AdminStats } from '@/lib/firebase/admin';

const DURUM_COLORS: Record<string, string> = {
  beklemede: '#f59e0b',
  inceleniyor: '#3b82f6',
  onaylandi: '#10b981',
  reddedildi: '#ef4444',
  bekleme_listesi: '#8b5cf6',
};
const DURUM_LABELS: Record<string, string> = {
  beklemede: 'Beklemede',
  inceleniyor: 'İnceleniyor',
  onaylandi: 'Onaylandi',
  reddedildi: 'Reddedildi',
  bekleme_listesi: 'Bekleme Listesi',
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [basvuruAcik, setBasvuruAcik] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    getAdminStats().then(setStats).finally(() => setLoading(false));
    fetch('/api/admin/settings/basvuru')
      .then(r => r.json())
      .then(d => setBasvuruAcik(d.acik))
      .catch(() => {});
  }, []);

  async function toggleBasvuru() {
    if (basvuruAcik === null || toggling) return;
    setToggling(true);
    try {
      const res = await fetch('/api/admin/settings/basvuru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acik: !basvuruAcik }),
      });
      const d = await res.json();
      setBasvuruAcik(d.acik);
    } finally {
      setToggling(false);
    }
  }

  const totalDurum = stats ? Object.values(stats.durumDagilimi).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="p-7 max-w-[1000px] mx-auto">
      <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.35em] text-[#4a4568] uppercase mb-1.5">◈ ADMIN PANELİ</p>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-7">
        <h1 className="font-[Lexend] font-extrabold text-[clamp(20px,4vw,30px)] text-[#d1cfe8]">Genel Bakış</h1>
        <button
          onClick={toggleBasvuru}
          disabled={basvuruAcik === null || toggling}
          className="flex items-center gap-2.5 px-[18px] py-2.5 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
          style={{
            background: basvuruAcik ? '#0d2b1a' : '#1a1a1a',
            border: `1px solid ${basvuruAcik ? '#10b981' : '#3a3060'}`,
          }}
        >
          <span className="relative inline-block w-[38px] h-5 rounded-[10px] flex-shrink-0 transition-colors duration-200"
            style={{ background: basvuruAcik ? '#10b981' : '#2a2545' }}>
            <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-[left] duration-200"
              style={{ left: basvuruAcik ? 20 : 2 }} />
          </span>
          <span className="font-[Share_Tech_Mono] text-[11px] tracking-[0.2em] uppercase"
            style={{ color: basvuruAcik ? '#10b981' : '#6b6485' }}>
            {toggling ? '...' : basvuruAcik ? 'Başvurular Açık' : 'Başvurular Kapalı'}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-3.5 mb-7">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-[100px] rounded-lg bg-gradient-to-r from-[#1e1a2e] via-[#2a2545] to-[#1e1a2e] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
          ))}
        </div>
      ) : stats && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3.5 mb-7">
            {[
              { val: stats.toplamKullanici,                   label: 'Toplam Başvuru', color: '#7c3aed' },
              { val: stats.toplamKisiSayisi,                  label: 'Toplam Kişi',   color: '#06b6d4' },
              { val: stats.hackathonKullanici,                label: 'Hackathon',     color: '#d4a843' },
              { val: stats.gamejamKullanici,                  label: 'Game Jam',      color: '#7c3aed' },
              { val: stats.durumDagilimi['onaylandi'] ?? 0,   label: 'Onaylanan',     color: '#10b981' },
            ].map(s => (
              <div key={s.label} className="bg-[#13111f] border border-[#1e1a2e] rounded-xl p-5 text-center relative overflow-hidden"
                style={{ borderTop: `3px solid ${s.color}` }}>
                <div className="font-[Lexend] font-extrabold text-[34px] mb-1" style={{ color: s.color }}>{s.val}</div>
                <div className="font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] text-[#6b6485] uppercase">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Status distribution */}
          <div className="bg-[#13111f] border border-[#1e1a2e] rounded-xl p-6 mb-5">
            <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.3em] text-[#4a4568] uppercase mb-5 pb-3 border-b border-dashed border-[#1e1a2e]">
              // DURUM DAĞILIMI
            </p>
            {Object.entries(stats.durumDagilimi).map(([key, cnt]) => (
              <div key={key} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-[13px]" style={{ color: DURUM_COLORS[key] }}>{DURUM_LABELS[key] ?? key}</span>
                  <span className="font-[Share_Tech_Mono] text-[12px] text-[#6b6485]">{cnt} / {totalDurum}</span>
                </div>
                <div className="bg-[#1e1a2e] rounded h-2 overflow-hidden">
                  <div className="h-full rounded transition-[width] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{ width: totalDurum ? `${(cnt/totalDurum)*100}%` : '0%', background: DURUM_COLORS[key] ?? '#6b6485' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recent registrations */}
          {stats.sonKayitlar.length > 0 && (
            <div className="bg-[#13111f] border border-[#1e1a2e] rounded-xl p-6 mb-5">
              <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.3em] text-[#4a4568] uppercase mb-5 pb-3 border-b border-dashed border-[#1e1a2e]">
                // SON KAYITLAR
              </p>
              {stats.sonKayitlar.map(k => (
                <Link key={k.uid} href={`/admin/kullanicilar/${k.uid}`}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-lg transition-colors duration-150 no-underline border border-transparent hover:bg-white/2 hover:border-[#1e1a2e] mb-1">
                  <div className="w-9 h-9 rounded-full bg-[#2a2545] border border-[#3a3060] flex items-center justify-center font-[Lexend] font-bold text-[13px] text-[#9490b0] flex-shrink-0">
                    {k.isim[0]}{k.soyisim[0]}
                  </div>
                  <span className="text-[14px] text-[#c8c4e0] font-medium flex-1">{k.isim} {k.soyisim}</span>
                  <span className="font-[Share_Tech_Mono] text-[10px] tracking-[0.15em] uppercase flex-shrink-0"
                    style={{ color: k.etkinlikTuru === 'hackathon' ? '#d4a843' : '#7c3aed' }}>
                    {k.etkinlikTuru === 'hackathon' ? '🔍 HACK' : '🎮 JAM'}
                  </span>
                  <span className="font-[Share_Tech_Mono] text-[10px] tracking-[0.1em] uppercase flex-shrink-0"
                    style={{ color: k.katilimTuru === 'takim' ? '#06b6d4' : '#64748b' }}>
                    {k.katilimTuru === 'takim' ? `👥 ${1 + (k.takimUyeleri?.length ?? 0)} KİŞİ` : '👤 BİREYSEL'}
                  </span>
                </Link>
              ))}
              <div className="mt-4 text-right">
                <Link href="/admin/kullanicilar" className="text-[13px] text-[#7c3aed] no-underline">Tüm kullanıcıları gör →</Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
