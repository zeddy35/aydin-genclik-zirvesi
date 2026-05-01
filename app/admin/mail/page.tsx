'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { KullaniciWithDurum } from '@/lib/firebase/admin';

const DURUM_COLORS: Record<string, string> = {
  beklemede: '#f59e0b', inceleniyor: '#3b82f6', onaylandi: '#10b981', reddedildi: '#ef4444', bekleme_listesi: '#8b5cf6',
};
const DURUM_TR: Record<string, string> = {
  beklemede: 'Beklemede', inceleniyor: 'İnceleniyor', onaylandi: 'Onaylandı', reddedildi: 'Reddedildi', bekleme_listesi: 'Bekleme L.',
};

const inputCls = 'bg-[#13111f] border border-[#2a2545] rounded-lg px-3.5 py-2.5 text-[#d1cfe8] font-[Lexend] text-sm outline-none transition-[border-color] duration-150 placeholder:text-[#3d3660] focus:border-violet-600';

export default function MailPage() {
  const { user } = useAuth();
  const [list, setList] = useState<KullaniciWithDurum[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adminNotu, setAdminNotu] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [filterDurum, setFilterDurum] = useState<'tumu' | 'beklemede' | 'bekleme_listesi'>('beklemede');

  const fetchData = async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/kullanicilar?limit=200', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setList(json.users as KullaniciWithDurum[]);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  // Only hackathon users shown here
  const hackathonUsers = list.filter(k => k.etkinlikTuru === 'hackathon');
  const onaylananKisi = hackathonUsers
    .filter(k => k.basvuruDurumu === 'onaylandi')
    .reduce((acc, k) => acc + (k.katilimTuru === 'takim' ? 1 + (k.takimUyeleri?.length ?? 0) : 1), 0);

  const filtered = hackathonUsers.filter(k => {
    if (filterDurum === 'tumu') return true;
    return (k.basvuruDurumu ?? 'beklemede') === filterDurum;
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

  const handleSendMail = async () => {
    if (!user || selected.size === 0) return;
    setSending(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/mail/kapasite-bildirimi', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body:    JSON.stringify({ uids: Array.from(selected), adminNotu: adminNotu || undefined }),
      });
      const json = await res.json();
      if (res.ok) {
        setMsg({ text: `${json.sent} kullanıcıya mail gönderildi.${json.failed > 0 ? ` ${json.failed} başarısız.` : ''}`, ok: true });
        setSelected(new Set());
      } else {
        setMsg({ text: 'Mail gönderilemedi.', ok: false });
      }
    } catch {
      setMsg({ text: 'Mail gönderilemedi.', ok: false });
    }
    setSending(false);
    setTimeout(() => setMsg(null), 5000);
  };

  return (
    <div className="p-7">
      <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.35em] text-[#4a4568] uppercase mb-1.5">◈ TOPLU BİLDİRİM</p>
      <h1 className="font-[Lexend] font-extrabold text-[clamp(20px,4vw,30px)] text-[#d1cfe8] mb-5">
        Mail Yönetimi
      </h1>

      {/* Kapasite özeti */}
      <div className="bg-[#13111f] border border-[#1e1a2e] rounded-xl p-5 mb-6">
        <p className="font-[Share_Tech_Mono] text-[10px] tracking-[0.25em] text-[#4a4568] uppercase mb-3">◈ HACKATHon KAPASİTE DURUMU</p>
        <div className="flex gap-6 flex-wrap">
          <div>
            <div className="font-[Share_Tech_Mono] text-[26px] font-bold text-[#d4a843]">{hackathonUsers.length}</div>
            <div className="text-xs text-[#6b6485] mt-0.5">Toplam Başvuru</div>
          </div>
          <div>
            <div className="font-[Share_Tech_Mono] text-[26px] font-bold text-emerald-400">{onaylananKisi}</div>
            <div className="text-xs text-[#6b6485] mt-0.5">Onaylanan Kişi</div>
          </div>
          <div>
            <div className="font-[Share_Tech_Mono] text-[26px] font-bold text-amber-400">
              {hackathonUsers.filter(k => (k.basvuruDurumu ?? 'beklemede') === 'beklemede').length}
            </div>
            <div className="text-xs text-[#6b6485] mt-0.5">Beklemede</div>
          </div>
          <div>
            <div className="font-[Share_Tech_Mono] text-[26px] font-bold text-violet-400">
              {hackathonUsers.filter(k => k.basvuruDurumu === 'bekleme_listesi').length}
            </div>
            <div className="text-xs text-[#6b6485] mt-0.5">Bekleme Listesi</div>
          </div>
        </div>

        <div className="mt-4 bg-amber-500/10 border border-amber-500/25 rounded-lg px-4 py-3">
          <p className="text-sm text-amber-300 font-semibold mb-1">⚠️ Kontenjan Durumu</p>
          <p className="text-xs text-[#9490b0] leading-relaxed">
            Hackathon etkinliği için kişi/takım kontenjanı dolmuştur. Aşağıdan beklemedeki veya bekleme listesindeki
            hackathon başvurucularını seçerek kapasite dolu bildirim maili gönderebilirsiniz.
          </p>
        </div>
      </div>

      {/* Mail gönder kutusu */}
      <div className="bg-[#13111f] border border-[#1e1a2e] rounded-xl p-5 mb-6">
        <p className="font-[Share_Tech_Mono] text-[10px] tracking-[0.25em] text-[#4a4568] uppercase mb-3">◈ KAPASİTE DOLU BİLDİRİMİ</p>
        <p className="text-sm text-[#6b6485] mb-4 leading-relaxed">
          Seçili kullanıcılara hackathon kontenjanının dolduğunu bildiren otomatik mail gönderilir.
          İsteğe bağlı ek not ekleyebilirsiniz.
        </p>
        <textarea
          className={`${inputCls} w-full min-h-[80px] resize-y mb-3`}
          placeholder="İsteğe bağlı ek not (kullanıcıya gösterilir)..."
          value={adminNotu}
          onChange={e => setAdminNotu(e.target.value)}
        />
        {msg && (
          <div className={`rounded-lg px-3.5 py-2.5 text-sm mb-3 ${msg.ok ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>
            {msg.text}
          </div>
        )}
        {selected.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-violet-300 font-semibold">{selected.size} kullanıcı seçildi</span>
            <button
              className="bg-amber-600 text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer transition-opacity duration-150 hover:opacity-85 disabled:opacity-50"
              disabled={sending}
              onClick={handleSendMail}
            >
              {sending ? '⟳ Gönderiliyor...' : '✉ Kapasite Dolu Maili Gönder'}
            </button>
            <button
              className="bg-transparent border border-[#2a2545] text-[#6b6485] rounded-lg px-3.5 py-2.5 text-sm cursor-pointer"
              onClick={() => setSelected(new Set())}
            >
              İptal
            </button>
          </div>
        )}
      </div>

      {/* Tablo */}
      <div className="flex gap-3 items-center mb-4 flex-wrap">
        <span className="text-sm text-[#9490b0] font-medium">Filtrele:</span>
        {(['beklemede', 'bekleme_listesi', 'tumu'] as const).map(d => (
          <button
            key={d}
            onClick={() => setFilterDurum(d)}
            className={`font-[Share_Tech_Mono] text-[10px] tracking-[0.12em] px-3 py-1.5 rounded-full border transition-all duration-150 cursor-pointer ${
              filterDurum === d
                ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                : 'border-[#2a2545] text-[#4a4568] hover:border-[#4a3572] hover:text-[#6b6485]'
            }`}
          >
            {d === 'tumu' ? 'TÜMÜ' : d === 'beklemede' ? 'BEKLEMEDe' : 'BEKLEME LİSTESİ'}
          </button>
        ))}
        <span className="font-[Share_Tech_Mono] text-[10px] text-[#4a4568] ml-auto">
          {filtered.length} kullanıcı
        </span>
      </div>

      <div className="bg-[#13111f] border border-[#1e1a2e] rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12 font-[Share_Tech_Mono] text-xs tracking-[0.3em] text-[#4a4568]">YÜKLENİYOR...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#4a4568]">Bu filtrede kullanıcı yok.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-3.5 py-3 text-left font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] text-[#4a4568] uppercase border-b border-[#1e1a2e]">
                  <input type="checkbox" className="accent-violet-600" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
                </th>
                <th className="px-3.5 py-3 text-left font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] text-[#4a4568] uppercase border-b border-[#1e1a2e]">Kullanıcı</th>
                <th className="px-3.5 py-3 text-left font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] text-[#4a4568] uppercase border-b border-[#1e1a2e] hidden md:table-cell">Üniversite</th>
                <th className="px-3.5 py-3 text-left font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] text-[#4a4568] uppercase border-b border-[#1e1a2e] hidden sm:table-cell">Katılım</th>
                <th className="px-3.5 py-3 text-left font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] text-[#4a4568] uppercase border-b border-[#1e1a2e]">Durum</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => {
                const durumKey = k.basvuruDurumu ?? 'beklemede';
                return (
                  <tr key={k.uid} className="group cursor-pointer" onClick={() => toggleSelect(k.uid)}>
                    <td className="px-3.5 py-3 border-b border-[#0f0d1a] align-middle group-last:border-b-0 group-hover:bg-white/[0.01]">
                      <input type="checkbox" className="accent-violet-600" checked={selected.has(k.uid)} onChange={() => {}} />
                    </td>
                    <td className="px-3.5 py-3 border-b border-[#0f0d1a] align-middle group-last:border-b-0 group-hover:bg-white/[0.01]">
                      <div className="text-sm text-[#c8c4e0] font-medium">{k.isim} {k.soyisim}</div>
                      <div className="text-xs text-[#6b6485] mt-0.5">{k.eposta}</div>
                    </td>
                    <td className="px-3.5 py-3 border-b border-[#0f0d1a] align-middle group-last:border-b-0 group-hover:bg-white/[0.01] text-[13px] text-[#8b85a8] hidden md:table-cell">{k.universite}</td>
                    <td className="px-3.5 py-3 border-b border-[#0f0d1a] align-middle group-last:border-b-0 group-hover:bg-white/[0.01] hidden sm:table-cell">
                      {k.katilimTuru === 'takim' ? (
                        <div>
                          <span className="font-[Share_Tech_Mono] text-[10px] tracking-[0.12em] px-2 py-0.5 rounded bg-[rgba(6,182,212,0.12)] text-[#06b6d4]">TAKIM</span>
                          <span className="font-[Share_Tech_Mono] text-[10px] text-[#4a4568] ml-1.5">{1 + (k.takimUyeleri?.length ?? 0)} kişi</span>
                        </div>
                      ) : (
                        <span className="font-[Share_Tech_Mono] text-[10px] tracking-[0.12em] px-2 py-0.5 rounded bg-[rgba(100,116,139,0.12)] text-[#94a3b8]">BİREYSEL</span>
                      )}
                    </td>
                    <td className="px-3.5 py-3 border-b border-[#0f0d1a] align-middle group-last:border-b-0 group-hover:bg-white/[0.01]">
                      <span className="font-[Share_Tech_Mono] text-[10px] tracking-[0.12em] px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: DURUM_COLORS[durumKey] + '20', color: DURUM_COLORS[durumKey] }}>
                        {DURUM_TR[durumKey] ?? durumKey}
                      </span>
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
