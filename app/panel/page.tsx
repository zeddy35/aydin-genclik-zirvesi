'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBasvuruDurumu } from '@/lib/firebase/basvuru';
import type { BasvuruDurumuDoc } from '@/lib/firebase/types';

export default function PanelPage() {
  const { kullanici, user } = useAuth();
  const [basvuru, setBasvuru] = useState<BasvuruDurumuDoc | null>(null);

  useEffect(() => {
    if (user) getBasvuruDurumu(user.uid).then(setBasvuru);
  }, [user]);

  if (!user) return null;

  const isHack = kullanici?.etkinlikTuru === 'hackathon';
  const accent = isHack ? '#d4a843' : '#7c3aed';

  const cards = [
    { href: '/panel/durum', icon: '🔍', title: 'Durum Sorgula', desc: 'Başvuru durumunu görüntüle', tag: 'DURUM' },
    { href: '/panel/belgelerim', icon: '📎', title: 'Belgelerim', desc: 'Gerekli belgeleri yükle', tag: 'BELGELER' },
    { href: '/panel/proje', icon: '🎯', title: 'Proje Gönder', desc: isHack ? 'Hackathon projenizi gönderin' : 'Game jam oyununuzu gönderin', tag: 'PROJE' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Share+Tech+Mono&display=swap');
        .pp-page { padding: 28px; max-width: 900px; margin: 0 auto; }
        .pp-greeting { margin-bottom: 28px; }
        .pp-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.35em; color: #4a4568; text-transform: uppercase; margin-bottom: 6px; }
        .pp-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(20px,4vw,30px); color: #d1cfe8; }
        .pp-profile-card { background: #13111f; border: 1px solid #1e1a2e; border-radius: 12px; padding: 24px; margin-bottom: 28px; position: relative; overflow: hidden; }
        .pp-profile-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: ${accent}; }
        .pp-profile-label { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.3em; color: ${accent}; text-transform: uppercase; margin-bottom: 16px; }
        .pp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 12px; margin-bottom: 16px; }
        .pp-field { }
        .pp-field-label { font-size: 11px; color: #4a4568; letter-spacing: 0.05em; margin-bottom: 3px; }
        .pp-field-val { font-size: 15px; color: #c8c4e0; font-weight: 500; }
        .pp-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.15em; }
        .pp-badge-hack { background: rgba(212,168,67,0.15); color: #d4a843; border: 1px solid rgba(212,168,67,0.3); }
        .pp-badge-jam { background: rgba(124,58,237,0.15); color: #c4b5fd; border: 1px solid rgba(124,58,237,0.3); }
        .pp-quick-title { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.3em; color: #4a4568; text-transform: uppercase; margin-bottom: 14px; }
        .pp-quick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 14px; }
        .pp-quick-card { background: #13111f; border: 1px solid #1e1a2e; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 150ms; text-decoration: none; display: block; }
        .pp-quick-card:hover { border-color: #3a3060; transform: translateY(-2px); box-shadow: 0 4px 20px rgba(124,58,237,0.1); }
        .pp-quick-icon { font-size: 24px; margin-bottom: 10px; }
        .pp-quick-tag { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.25em; color: ${accent}; text-transform: uppercase; margin-bottom: 6px; }
        .pp-quick-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #d1cfe8; margin-bottom: 4px; }
        .pp-quick-desc { font-size: 12px; color: #6b6485; line-height: 1.5; }
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
                <span className={`pp-badge ${isHack ? 'pp-badge-hack' : 'pp-badge-jam'}`}>
                  {isHack ? '🔍 HACKATHON' : '🎮 GAME JAM'}
                </span>
              </div>
              <div className="pp-field">
                <div className="pp-field-label">KATILIM</div>
                <div className="pp-field-val">{kullanici.katilimTuru === 'takim' ? `👥 Takım · ${kullanici.takimAdi ?? ''}` : '👤 Bireysel'}</div>
              </div>
              {kullanici.rol && kullanici.rol.length > 0 && (
                <div className="pp-field" style={{ gridColumn: '1/-1' }}>
                  <div className="pp-field-label">ROLLER</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {kullanici.rol.map((r: string) => (
                      <span key={r} style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.1em' }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}
              {basvuru?.adminNotu && (
                <div className="pp-field" style={{ gridColumn: '1/-1' }}>
                  <div className="pp-field-label">NOTLAR</div>
                  <div style={{ fontSize: 20, color: '#6b6485', marginTop: 4 }}>{basvuru.adminNotu}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#6b6485', fontSize: 14 }}>Profil bilgileri yükleniyor...</div>
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
