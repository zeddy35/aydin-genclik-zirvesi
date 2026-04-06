'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { getAllKullanicilarWithDurum, bulkUpdateDurum } from '@/lib/firebase/admin';
import type { KullaniciWithDurum } from '@/lib/firebase/admin';
import { useAuth } from '@/contexts/AuthContext';
import type { BasvuruDurumu } from '@/lib/firebase/types';

const DURUM_COLORS: Record<string, string> = {
  beklemede: '#f59e0b', inceleniyor: '#3b82f6', onaylandi: '#10b981', reddedildi: '#ef4444', bekleme_listesi: '#8b5cf6',
};
const DURUM_TR: Record<string, string> = {
  beklemede: 'Beklemede', inceleniyor: 'İnceleniyor', onaylandi: 'Onaylandı', reddedildi: 'Reddedildi', bekleme_listesi: 'Bekleme L.',
};

export default function KullanicilarPage() {
  const { user } = useAuth();
  const [list, setList] = useState<KullaniciWithDurum[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEv, setFilterEv] = useState<'tumu' | 'hackathon' | 'gamejam'>('tumu');
  const [filterDurum, setFilterDurum] = useState('tumu');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDurum, setBulkDurum] = useState<BasvuruDurumu>('inceleniyor');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    const data = await getAllKullanicilarWithDurum();
    setList(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = list.filter(k => {
    const q = search.toLowerCase();
    const matchSearch = !q || k.isim.toLowerCase().includes(q) || k.soyisim.toLowerCase().includes(q) || k.eposta.toLowerCase().includes(q) || k.universite.toLowerCase().includes(q);
    const matchEv = filterEv === 'tumu' || k.etkinlikTuru === filterEv;
    const matchDurum = filterDurum === 'tumu' || (k.basvuruDurumu ?? 'beklemede') === filterDurum;
    return matchSearch && matchEv && matchDurum;
  });

  const toggleSelect = (uid: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(uid)) n.delete(uid); else n.add(uid);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(k => k.uid)));
  };

  const handleBulk = async () => {
    if (!user || selected.size === 0) return;
    setBulkLoading(true);
    await bulkUpdateDurum(Array.from(selected), bulkDurum, user.uid);
    setMsg(`${selected.size} kullanıcı güncellendi.`);
    setSelected(new Set());
    await fetchData();
    setBulkLoading(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const exportCSV = () => {
    const BOM = '\uFEFF';
    const header = 'İsim,Soyisim,E-posta,Üniversite,Etkinlik,Katılım,Durum\n';
    const rows = filtered.map(k =>
      [`"${k.isim}"`, `"${k.soyisim}"`, `"${k.eposta}"`, `"${k.universite}"`, k.etkinlikTuru, k.katilimTuru, k.basvuruDurumu ?? 'beklemede'].join(',')
    ).join('\n');
    const blob = new Blob([BOM + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'kullanicilar.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Share+Tech+Mono&display=swap');
        .kp-page { padding: 28px; }
        .kp-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.35em; color: #4a4568; text-transform: uppercase; margin-bottom: 6px; }
        .kp-title { font-family: 'Lexend', sans-serif; font-weight: 800; font-size: clamp(20px,4vw,30px); color: #d1cfe8; margin-bottom: 20px; }
        .kp-toolbar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 20px; }
        .kp-search { flex: 1; min-width: 200px; background: #13111f; border: 1px solid #2a2545; border-radius: 8px; padding: 9px 14px; color: #d1cfe8; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; }
        .kp-search:focus { border-color: #7c3aed; }
        .kp-search::placeholder { color: #3d3660; }
        .kp-filter { background: #13111f; border: 1px solid #2a2545; border-radius: 8px; padding: 9px 12px; color: #9490b0; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; cursor: pointer; }
        .kp-filter option { background: #13111f; }
        .kp-export { background: none; border: 1px solid #2a2545; border-radius: 8px; padding: 9px 14px; color: #6b6485; font-size: 13px; cursor: pointer; transition: all 150ms; font-family: 'DM Sans', sans-serif; }
        .kp-export:hover { border-color: #4a3572; color: #9490b0; }
        .kp-bulk-bar { background: #13111f; border: 1px solid #7c3aed; border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .kp-bulk-info { font-size: 14px; color: #c4b5fd; font-weight: 600; }
        .kp-bulk-sel { background: #0d0b18; border: 1px solid #2a2545; border-radius: 6px; padding: 6px 10px; color: #9490b0; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; }
        .kp-bulk-btn { background: #7c3aed; color: #fff; border: none; border-radius: 6px; padding: 8px 16px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 150ms; }
        .kp-bulk-btn:hover:not(:disabled) { opacity: 0.85; }
        .kp-bulk-cancel { background: none; border: 1px solid #2a2545; color: #6b6485; border-radius: 6px; padding: 8px 14px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .kp-table-wrap { background: #13111f; border: 1px solid #1e1a2e; border-radius: 12px; overflow: hidden; }
        .kp-table { width: 100%; border-collapse: collapse; }
        .kp-th { padding: 12px 14px; text-align: left; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: #4a4568; text-transform: uppercase; border-bottom: 1px solid #1e1a2e; white-space: nowrap; }
        .kp-td { padding: 12px 14px; border-bottom: 1px solid #0f0d1a; vertical-align: middle; }
        .kp-tr:last-child .kp-td { border-bottom: none; }
        .kp-tr:hover .kp-td { background: rgba(255,255,255,0.01); }
        .kp-name { font-size: 14px; color: #c8c4e0; font-weight: 500; }
        .kp-email { font-size: 12px; color: #6b6485; margin-top: 2px; }
        .kp-ev-badge { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.12em; padding: 3px 8px; border-radius: 4px; display: inline-block; }
        .kp-durum-badge { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.12em; padding: 3px 8px; border-radius: 12px; display: inline-block; white-space: nowrap; }
        .kp-link { font-size: 12px; color: #7c3aed; text-decoration: none; }
        .kp-link:hover { color: #c4b5fd; }
        .kp-cb { accent-color: #7c3aed; }
        .kp-msg-ok { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 10px 14px; color: #6ee7b7; font-size: 13px; margin-bottom: 14px; }
        .kp-empty { text-align: center; padding: 48px; color: #4a4568; font-size: 14px; }
        @media (max-width: 768px) { .kp-hide { display: none; } }
      `}</style>

      <div className="kp-page">
        <p className="kp-eyebrow">◈ KULLANICI YÖNETİMİ</p>
        <h1 className="kp-title">Kullanıcılar <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 16, color: '#4a4568' }}>({filtered.length})</span></h1>

        <div className="kp-toolbar">
          <input className="kp-search" placeholder="🔍  İsim, e-posta, üniversite ara..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="kp-filter" value={filterEv} onChange={e => setFilterEv(e.target.value as typeof filterEv)}>
            <option value="tumu">Tüm Etkinlikler</option>
            <option value="hackathon">🔍 Hackathon</option>
            <option value="gamejam">🎮 Game Jam</option>
          </select>
          <select className="kp-filter" value={filterDurum} onChange={e => setFilterDurum(e.target.value)}>
            <option value="tumu">Tüm Durumlar</option>
            {Object.entries(DURUM_TR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button className="kp-export" onClick={exportCSV}>⬇ CSV</button>
        </div>

        {msg && <div className="kp-msg-ok">{msg}</div>}

        {selected.size > 0 && (
          <div className="kp-bulk-bar">
            <span className="kp-bulk-info">{selected.size} kullanıcı seçildi</span>
            <select className="kp-bulk-sel" value={bulkDurum} onChange={e => setBulkDurum(e.target.value as BasvuruDurumu)}>
              {Object.entries(DURUM_TR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button className="kp-bulk-btn" disabled={bulkLoading} onClick={handleBulk}>{bulkLoading ? '⟳ Güncelleniyor...' : 'Toplu Güncelle'}</button>
            <button className="kp-bulk-cancel" onClick={() => setSelected(new Set())}>İptal</button>
          </div>
        )}

        <div className="kp-table-wrap">
          {loading ? (
            <div className="kp-empty" style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 12, letterSpacing: '0.3em' }}>YÜKLENİYOR...</div>
          ) : filtered.length === 0 ? (
            <div className="kp-empty">Kullanıcı bulunamadı.</div>
          ) : (
            <table className="kp-table">
              <thead>
                <tr>
                  <th className="kp-th"><input type="checkbox" className="kp-cb" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                  <th className="kp-th">Kullanıcı</th>
                  <th className="kp-th kp-hide">Üniversite</th>
                  <th className="kp-th">Etkinlik</th>
                  <th className="kp-th">Durum</th>
                  <th className="kp-th"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(k => {
                  const durumKey = k.basvuruDurumu ?? 'beklemede';
                  return (
                    <tr key={k.uid} className="kp-tr">
                      <td className="kp-td"><input type="checkbox" className="kp-cb" checked={selected.has(k.uid)} onChange={() => toggleSelect(k.uid)} /></td>
                      <td className="kp-td">
                        <div className="kp-name">{k.isim} {k.soyisim}</div>
                        <div className="kp-email">{k.eposta}</div>
                      </td>
                      <td className="kp-td kp-hide" style={{ color: '#8b85a8', fontSize: 13 }}>{k.universite}</td>
                      <td className="kp-td">
                        <span className="kp-ev-badge" style={{ background: k.etkinlikTuru === 'hackathon' ? 'rgba(212,168,67,0.15)' : 'rgba(124,58,237,0.15)', color: k.etkinlikTuru === 'hackathon' ? '#d4a843' : '#c4b5fd' }}>
                          {k.etkinlikTuru === 'hackathon' ? 'HACK' : 'JAM'}
                        </span>
                      </td>
                      <td className="kp-td">
                        <span className="kp-durum-badge" style={{ background: DURUM_COLORS[durumKey] + '20', color: DURUM_COLORS[durumKey] }}>
                          {DURUM_TR[durumKey] ?? durumKey}
                        </span>
                      </td>
                      <td className="kp-td">
                        <Link href={`/admin/kullanicilar/${k.uid}`} className="kp-link">Detay →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
