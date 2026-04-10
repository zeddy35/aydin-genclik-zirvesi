'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBasvuruDurumu } from '@/lib/firebase/basvuru';
import type { BasvuruDurumuDoc } from '@/lib/firebase/types';
import { Search, Paperclip, Target, Gamepad2, Users, User } from 'lucide-react';

export default function PanelPage() {
  const { kullanici, user } = useAuth();
  const [basvuru, setBasvuru] = useState<BasvuruDurumuDoc | null>(null);

  useEffect(() => {
    if (user) getBasvuruDurumu(user.uid).then(setBasvuru);
  }, [user]);

  if (!user) return null;

  const isHack   = kullanici?.etkinlikTuru === 'hackathon';
  const accent   = isHack ? '#e8c84a'               : '#a78bfa';
  const cardBg   = isHack ? '#140f02'               : '#131028';
  const border   = isHack ? 'rgba(196,154,40,0.18)' : 'rgba(124,58,237,0.2)';
  const textPri  = isHack ? '#fff5d0'               : '#ede8ff';
  const textSub  = isHack ? '#ddc880'               : '#c4b8f5';
  const textMuted= isHack ? '#a08840'               : '#9080c0';
  const textDim  = isHack ? '#706030'               : '#6858a0';
  const topBar   = isHack ? 'linear-gradient(90deg,#c49a28,#e8c84a)' : 'linear-gradient(90deg,#7c3aed,#a855f7)';

  const rolBg    = isHack ? 'rgba(196,154,40,0.1)'  : 'rgba(124,58,237,0.08)';
  const rolBdr   = isHack ? 'rgba(196,154,40,0.3)'  : 'rgba(124,58,237,0.2)';

  return (
    <div className="p-7 max-w-[900px] mx-auto">

      {/* Greeting */}
      <div className="mb-7">
        <p className="font-[Share_Tech_Mono] text-[11px] tracking-[0.35em] uppercase mb-1.5" style={{ color: textDim }}>
          ◈ KİŞİSEL PANELİN
        </p>
        <h1 className="font-[Lexend] font-extrabold text-[clamp(20px,4vw,30px)]" style={{ color: textPri }}>
          {isHack ? 'AJAN PROFİLİ' : 'PLAYER CARD'}
        </h1>
      </div>

      {/* Profile card */}
      <div className="relative overflow-hidden rounded-xl p-6 mb-7" style={{ background: cardBg, border: `1px solid ${border}` }}>
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: topBar }} />

        <p className="font-[Share_Tech_Mono] text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: accent }}>
          {isHack ? '// DOSYA_AGZ_HACKATHON' : '// PLAYER_RECORD'}
        </p>

        {kullanici ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {[
              { label: 'TAM AD',      val: `${kullanici.isim} ${kullanici.soyisim}` },
              { label: 'E-POSTA',     val: kullanici.eposta, small: true },
              { label: 'ÜNİVERSİTE', val: kullanici.universite },
              { label: 'BÖLÜM',      val: kullanici.bolum },
            ].map(f => (
              <div key={f.label}>
                <div className="text-[11px] uppercase tracking-wide mb-0.5" style={{ color: textDim }}>{f.label}</div>
                <div className="font-medium" style={{ color: textSub, fontSize: f.small ? 13 : 15 }}>{f.val}</div>
              </div>
            ))}

            <div>
              <div className="text-[11px] uppercase tracking-wide mb-0.5" style={{ color: textDim }}>ETKİNLİK</div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-[Share_Tech_Mono] text-[11px] tracking-[0.15em]"
                style={isHack
                  ? { background: 'rgba(196,154,40,0.12)', color: '#c49a28', border: '1px solid rgba(196,154,40,0.35)' }
                  : { background: 'rgba(124,58,237,0.1)',  color: '#7c3aed', border: '1px solid rgba(124,58,237,0.25)' }}>
                {isHack ? <Search size={11} /> : <Gamepad2 size={11} />}
                {isHack ? ' HACKATHON' : ' GAME JAM'}
              </span>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wide mb-0.5" style={{ color: textDim }}>KATILIM</div>
              <div className="flex items-center gap-1.5 font-medium" style={{ color: textSub, fontSize: 15 }}>
                {kullanici.katilimTuru === 'takim'
                  ? <><Users size={14} /> Takım · {kullanici.takimAdi ?? ''}</>
                  : <><User size={14} /> Bireysel</>}
              </div>
            </div>

            {kullanici.rol && kullanici.rol.length > 0 && (
              <div className="col-span-full">
                <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: textDim }}>ROLLER</div>
                <div className="flex flex-wrap gap-1.5">
                  {kullanici.rol.map((r: string) => (
                    <span key={r} className="rounded-full px-2.5 py-0.5 text-xs font-[Share_Tech_Mono] tracking-wide"
                      style={{ background: rolBg, border: `1px solid ${rolBdr}`, color: accent }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {basvuru?.adminNotu && (
              <div className="col-span-full">
                <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: textDim }}>NOTLAR</div>
                <div className="text-sm" style={{ color: textSub }}>{basvuru.adminNotu}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm" style={{ color: textMuted }}>Profil bilgileri yükleniyor...</div>
        )}
      </div>
    </div>
  );
}
