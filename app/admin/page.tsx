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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Share+Tech+Mono&display=swap');
        .ap-page { padding: 28px; max-width: 1000px; margin: 0 auto; }
        .ap-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.35em; color: #4a4568; text-transform: uppercase; margin-bottom: 6px; }
        .ap-title { font-family: 'Lexend', sans-serif; font-weight: 800; font-size: clamp(20px,4vw,30px); color: #d1cfe8; margin-bottom: 28px; }
        .ap-stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); gap: 14px; margin-bottom: 28px; }
        .ap-stat { background: #13111f; border: 1px solid #1e1a2e; border-radius: 12px; padding: 20px; text-align: center; position: relative; overflow: hidden; }
        .ap-stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
        .ap-stat-val { font-family: 'Lexend', sans-serif; font-weight: 800; font-size: 34px; color: #d1cfe8; margin-bottom: 4px; }
        .ap-stat-label { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: #6b6485; text-transform: uppercase; }
        .ap-card { background: #13111f; border: 1px solid #1e1a2e; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
        .ap-sec-label { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.3em; color: #4a4568; text-transform: uppercase; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px dashed #1e1a2e; }
        .ap-bar-row { margin-bottom: 12px; }
        .ap-bar-top { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .ap-bar-name { font-size: 13px; color: #9490b0; }
        .ap-bar-count { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #6b6485; }
        .ap-bar-bg { background: #1e1a2e; border-radius: 4px; height: 8px; overflow: hidden; }
        .ap-bar { height: 100%; border-radius: 4px; transition: width 600ms cubic-bezier(0.4,0,0.2,1); }
        .ap-usr-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 8px; transition: background 150ms; text-decoration: none; border: 1px solid transparent; margin-bottom: 4px; }
        .ap-usr-row:hover { background: rgba(255,255,255,0.02); border-color: #1e1a2e; }
        .ap-usr-avatar { width: 36px; height: 36px; border-radius: 50%; background: #2a2545; border: 1.5px solid #3a3060; display: flex; align-items: center; justify-content: center; font-family: 'Lexend', sans-serif; font-weight: 700; font-size: 13px; color: #9490b0; flex-shrink: 0; }
        .ap-usr-name { font-size: 14px; color: #c8c4e0; font-weight: 500; flex: 1; }
        .ap-usr-ev { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.15em; margin-left: auto; flex-shrink: 0; text-transform: uppercase; }
        .ap-skeleton { background: linear-gradient(90deg, #1e1a2e 25%, #2a2545 50%, #1e1a2e 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; height: 20px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <div className="ap-page">
        <p className="ap-eyebrow">◈ ADMIN PANELİ</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <h1 className="ap-title" style={{ margin: 0 }}>Genel Bakış</h1>
          <button
            onClick={toggleBasvuru}
            disabled={basvuruAcik === null || toggling}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              background: basvuruAcik ? '#0d2b1a' : '#1a1a1a',
              border: `1px solid ${basvuruAcik ? '#10b981' : '#3a3060'}`,
              borderRadius: 8, padding: '10px 18px', transition: 'all 200ms',
              opacity: basvuruAcik === null ? 0.5 : 1,
            }}
          >
            <span style={{
              width: 38, height: 20, borderRadius: 10, position: 'relative',
              background: basvuruAcik ? '#10b981' : '#2a2545',
              transition: 'background 200ms', display: 'inline-block', flexShrink: 0,
            }}>
              <span style={{
                position: 'absolute', top: 2, left: basvuruAcik ? 20 : 2,
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                transition: 'left 200ms',
              }} />
            </span>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 11, letterSpacing: '0.2em', color: basvuruAcik ? '#10b981' : '#6b6485', textTransform: 'uppercase' }}>
              {toggling ? '...' : basvuruAcik ? 'Başvurular Açık' : 'Başvurular Kapalı'}
            </span>
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            {[1,2,3,4].map(i => <div key={i} className="ap-skeleton" style={{ height: 100 }} />)}
          </div>
        ) : stats && (
          <>
            <div className="ap-stat-grid">
              {[
                { val: stats.toplamKullanici, label: 'Toplam Kayıt', color: '#7c3aed' },
                { val: stats.hackathonKullanici, label: 'Hackathon', color: '#d4a843' },
                { val: stats.gamejamKullanici, label: 'Game Jam', color: '#7c3aed' },
                { val: stats.durumDagilimi['onaylandi'] ?? 0, label: 'Onaylanan', color: '#10b981' },
              ].map(s => (
                <div key={s.label} className="ap-stat" style={{ borderTop: `3px solid ${s.color}` }}>
                  <div className="ap-stat-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="ap-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="ap-card">
              <p className="ap-sec-label">// DURUM DAĞILIMI</p>
              {Object.entries(stats.durumDagilimi).map(([key, cnt]) => (
                <div key={key} className="ap-bar-row">
                  <div className="ap-bar-top">
                    <span className="ap-bar-name" style={{ color: DURUM_COLORS[key] }}>{DURUM_LABELS[key] ?? key}</span>
                    <span className="ap-bar-count">{cnt} / {totalDurum}</span>
                  </div>
                  <div className="ap-bar-bg">
                    <div className="ap-bar" style={{ width: totalDurum ? `${(cnt/totalDurum)*100}%` : '0%', background: DURUM_COLORS[key] ?? '#6b6485' }} />
                  </div>
                </div>
              ))}
            </div>

            {stats.sonKayitlar.length > 0 && (
              <div className="ap-card">
                <p className="ap-sec-label">// SON KAYITLAR</p>
                {stats.sonKayitlar.map(k => (
                  <Link key={k.uid} href={`/admin/kullanicilar/${k.uid}`} className="ap-usr-row">
                    <div className="ap-usr-avatar">{k.isim[0]}{k.soyisim[0]}</div>
                    <span className="ap-usr-name">{k.isim} {k.soyisim}</span>
                    <span className="ap-usr-ev" style={{ color: k.etkinlikTuru === 'hackathon' ? '#d4a843' : '#7c3aed' }}>
                      {k.etkinlikTuru === 'hackathon' ? '🔍 HACK' : '🎮 JAM'}
                    </span>
                  </Link>
                ))}
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <Link href="/admin/kullanicilar" style={{ font: '13px DM Sans, sans-serif', color: '#7c3aed', textDecoration: 'none' }}>Tüm kullanıcıları gör →</Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
