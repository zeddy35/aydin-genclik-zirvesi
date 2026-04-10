'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { bulkUpdateDurum } from '@/lib/firebase/admin';
import type { KullaniciWithDurum } from '@/lib/firebase/admin';
import { useAuth } from '@/contexts/AuthContext';
import type { BasvuruDurumu } from '@/lib/firebase/types';

const DURUM_COLORS: Record<string, string> = {
  beklemede: '#f59e0b', inceleniyor: '#3b82f6', onaylandi: '#10b981', reddedildi: '#ef4444', bekleme_listesi: '#8b5cf6',
};
const DURUM_TR: Record<string, string> = {
  beklemede: 'Beklemede', inceleniyor: 'İnceleniyor', onaylandi: 'Onaylandı', reddedildi: 'Reddedildi', bekleme_listesi: 'Bekleme L.',
};

const inputCls = 'bg-[#13111f] border border-[#2a2545] rounded-lg px-3.5 py-2.5 text-[#d1cfe8] font-[Lexend] text-sm outline-none transition-[border-color] duration-150 placeholder:text-[#3d3660] focus:border-violet-600';
const selectCls = `${inputCls} text-[#9490b0] cursor-pointer [&_option]:bg-[#13111f]`;

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
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/kullanicilar?limit=200', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error('Unauthorized');
      const json = await res.json();
      setList(json.users as KullaniciWithDurum[]);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

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
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/basvuru/bulk-durum', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body:    JSON.stringify({ uids: Array.from(selected), durum: bulkDurum }),
      });
      setMsg(res.ok ? `${selected.size} kullanıcı güncellendi.` : 'Güncelleme başarısız.');
    } catch {
      setMsg('Güncelleme başarısız.');
    }
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
    <div className="p-7">
      <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.35em] text-[#4a4568] uppercase mb-1.5">◈ KULLANICI YÖNETİMİ</p>
      <h1 className="font-[Lexend] font-extrabold text-[clamp(20px,4vw,30px)] text-[#d1cfe8] mb-5">
        Kullanıcılar{' '}
        <span className="font-[Share_Tech_Mono] text-base text-[#4a4568]">({filtered.length})</span>
      </h1>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap items-center mb-5">
        <input className={`${inputCls} flex-1 min-w-[200px]`} placeholder="🔍  İsim, e-posta, üniversite ara..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className={selectCls} value={filterEv} onChange={e => setFilterEv(e.target.value as typeof filterEv)}>
          <option value="tumu">Tüm Etkinlikler</option>
          <option value="hackathon">🔍 Hackathon</option>
          <option value="gamejam">🎮 Game Jam</option>
        </select>
        <select className={selectCls} value={filterDurum} onChange={e => setFilterDurum(e.target.value)}>
          <option value="tumu">Tüm Durumlar</option>
          {Object.entries(DURUM_TR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="bg-transparent border border-[#2a2545] rounded-lg px-3.5 py-2.5 text-[#6b6485] text-sm cursor-pointer transition-all duration-150 hover:border-[#4a3572] hover:text-[#9490b0]"
          onClick={exportCSV}>⬇ CSV</button>
      </div>

      {msg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3.5 py-2.5 text-emerald-300 text-sm mb-3.5">{msg}</div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bg-[#13111f] border border-violet-600 rounded-xl px-[18px] py-3.5 mb-4 flex items-center gap-3.5 flex-wrap">
          <span className="text-sm text-violet-300 font-semibold">{selected.size} kullanıcı seçildi</span>
          <select className="bg-[#0d0b18] border border-[#2a2545] rounded-md px-2.5 py-1.5 text-[#9490b0] text-sm outline-none [&_option]:bg-[#13111f]"
            value={bulkDurum} onChange={e => setBulkDurum(e.target.value as BasvuruDurumu)}>
            {Object.entries(DURUM_TR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button className="bg-violet-700 text-white border-none rounded-md px-4 py-2 text-sm cursor-pointer transition-opacity duration-150 hover:opacity-85 disabled:opacity-50"
            disabled={bulkLoading} onClick={handleBulk}>
            {bulkLoading ? '⟳ Güncelleniyor...' : 'Toplu Güncelle'}
          </button>
          <button className="bg-transparent border border-[#2a2545] text-[#6b6485] rounded-md px-3.5 py-2 text-sm cursor-pointer"
            onClick={() => setSelected(new Set())}>İptal</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#13111f] border border-[#1e1a2e] rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12 font-[Share_Tech_Mono] text-xs tracking-[0.3em] text-[#4a4568]">YÜKLENİYOR...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#4a4568]">Kullanıcı bulunamadı.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-3.5 py-3 text-left font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] text-[#4a4568] uppercase border-b border-[#1e1a2e] whitespace-nowrap">
                  <input type="checkbox" className="accent-violet-600" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
                </th>
                <th className="px-3.5 py-3 text-left font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] text-[#4a4568] uppercase border-b border-[#1e1a2e] whitespace-nowrap">Kullanıcı</th>
                <th className="px-3.5 py-3 text-left font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] text-[#4a4568] uppercase border-b border-[#1e1a2e] whitespace-nowrap hidden md:table-cell">Üniversite</th>
                <th className="px-3.5 py-3 text-left font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] text-[#4a4568] uppercase border-b border-[#1e1a2e] whitespace-nowrap">Etkinlik</th>
                <th className="px-3.5 py-3 text-left font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] text-[#4a4568] uppercase border-b border-[#1e1a2e] whitespace-nowrap">Durum</th>
                <th className="px-3.5 py-3 border-b border-[#1e1a2e]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => {
                const durumKey = k.basvuruDurumu ?? 'beklemede';
                return (
                  <tr key={k.uid} className="group">
                    <td className="px-3.5 py-3 border-b border-[#0f0d1a] align-middle group-last:border-b-0 group-hover:bg-white/[0.01]">
                      <input type="checkbox" className="accent-violet-600" checked={selected.has(k.uid)} onChange={() => toggleSelect(k.uid)} />
                    </td>
                    <td className="px-3.5 py-3 border-b border-[#0f0d1a] align-middle group-last:border-b-0 group-hover:bg-white/[0.01]">
                      <div className="text-sm text-[#c8c4e0] font-medium">{k.isim} {k.soyisim}</div>
                      <div className="text-xs text-[#6b6485] mt-0.5">{k.eposta}</div>
                    </td>
                    <td className="px-3.5 py-3 border-b border-[#0f0d1a] align-middle group-last:border-b-0 group-hover:bg-white/[0.01] text-[13px] text-[#8b85a8] hidden md:table-cell">{k.universite}</td>
                    <td className="px-3.5 py-3 border-b border-[#0f0d1a] align-middle group-last:border-b-0 group-hover:bg-white/[0.01]">
                      <span className="font-[Share_Tech_Mono] text-[10px] tracking-[0.12em] px-2 py-0.5 rounded"
                        style={{ background: k.etkinlikTuru === 'hackathon' ? 'rgba(212,168,67,0.15)' : 'rgba(124,58,237,0.15)', color: k.etkinlikTuru === 'hackathon' ? '#d4a843' : '#c4b5fd' }}>
                        {k.etkinlikTuru === 'hackathon' ? 'HACK' : 'JAM'}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-[#0f0d1a] align-middle group-last:border-b-0 group-hover:bg-white/[0.01]">
                      <span className="font-[Share_Tech_Mono] text-[10px] tracking-[0.12em] px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: DURUM_COLORS[durumKey] + '20', color: DURUM_COLORS[durumKey] }}>
                        {DURUM_TR[durumKey] ?? durumKey}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-[#0f0d1a] align-middle group-last:border-b-0 group-hover:bg-white/[0.01]">
                      <Link href={`/admin/kullanicilar/${k.uid}`} className="text-xs text-violet-500 no-underline hover:text-violet-300">Detay →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
