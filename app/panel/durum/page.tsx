'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBasvuruDurumu } from '@/lib/firebase/basvuru';
import type { BasvuruDurumuDoc } from '@/lib/firebase/types';
import { Clock, Search, CheckCircle2, XCircle, ClipboardList, Check, X, AlertTriangle } from 'lucide-react';

const DURUM_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; desc: string }> = {
  beklemede: { label: 'BEKLEMEDE', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={52} color="#f59e0b" />, desc: 'Başvurunuz alındı, inceleme sırası bekleniyor.' },
  inceleniyor: { label: 'İNCELENİYOR', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <Search size={52} color="#3b82f6" />, desc: 'Başvurunuz ekibimiz tarafından inceleniyor.' },
  onaylandi: { label: 'ONAYLANDI', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle2 size={52} color="#10b981" />, desc: 'Tebrikler! Başvurunuz kabul edildi.' },
  reddedildi: { label: 'REDDEDİLDİ', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <XCircle size={52} color="#ef4444" />, desc: 'Başvurunuz bu aşamada kabul edilemedi.' },
  bekleme_listesi: { label: 'BEKLEME LİSTESİ', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <ClipboardList size={52} color="#8b5cf6" />, desc: 'Kontenjan açıldığında bildirim alacaksınız.' },
};

const ADIMLAR = ['beklemede', 'inceleniyor', 'onaylandi'];

export default function DurumPage() {
  const { user, kullanici } = useAuth();
  const [durum, setDurum] = useState<BasvuruDurumuDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getBasvuruDurumu(user.uid).then(setDurum).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const isHack = kullanici?.etkinlikTuru === 'hackathon';
  const accent = isHack ? '#d4a843' : '#7c3aed';
  const durumKey = durum?.durum ?? 'beklemede';
  const durumInfo = DURUM_MAP[durumKey] ?? DURUM_MAP['beklemede'];
  const isRedded = durumKey === 'reddedildi';
  const stepIndex = ADIMLAR.indexOf(isRedded ? 'inceleniyor' : durumKey);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Share+Tech+Mono&display=swap');
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        .dp-page { padding: 28px; max-width: 700px; margin: 0 auto; }
        .dp-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.35em; color: #4a4568; text-transform: uppercase; margin-bottom: 6px; }
        .dp-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(20px,4vw,30px); color: #d1cfe8; margin-bottom: 28px; }
        .dp-badge-card { background: #13111f; border: 1px solid #1e1a2e; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px; position: relative; overflow: hidden; }
        .dp-badge-icon { font-size: 52px; margin-bottom: 12px; }
        .dp-badge-label { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(18px, 4vw, 28px); letter-spacing: 0.1em; margin-bottom: 8px; }
        .dp-badge-desc { font-size: 14px; color: #8b85a8; line-height: 1.6; }
        .dp-pulse { animation: pulse 2s ease-in-out infinite; }
        .dp-timeline { background: #13111f; border: 1px solid #1e1a2e; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .dp-tl-label { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.3em; color: #4a4568; text-transform: uppercase; margin-bottom: 20px; }
        .dp-tl-steps { display: flex; align-items: center; gap: 0; }
        .dp-tl-step { flex: 1; position: relative; }
        .dp-tl-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; margin: 0 auto 8px; border: 2px solid #2a2545; background: #0d0b18; transition: all 300ms; position: relative; z-index: 2; }
        .dp-tl-dot.done { background: rgba(16,185,129,0.2); border-color: #10b981; }
        .dp-tl-dot.active { background: ${accent}20; border-color: ${accent}; animation: pulse 2s ease-in-out infinite; }
        .dp-tl-dot.fail { background: rgba(239,68,68,0.2); border-color: #ef4444; }
        .dp-tl-name { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.15em; color: #4a4568; text-align: center; margin-top: 4px; }
        .dp-tl-name.done { color: #10b981; }
        .dp-tl-name.active { color: ${accent}; }
        .dp-tl-line { position: absolute; top: 15px; left: calc(50% + 16px); right: calc(-50% + 16px); height: 2px; background: #2a2545; z-index: 1; }
        .dp-tl-line.done { background: #10b981; }
        .dp-reject-card { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.25); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .dp-reject-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #fca5a5; margin-bottom: 8px; }
        .dp-reject-note { font-size: 14px; color: #e5e7eb; line-height: 1.7; }
        .dp-ts { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #4a4568; text-align: center; margin-top: 12px; }
      `}</style>

      <div className="dp-page">
        <p className="dp-eyebrow">◈ DURUM SORGULA</p>
        <h1 className="dp-title">Başvuru Durumu</h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#4a4568', fontFamily: 'Share Tech Mono, monospace', fontSize: 12, letterSpacing: '0.3em' }}>YÜKLENİYOR...</div>
        ) : (
          <>
            <div className="dp-badge-card" style={{ background: durumInfo.bg, borderColor: durumInfo.color + '40' }}>
              <div className={`dp-badge-icon ${durumKey === 'beklemede' || durumKey === 'inceleniyor' ? 'dp-pulse' : ''}`}>
                {durumInfo.icon}
              </div>
              <div className="dp-badge-label" style={{ color: durumInfo.color }}>{durumInfo.label}</div>
              <p className="dp-badge-desc">{durumInfo.desc}</p>
            </div>

            <div className="dp-timeline">
              <p className="dp-tl-label">// SÜREÇ</p>
              <div className="dp-tl-steps">
                {ADIMLAR.map((adim, i) => {
                  const isDone = !isRedded && stepIndex > i;
                  const isActive = !isRedded && stepIndex === i;
                  const isFail = isRedded && i === 1;
                  return (
                    <div key={adim} className="dp-tl-step">
                      {i < ADIMLAR.length - 1 && <div className={`dp-tl-line ${isDone ? 'done' : ''}`} />}
                      <div className={`dp-tl-dot ${isDone ? 'done' : isActive ? 'active' : isFail ? 'fail' : ''}`}>
                        {isDone ? <Check size={14} /> : isFail ? <X size={14} /> : i + 1}
                      </div>
                      <div className={`dp-tl-name ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                        {DURUM_MAP[adim]?.label ?? adim}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {isRedded && durum?.adminNotu && (
              <div className="dp-reject-card">
                <p className="dp-reject-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} /> Admin Notu</p>
                <p className="dp-reject-note">{durum.adminNotu}</p>
              </div>
            )}

            {durum?.guncellenmeTarihi && (
              <p className="dp-ts">
                Son güncelleme: {new Date((durum.guncellenmeTarihi as unknown as { toDate?: () => Date }).toDate?.() ?? Date.now()).toLocaleString('tr-TR')}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
