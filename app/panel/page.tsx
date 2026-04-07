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

  const isHack    = kullanici?.etkinlikTuru === 'hackathon';
  const accent    = isHack ? '#c49a28' : '#7c3aed';
  const cardBg    = isHack ? '#fffef5' : '#ffffff';
  const innerBg   = isHack ? '#fdf9e8' : '#f8f7ff';
  const border    = isHack ? '#ede5b8' : '#e8e3f8';
  const borderHov = isHack ? '#d9c870' : '#d0c8f0';
  const textPri   = isHack ? '#1a1200' : '#1a1630';
  const textSub   = isHack ? '#2d2000' : '#2d2550';
  const textMuted = isHack ? '#8a7840' : '#7a7295';
  const textDim   = isHack ? '#9a8a50' : '#9590b0';

  const cards = [
    { href: '/panel/durum', icon: <Search size={24} />, title: 'Durum Sorgula', desc: 'Başvuru durumunu görüntüle', tag: 'DURUM' },
    { href: '/panel/belgelerim', icon: <Paperclip size={24} />, title: 'Belgelerim', desc: 'Gerekli belgeleri yükle', tag: 'BELGELER' },
    { href: '/panel/proje', icon: <Target size={24} />, title: 'Proje Gönder', desc: isHack ? 'Hackathon projenizi gönderin' : 'Game jam oyununuzu gönderin', tag: 'PROJE' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Share+Tech+Mono&display=swap');
        .pp-page { padding: 28px; max-width: 900px; margin: 0 auto; }
        .pp-greeting { margin-bottom: 28px; }
        .pp-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.35em; color: ${textDim}; text-transform: uppercase; margin-bottom: 6px; }
        .pp-title { font-family: 'Lexend', sans-serif; font-weight: 800; font-size: clamp(20px,4vw,30px); color: ${textPri}; }
        .pp-profile-card { background: ${cardBg}; border: 1px solid ${border}; border-radius: 12px; padding: 24px; margin-bottom: 28px; position: relative; overflow: hidden; box-shadow: 0 1px 8px ${isHack ? 'rgba(196,154,40,0.08)' : 'rgba(124,58,237,0.06)'}; }
        .pp-profile-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: ${isHack ? 'linear-gradient(90deg,#c49a28,#e8c84a)' : 'linear-gradient(90deg,#7c3aed,#a855f7)'}; }
        .pp-profile-label { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.3em; color: ${accent}; text-transform: uppercase; margin-bottom: 16px; }
        .pp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 12px; margin-bottom: 16px; }
        .pp-field { }
        .pp-field-label { font-size: 11px; color: ${textDim}; letter-spacing: 0.05em; margin-bottom: 3px; text-transform: uppercase; }
        .pp-field-val { font-size: 15px; color: ${textSub}; font-weight: 500; }
        .pp-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.15em; }
        .pp-badge-hack { background: rgba(196,154,40,0.12); color: #c49a28; border: 1px solid rgba(196,154,40,0.35); }
        .pp-badge-jam { background: rgba(124,58,237,0.1); color: #7c3aed; border: 1px solid rgba(124,58,237,0.25); }
        .pp-quick-title { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.3em; color: ${textDim}; text-transform: uppercase; margin-bottom: 14px; }
        .pp-quick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 14px; }
        .pp-quick-card { background: ${cardBg}; border: 1px solid ${border}; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 150ms; text-decoration: none; display: block; box-shadow: 0 1px 4px ${isHack ? 'rgba(196,154,40,0.05)' : 'rgba(124,58,237,0.04)'}; }
        .pp-quick-card:hover { border-color: ${borderHov}; transform: translateY(-2px); box-shadow: 0 4px 20px ${isHack ? 'rgba(196,154,40,0.12)' : 'rgba(124,58,237,0.1)'}; }
        .pp-quick-icon { font-size: 24px; margin-bottom: 10px; color: ${accent}; }
        .pp-quick-tag { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.25em; color: ${accent}; text-transform: uppercase; margin-bottom: 6px; }
        .pp-quick-name { font-family: 'Lexend', sans-serif; font-weight: 700; font-size: 15px; color: ${textPri}; margin-bottom: 4px; }
        .pp-quick-desc { font-size: 12px; color: ${textMuted}; line-height: 1.5; }
      `}</style>

      <div className="pp-page">
        <div className="pp-greeting">
          <p className="pp-eyebrow">◈ KİŞİSEL PANELİN</p>
          <h1 className="pp-title">
            {isHack ? 'AJAN PROFİLİ' : 'PLAYER CARD'} 
          </h1>
        </div>

        <div className="pp-profile-card">
          <p className="pp-profile-label">{isHack ? '//  DOSYA_AGZ_HACKATHON' : '// PLAYER_RECORD'}</p>
          {kullanici ? (
            <div className="pp-grid">
              <div className="pp-field">
                <div className="pp-field-label">TAM AD</div>
                <div className="pp-field-val">{kullanici.isim} {kullanici.soyisim}</div>
              </div>
              <div className="pp-field">
                <div className="pp-field-label">E-POSTA</div>
                <div className="pp-field-val" style={{ fontSize: 13 }}>{kullanici.eposta}</div>
              </div>
              <div className="pp-field">
                <div className="pp-field-label">ÜNİVERSİTE</div>
                <div className="pp-field-val">{kullanici.universite}</div>
              </div>
              <div className="pp-field">
                <div className="pp-field-label">BÖLÜM</div>
                <div className="pp-field-val">{kullanici.bolum}</div>
              </div>
              <div className="pp-field">
                <div className="pp-field-label">ETKİNLİK</div>
                <span className={`pp-badge ${isHack ? 'pp-badge-hack' : 'pp-badge-jam'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {isHack ? <Search size={11} /> : <Gamepad2 size={11} />}{isHack ? ' HACKATHON' : ' GAME JAM'}
                </span>
              </div>
              <div className="pp-field">
                <div className="pp-field-label">KATILIM</div>
                <div className="pp-field-val" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{kullanici.katilimTuru === 'takim' ? <><Users size={14} /> Takım · {kullanici.takimAdi ?? ''}</> : <><User size={14} /> Bireysel</>}</div>
              </div>
              {kullanici.rol && kullanici.rol.length > 0 && (
                <div className="pp-field" style={{ gridColumn: '1/-1' }}>
                  <div className="pp-field-label">ROLLER</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {kullanici.rol.map((r: string) => (
                      <span key={r} style={{ background: isHack ? 'rgba(196,154,40,0.1)' : 'rgba(124,58,237,0.08)', border: `1px solid ${isHack ? 'rgba(196,154,40,0.3)' : 'rgba(124,58,237,0.2)'}`, color: accent, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.1em' }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}
              {basvuru?.adminNotu && (
                <div className="pp-field" style={{ gridColumn: '1/-1' }}>
                  <div className="pp-field-label">NOTLAR</div>
                  <div style={{ fontSize: 14, color: textSub, marginTop: 4 }}>{basvuru.adminNotu}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: textMuted, fontSize: 14 }}>Profil bilgileri yükleniyor...</div>
          )}
        </div>

        <p className="pp-quick-title">// HIZLI ERİŞİM</p>
        <div className="pp-quick-grid">
          {cards.map(card => (
            <a key={card.href} href={card.href} className="pp-quick-card">
              <div className="pp-quick-icon">{card.icon}</div>
              <div className="pp-quick-tag">{card.tag}</div>
              <div className="pp-quick-name">{card.title}</div>
              <div className="pp-quick-desc">{card.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
