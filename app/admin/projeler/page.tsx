'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllProjelerWithKullanici, type ProjeWithKullanici } from '@/lib/firebase/admin';
import { ExternalLink } from 'lucide-react';

export default function AdminProjelerPage() {
  const [projeler, setProjeler] = useState<ProjeWithKullanici[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'hepsi' | 'hackathon' | 'gamejam'>('hepsi');

  useEffect(() => {
    getAllProjelerWithKullanici()
      .then(data => setProjeler(data.sort((a, b) => {
        const ta = a.gonderiTarihi?.toMillis() ?? 0;
        const tb = b.gonderiTarihi?.toMillis() ?? 0;
        return tb - ta;
      })))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'hepsi' ? projeler : projeler.filter(p => p.etkinlikTuru === filter);

  return (
    <div className="p-7 max-w-[1000px] mx-auto">
      <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.35em] text-[#4a4568] uppercase mb-1.5">◈ ADMIN PANELİ</p>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-7">
        <h1 className="font-[Lexend] font-extrabold text-[clamp(20px,4vw,30px)] text-[#d1cfe8]">Gönderilen Projeler</h1>
        <div className="flex gap-2">
          {(['hepsi', 'hackathon', 'gamejam'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-md border transition-all duration-150 cursor-pointer"
              style={{
                background: filter === f ? (f === 'hackathon' ? '#1a1200' : f === 'gamejam' ? '#130d1f' : '#1a1a2e') : 'transparent',
                borderColor: filter === f ? (f === 'hackathon' ? '#d4a843' : f === 'gamejam' ? '#7c3aed' : '#3a3060') : '#1e1a2e',
                color: filter === f ? (f === 'hackathon' ? '#d4a843' : f === 'gamejam' ? '#7c3aed' : '#9490b0') : '#4a4568',
              }}
            >
              {f === 'hepsi' ? `Hepsi (${projeler.length})` : f === 'hackathon' ? `Hackathon (${projeler.filter(p => p.etkinlikTuru === 'hackathon').length})` : `Game Jam (${projeler.filter(p => p.etkinlikTuru === 'gamejam').length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[110px] rounded-xl bg-gradient-to-r from-[#1e1a2e] via-[#2a2545] to-[#1e1a2e] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#13111f] border border-[#1e1a2e] rounded-xl p-10 text-center">
          <p className="font-[Share_Tech_Mono] text-[12px] text-[#4a4568] tracking-[0.2em]">HENÜz PROJE GÖNDERİLMEDİ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(proje => (
            <div key={proje.uid} className="bg-[#13111f] border border-[#1e1a2e] rounded-xl p-5 hover:border-[#2a2545] transition-colors duration-150">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#2a2545] border border-[#3a3060] flex items-center justify-center font-[Lexend] font-bold text-[13px] text-[#9490b0] flex-shrink-0">
                  {proje.isim[0]}{proje.soyisim[0]}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Link href={`/admin/kullanicilar/${proje.uid}`} className="font-semibold text-[15px] text-[#d1cfe8] no-underline hover:text-white transition-colors">
                      {proje.isim} {proje.soyisim}
                    </Link>
                    <span className="font-[Share_Tech_Mono] text-[10px] text-[#4a4568]">{proje.eposta}</span>
                    <span
                      className="ml-auto font-[Share_Tech_Mono] text-[10px] tracking-[0.2em] uppercase px-2 py-0.5 rounded border"
                      style={{
                        color: proje.etkinlikTuru === 'hackathon' ? '#d4a843' : '#7c3aed',
                        borderColor: proje.etkinlikTuru === 'hackathon' ? '#d4a84340' : '#7c3aed40',
                        background: proje.etkinlikTuru === 'hackathon' ? '#d4a84310' : '#7c3aed10',
                      }}
                    >
                      {proje.etkinlikTuru === 'hackathon' ? '⚙ HACKATHON' : '🎮 GAME JAM'}
                    </span>
                  </div>

                  {/* Project name */}
                  <p className="text-[14px] font-semibold text-[#c8c4e0] mb-1">
                    {proje.etkinlikTuru === 'hackathon' ? proje.projeAdi : proje.oyunAdi}
                  </p>

                  {/* Description */}
                  {proje.aciklama && (
                    <p className="text-[13px] text-[#6b6485] leading-relaxed mb-2 line-clamp-2">{proje.aciklama}</p>
                  )}

                  {/* Links */}
                  <div className="flex gap-3 flex-wrap">
                    {proje.etkinlikTuru === 'hackathon' && (
                      <>
                        {proje.githubUrl && (
                          <a href={proje.githubUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 font-[Share_Tech_Mono] text-[11px] text-[#5bc8f5] no-underline hover:underline">
                            <ExternalLink size={11} /> GitHub
                          </a>
                        )}
                        {proje.canlıUrl && (
                          <a href={proje.canlıUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 font-[Share_Tech_Mono] text-[11px] text-[#10b981] no-underline hover:underline">
                            <ExternalLink size={11} /> Canlı Demo
                          </a>
                        )}
                      </>
                    )}
                    {proje.etkinlikTuru === 'gamejam' && proje.itchUrl && (
                      <a href={proje.itchUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 font-[Share_Tech_Mono] text-[11px] text-[#fa5c5c] no-underline hover:underline">
                        <ExternalLink size={11} /> itch.io
                      </a>
                    )}
                    {proje.gonderiTarihi && (
                      <span className="font-[Share_Tech_Mono] text-[10px] text-[#3a3060] ml-auto">
                        {proje.gonderiTarihi.toDate().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
