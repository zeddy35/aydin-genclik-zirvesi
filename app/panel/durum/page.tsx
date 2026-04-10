'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBasvuruDurumu } from '@/lib/firebase/basvuru';
import type { BasvuruDurumuDoc } from '@/lib/firebase/types';
import { Clock, Search, CheckCircle2, XCircle, ClipboardList, Check, X, AlertTriangle } from 'lucide-react';

const DURUM_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; desc: string }> = {
  beklemede:      { label: 'BEKLEMEDE',      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: <Clock size={52} color="#f59e0b" />,        desc: 'Başvurunuz alındı, inceleme sırası bekleniyor.' },
  inceleniyor:    { label: 'İNCELENİYOR',    color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: <Search size={52} color="#3b82f6" />,        desc: 'Başvurunuz ekibimiz tarafından inceleniyor.' },
  onaylandi:      { label: 'ONAYLANDI',      color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: <CheckCircle2 size={52} color="#10b981" />,  desc: 'Tebrikler! Başvurunuz kabul edildi.' },
  reddedildi:     { label: 'REDDEDİLDİ',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: <XCircle size={52} color="#ef4444" />,       desc: 'Başvurunuz bu aşamada kabul edilemedi.' },
  bekleme_listesi:{ label: 'BEKLEME LİSTESİ',color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <ClipboardList size={52} color="#8b5cf6" />, desc: 'Kontenjan açıldığında bildirim alacaksınız.' },
};

const ADIMLAR = ['beklemede', 'inceleniyor', 'onaylandi'];

export default function DurumPage() {
  const { user, kullanici } = useAuth();
  const [durum, setDurum]   = useState<BasvuruDurumuDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getBasvuruDurumu(user.uid).then(setDurum).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const isHack   = kullanici?.etkinlikTuru === 'hackathon';
  const accent   = isHack ? '#e8c84a'               : '#a78bfa';
  const cardBg   = isHack ? '#140f02'               : '#131028';
  const innerBg  = isHack ? '#1c1500'               : '#1a1638';
  const border   = isHack ? 'rgba(196,154,40,0.18)' : 'rgba(124,58,237,0.2)';
  const textPri  = isHack ? '#fff5d0'               : '#ede8ff';
  const textSub  = isHack ? '#ddc880'               : '#c4b8f5';
  const textDim  = isHack ? '#706030'               : '#6858a0';

  const durumKey  = durum?.durum ?? 'beklemede';
  const durumInfo = DURUM_MAP[durumKey] ?? DURUM_MAP['beklemede'];
  const isRedded  = durumKey === 'reddedildi';
  const stepIndex = ADIMLAR.indexOf(isRedded ? 'inceleniyor' : durumKey);

  return (
    <>
      <style>{`@keyframes pulse-slow { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }`}</style>

      <div className="p-7 max-w-[700px] mx-auto">
        <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.35em] uppercase mb-1.5" style={{ color: textDim }}>
          ◈ DURUM SORGULA
        </p>
        <h1 className="font-[Lexend] font-extrabold text-[clamp(20px,4vw,30px)] mb-7" style={{ color: textPri }}>
          Başvuru Durumu
        </h1>

        {loading ? (
          <div className="text-center py-16 font-[Share_Tech_Mono] text-xs tracking-[0.3em]" style={{ color: textDim }}>
            YÜKLENİYOR...
          </div>
        ) : (
          <>
            {/* Status badge */}
            <div className="rounded-2xl p-8 text-center mb-6 relative overflow-hidden"
              style={{ background: durumInfo.bg, border: `1px solid ${durumInfo.color}40` }}>
              <div className={`mb-3 ${(durumKey === 'beklemede' || durumKey === 'inceleniyor') ? '[animation:pulse-slow_2s_ease-in-out_infinite]' : ''}`}>
                {durumInfo.icon}
              </div>
              <div className="font-[Lexend] font-extrabold text-[clamp(18px,4vw,28px)] tracking-widest mb-2" style={{ color: durumInfo.color }}>
                {durumInfo.label}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: isHack ? '#6a5c30' : '#5a5280' }}>
                {durumInfo.desc}
              </p>
            </div>

            {/* Timeline */}
            <div className="rounded-xl p-6 mb-6" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.3em] uppercase mb-5" style={{ color: textDim }}>
                // SÜREÇ
              </p>
              <div className="flex items-center">
                {ADIMLAR.map((adim, i) => {
                  const isDone   = !isRedded && stepIndex > i;
                  const isActive = !isRedded && stepIndex === i;
                  const isFail   = isRedded && i === 1;
                  return (
                    <div key={adim} className="flex-1 relative">
                      {/* Connector line */}
                      {i < ADIMLAR.length - 1 && (
                        <div className="absolute h-0.5 z-0"
                          style={{ top: 15, left: 'calc(50% + 16px)', right: 'calc(-50% + 16px)', background: isDone ? '#10b981' : border }} />
                      )}
                      {/* Dot */}
                      <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm mx-auto mb-2 border-2 transition-all duration-300"
                        style={isDone
                          ? { background: 'rgba(16,185,129,0.12)', borderColor: '#10b981', color: '#10b981' }
                          : isActive
                          ? { background: `${accent}18`, borderColor: accent, color: accent, animation: 'pulse-slow 2s ease-in-out infinite' }
                          : isFail
                          ? { background: 'rgba(239,68,68,0.1)', borderColor: '#ef4444', color: '#ef4444' }
                          : { background: innerBg, borderColor: border, color: textDim }
                        }>
                        {isDone ? <Check size={14} /> : isFail ? <X size={14} /> : i + 1}
                      </div>
                      {/* Label */}
                      <div className="font-[Share_Tech_Mono] text-[9px] tracking-[0.15em] text-center mt-1"
                        style={{ color: isDone ? '#10b981' : isActive ? accent : textDim }}>
                        {DURUM_MAP[adim]?.label ?? adim}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reject note */}
            {isRedded && durum?.adminNotu && (
              <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="flex items-center gap-1.5 font-[Lexend] font-bold text-sm text-red-500 mb-2">
                  <AlertTriangle size={14} /> Admin Notu
                </p>
                <p className="text-sm leading-relaxed" style={{ color: textSub }}>{durum.adminNotu}</p>
              </div>
            )}

            {durum?.guncellenmeTarihi && (
              <p className="font-[Share_Tech_Mono] text-[11px] text-center mt-3" style={{ color: textDim }}>
                Son güncelleme: {new Date((durum.guncellenmeTarihi as unknown as { toDate?: () => Date }).toDate?.() ?? Date.now()).toLocaleString('tr-TR')}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
