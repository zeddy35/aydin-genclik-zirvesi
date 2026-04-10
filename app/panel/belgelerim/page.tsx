'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminBelgeler } from '@/lib/firebase/belgeler';
import type { Belge } from '@/lib/firebase/types';
import { Medal, Award, Trophy, Folder, Inbox, FileText, Download, Loader2 } from 'lucide-react';

const BELGE_LABELS: Record<string, string> = {
  katilim_sertifikasi: 'Katılım Sertifikası',
  finalist_belgesi: 'Finalist Belgesi',
  odul_belgesi: 'Ödül Belgesi',
  diger: 'Diğer',
};

const BELGE_ICONS: Record<string, React.ReactNode> = {
  katilim_sertifikasi: <Medal size={24} />,
  finalist_belgesi: <Award size={24} />,
  odul_belgesi: <Trophy size={24} />,
  diger: <Folder size={24} />,
};

export default function BelgelerimPage() {
  const { user, kullanici } = useAuth();
  const [belgeler, setBelgeler] = useState<Belge[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!user) return;
    getAdminBelgeler(user.uid).then(list => {
      setBelgeler(list);
      setLoading(false);
    });
  }, [user]);

  const handleDownload = async (belge: Belge) => {
    if (!user) return;
    setDownloadingId(belge.id);
    setHata('');
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/belgeler/download?belgeId=${belge.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('İndirme linki alınamadı.');
      const { downloadUrl } = await res.json();
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = belge.dosyaAdi;
      a.click();
    } catch {
      setHata('Belge indirilemedi. Lütfen tekrar deneyin.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (!user) return null;

  const isHack    = kullanici?.etkinlikTuru === 'hackathon';
  const accent    = isHack ? '#e8c84a'               : '#a78bfa';
  const cardBg    = isHack ? '#140f02'               : '#131028';
  const innerBg   = isHack ? '#1c1500'               : '#1a1638';
  const border    = isHack ? 'rgba(196,154,40,0.18)' : 'rgba(124,58,237,0.2)';
  const borderHov = isHack ? 'rgba(232,200,74,0.4)'  : 'rgba(167,139,250,0.4)';
  const textPri   = isHack ? '#fff5d0'               : '#ede8ff';
  const textSub   = isHack ? '#ddc880'               : '#c4b8f5';
  const textDim   = isHack ? '#706030'               : '#6858a0';

  return (
    <div className="p-7 max-w-[760px] mx-auto">
      <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.35em] uppercase mb-1.5" style={{ color: textDim }}>
        ◈ BELGELERİM
      </p>
      <h1 className="font-[Lexend] font-extrabold text-[clamp(20px,4vw,30px)] mb-2" style={{ color: textPri }}>
        Belgelerim
      </h1>
      <p className="text-[14px] leading-relaxed mb-7" style={{ color: isHack ? '#6a5c30' : '#7a7295' }}>
        Etkinlik sonrası sana atanan sertifika ve belgeler burada görünür. İndirmek için ilgili belgenin yanındaki butona tıkla.
      </p>

      {hata && (
        <div className="bg-red-500/6 border border-red-500/20 rounded-lg px-3.5 py-2.5 text-red-500 text-[13px] mb-4">{hata}</div>
      )}

      <div className="rounded-xl p-6 mb-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
        <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.3em] uppercase mb-[18px] pb-3 border-b border-dashed" style={{ color: textDim, borderColor: border }}>
          // SERTİFİKALAR & BELGELER
        </p>

        {loading ? (
          <div className="text-center py-8 font-[Share_Tech_Mono] text-xs tracking-[0.3em]" style={{ color: textDim }}>YÜKLENİYOR...</div>
        ) : belgeler.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="flex items-center justify-center mb-3" style={{ color: textDim }}><Inbox size={40} /></div>
            <div className="font-[Lexend] text-base mb-1.5" style={{ color: isHack ? '#6a5c30' : '#7a7295' }}>Henüz belge yok</div>
            <div className="text-[13px] leading-relaxed" style={{ color: textDim }}>
              Etkinlik tamamlandıktan sonra katılım sertifikan ve<br />
              varsa finalist / ödül belgen burada görünecek.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {belgeler.map(b => (
              <div key={b.id} className="flex items-center gap-3.5 px-[18px] py-4 rounded-[10px] border transition-[border-color] duration-150"
                style={{ background: innerBg, border: `1px solid ${border}` }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = borderHov)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = border)}>
                <span className="flex items-center leading-none flex-shrink-0" style={{ color: accent }}>
                  {BELGE_ICONS[b.belgeTuru] ?? <FileText size={24} />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] uppercase mb-0.5" style={{ color: accent }}>
                    {BELGE_LABELS[b.belgeTuru] ?? b.belgeTuru}
                  </div>
                  <div className="text-[13px] whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: textSub }}>{b.dosyaAdi}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: textDim }}>{(b.dosyaBoyutu / 1024).toFixed(0)} KB</div>
                </div>
                <button
                  className="flex-shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold font-[Lexend] cursor-pointer transition-all duration-150 border disabled:opacity-50 disabled:cursor-default"
                  style={{
                    background: isHack ? 'rgba(196,154,40,0.1)' : 'rgba(124,58,237,0.08)',
                    border: `1px solid ${isHack ? 'rgba(196,154,40,0.3)' : 'rgba(124,58,237,0.25)'}`,
                    color: accent,
                  }}
                  disabled={downloadingId === b.id}
                  onClick={() => handleDownload(b)}>
                  {downloadingId === b.id
                    ? <><Loader2 size={13} className="inline mr-1 animate-spin" /> İndiriliyor...</>
                    : <><Download size={13} className="inline mr-1" /> İndir</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
