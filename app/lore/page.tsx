"use client";

import { useState, useCallback, useEffect, useRef } from "react";

/* ─── palette ───────────────────────────────────────────────── */
const C = {
  bg:       "#070709",
  surf:     "#0c0c12",
  border:   "#1c1c28",
  borderHi: "#2a2a3a",
  red:      "#c0392b",
  redDim:   "#7a1a1a",
  redText:  "#e05050",
  amber:    "#d97706",
  gold:     "#c8a84b",
  txt:      "#ede9f8",
  txtSec:   "#918da8",
  txtMuted: "#524e68",
  txtCode:  "#3c3a52",
  ui:       "var(--font-lexend), sans-serif",
  mono:     "var(--font-share-tech-mono), monospace",
  display:  "var(--font-oswald), sans-serif",
} as const;

/* ─── data ───────────────────────────────────────────────────── */
interface Character {
  id:      string;
  name:    string;
  role:    string;
  status:  string;
  suspect: boolean;
  photo?:  string;
  details: { label: string; value: string }[];
  story:   string;
}

const CHARACTERS: Character[] = [
  {
    id:      "01",
    name:    "Early Access",
    role:    "Suça Sürüklenmiş Robot",
    status:  "AKTİF · İZLENİYOR",
    suspect: true,
    photo:   "/lore/early_lore.svg",
    details: [
      { label: "Konum",           value: "???" },
      { label: "Son Görülme",     value: "??? Gün Önce" },
      { label: "Tehdit Seviyesi", value: "MAXIMUM" },
      { label: "Bağlantılar",     value: "PARALEL EVRENLER" },
    ],
    story:
      "Bu karakter hakkında hikaye buraya gelecek. Kişinin geçmişi, motivasyonları ve vakadaki rolü burada kısaca anlatılacak. Detaylar eklendikçe bu metin güncellenecek.",
  },
  {
    id:      "02",
    name:    "Beta",
    role:    "Rol / Unvan",
    status:  "KAYIP · ARAŞTIRILIYOR",
    suspect: false,
    photo:   "/lore/beta_lore.svg",
    details: [
      { label: "Konum",       value: "—" },
      { label: "Son Görülme", value: "—" },
      { label: "Durum",       value: "BİLİNMİYOR" },
      { label: "İlişki",      value: "—" },
    ],
    story:
      "Bu karakter hakkında hikaye buraya gelecek. Kişinin geçmişi, motivasyonları ve vakadaki rolü burada kısaca anlatılacak. Detaylar eklendikçe bu metin güncellenecek.",
  },
  {
    id:      "03",
    name:    "DINO",
    role:    "ANA DEDEKTIF",
    status:  "GIZLI · YETKILENDIRILMIS",
    suspect: false,
    photo:   "/lore/dino_logo.svg",
    details: [
      { label: "Konum",        value: "EVRENLER ARASINDA" },
      { label: "Son Görülme",  value: "3 Gün Önce" },
      { label: "Güvenilirlik", value: "YÜKSEK" },
      { label: "İfade",        value: "ALINDI" },
    ],
    story:
      "Bu karakter hakkında hikaye buraya gelecek. Kişinin geçmişi, motivasyonları ve vakadaki rolü burada kısaca anlatılacak. Detaylar eklendikçe bu metin güncellenecek.",
  },
  {
    id:      "04",
    name:    "PANDA",
    role:    "STAJYER",
    status:  "KENDI DE BILMIYOR",
    suspect: false,
    photo:   "/lore/panda_logo.svg",
    details: [
      { label: "Konum",       value: "DINO'NUN YANINDA" },
      { label: "Son Görülme", value: "3 Gün Önce" },
      { label: "Yetki",       value: "DÜŞÜK" },
      { label: "Görev",       value: "GİZLİ" },
    ],
    story:
      "Bu karakter hakkında hikaye buraya gelecek. Kişinin geçmişi, motivasyonları ve vakadaki rolü burada kısaca anlatılacak. Detaylar eklendikçe bu metin güncellenecek.",
  },
];

/* ─── component ─────────────────────────────────────────────── */
export default function LorePage() {
  const [idx, setIdx]             = useState(0);
  const [animating, setAnimating] = useState(false);
  const [leaving, setLeaving]     = useState(false);
  const timerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useCallback((dir: 1 | -1) => {
    if (animating) return;
    setAnimating(true);
    setLeaving(true);
    setTimeout(() => {
      setIdx(i => (i + dir + CHARACTERS.length) % CHARACTERS.length);
      setLeaving(false);
      setTimeout(() => setAnimating(false), 400);
    }, 300);
  }, [animating]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => navigate(1), 40000000);
  }, [navigate]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const char  = CHARACTERS[idx];
  const accent = char.suspect ? C.redText : C.gold;
  const dim    = char.suspect ? C.redDim  : "#1a1200";

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; }
        body { background: ${C.bg}; color: ${C.txt}; }

        .lore-root {
          display: grid;
          grid-template-columns: 64px 1fr 1fr 64px;
          grid-template-rows: 1fr;
          height: 100dvh;
          min-height: 100vh;
        }

        /* ── arrows ── */
        .lore-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          background: transparent;
          color: ${C.txtCode};
          transition: color 220ms, background 220ms;
          position: relative;
          z-index: 10;
        }
        .lore-arrow:hover { color: ${C.txtSec}; background: rgba(255,255,255,0.02); }
        .lore-arrow:disabled { opacity: 0.2; cursor: default; }
        .lore-arrow svg { width: 20px; height: 20px; stroke-width: 1.5; }

        /* ── left panel ── */
        .lore-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(32px, 5vw, 72px) clamp(20px, 3vw, 48px) clamp(32px, 5vw, 72px) 0;
          border-right: 1px solid ${C.border};
          overflow: hidden;
        }

        /* ── right panel ── */
        .lore-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(32px, 5vw, 72px) 0 clamp(32px, 5vw, 72px) clamp(20px, 3vw, 48px);
          position: relative;
          overflow: hidden;
        }

        /* ── content transition ── */
        .lore-content {
          transition: opacity 300ms ease, transform 300ms ease;
          width: 100%;
        }
        .lore-content.leaving {
          opacity: 0;
          transform: translateY(8px);
        }
        .lore-content.entering {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── image ── */
        .lore-img-wrap {
          position: relative;
          width: min(420px, 80%);
          aspect-ratio: 3/4;
          transition: opacity 300ms ease, transform 300ms ease;
        }
        .lore-img-wrap.leaving {
          opacity: 0;
          transform: translateX(16px);
        }
        .lore-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .lore-img-placeholder {
          width: 100%;
          height: 100%;
          background: ${C.surf};
          border: 1px solid ${C.border};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .lore-img-placeholder-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: ${C.border};
          border: 1px solid ${C.borderHi};
        }
        .lore-img-placeholder-body {
          width: 100px;
          height: 40px;
          background: ${C.border};
          border-radius: 4px;
        }
        .lore-img-placeholder-label {
          font-family: ${C.mono};
          font-size: 9px;
          letter-spacing: 0.2em;
          color: ${C.txtCode};
          text-transform: uppercase;
        }

        /* ── image corner decorations ── */
        .lore-corner {
          position: absolute;
          width: 16px;
          height: 16px;
        }
        .lore-corner-tl { top: -1px; left: -1px; border-top: 1px solid; border-left: 1px solid; }
        .lore-corner-tr { top: -1px; right: -1px; border-top: 1px solid; border-right: 1px solid; }
        .lore-corner-bl { bottom: -1px; left: -1px; border-bottom: 1px solid; border-left: 1px solid; }
        .lore-corner-br { bottom: -1px; right: -1px; border-bottom: 1px solid; border-right: 1px solid; }

        /* ── counter ── */
        .lore-counter {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 20;
        }
        .lore-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          transition: background 200ms, transform 200ms;
        }

        /* ── top bar ── */
        .lore-topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          border-bottom: 1px solid ${C.border};
          background: ${C.bg};
          z-index: 20;
        }

        /* ── mobile ── */
        @media (max-width: 768px) {
          html, body { overflow: auto; }
          .lore-root {
            grid-template-columns: 44px 1fr 44px;
            grid-template-rows: auto auto;
            height: auto;
            min-height: 100dvh;
            padding-top: 44px;
          }
          .lore-left {
            grid-column: 2;
            grid-row: 2;
            border-right: none;
            border-top: 1px solid ${C.border};
            padding: 32px 16px;
          }
          .lore-right {
            grid-column: 1 / 4;
            grid-row: 1;
            padding: 32px 20px 20px;
            border-bottom: 1px solid ${C.border};
          }
          .lore-arrow { grid-row: 2; align-items: flex-start; padding-top: 40px; }
          .lore-arrow:first-child { grid-column: 1; }
          .lore-arrow:last-child  { grid-column: 3; }
          .lore-img-wrap { width: min(260px, 70%); }
        }
      `}</style>

      {/* Top bar */}
      <div className="lore-topbar">
        <span style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: C.txtCode }}>
          AGZ HACKATHON 2026 · VAKA DOSYASI
        </span>
        <span style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.2em", color: C.txtCode }}>
          GİZLİ
        </span>
      </div>

      <div className="lore-root" style={{ paddingTop: 44 }}>

        {/* Left arrow */}
        <button
          className="lore-arrow"
          onClick={() => { navigate(-1); resetTimer(); }}
          disabled={animating}
          aria-label="Önceki karakter"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Left panel — info + story */}
        <div className="lore-left">
          <div className={`lore-content ${leaving ? "leaving" : "entering"}`}>

            {/* Case number + status */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <span style={{
                fontFamily: C.mono, fontSize: 9, letterSpacing: "0.3em",
                textTransform: "uppercase", color: C.txtCode,
              }}>
                DOSYA /{char.id}
              </span>
              {char.suspect && (
                <span style={{
                  fontFamily: C.mono, fontSize: 8, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: C.redText,
                  background: `${C.redDim}55`, border: `1px solid ${C.red}55`,
                  padding: "2px 8px",
                }}>
                  ANA ŞÜPHELI
                </span>
              )}
            </div>

            {/* Name */}
            <h1 style={{
              fontFamily: C.display,
              fontSize: "clamp(28px, 4vw, 52px)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: char.suspect ? C.redText : C.txt,
              lineHeight: 1,
              marginBottom: 8,
            }}>
              {char.name}
            </h1>

            {/* Role */}
            <p style={{
              fontFamily: C.ui, fontSize: "clamp(13px, 1.2vw, 15px)",
              color: C.txtSec, marginBottom: 6,
            }}>
              {char.role}
            </p>

            {/* Status */}
            <span style={{
              display: "inline-block",
              fontFamily: C.mono, fontSize: 9, letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: accent,
              background: dim,
              border: `1px solid ${accent}44`,
              padding: "3px 10px",
              marginBottom: 28,
            }}>
              {char.status}
            </span>

            {/* Divider */}
            <div style={{ height: 1, background: C.border, marginBottom: 24 }} />

            {/* Details */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 28,
            }}>
              {char.details.map((d) => (
                <div key={d.label}>
                  <div style={{
                    fontFamily: C.mono, fontSize: 8, letterSpacing: "0.2em",
                    textTransform: "uppercase", color: C.txtCode, marginBottom: 3,
                  }}>
                    {d.label}
                  </div>
                  <div style={{
                    fontFamily: C.ui, fontSize: "clamp(12px, 1vw, 14px)",
                    fontWeight: 500, color: accent,
                  }}>
                    {d.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: C.border, marginBottom: 24 }} />

            {/* Story */}
            <div>
              <div style={{
                fontFamily: C.mono, fontSize: 8, letterSpacing: "0.25em",
                textTransform: "uppercase", color: C.txtCode, marginBottom: 12,
              }}>
                // ARKA PLAN
              </div>
              <p style={{
                fontFamily: C.ui,
                fontSize: "clamp(13px, 1vw, 14px)",
                lineHeight: 1.8,
                color: C.txtMuted,
                maxWidth: 480,
              }}>
                {char.story}
              </p>
            </div>

          </div>
        </div>

        {/* Right panel — image */}
        <div className="lore-right">
          <div className={`lore-img-wrap ${leaving ? "leaving" : ""}`}>
            {/* Corner decorations */}
            {["tl","tr","bl","br"].map(pos => (
              <div key={pos} className={`lore-corner lore-corner-${pos}`}
                style={{ borderColor: `${accent}66` }} />
            ))}

            {char.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={char.photo} alt={char.name} className="lore-img" />
            ) : (
              <div className="lore-img-placeholder">
                <div className="lore-img-placeholder-icon" />
                <div className="lore-img-placeholder-body" />
                <span className="lore-img-placeholder-label">FOTOĞRAF YOK</span>
              </div>
            )}

            {/* File ID overlay */}
            <div style={{
              position: "absolute",
              bottom: 12, right: 12,
              fontFamily: C.mono, fontSize: 9,
              letterSpacing: "0.2em",
              color: `${accent}88`,
            }}>
              #{char.id}
            </div>
          </div>
        </div>

        {/* Right arrow */}
        <button
          className="lore-arrow"
          onClick={() => { navigate(1); resetTimer(); }}
          disabled={animating}
          aria-label="Sonraki karakter"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

      </div>

      {/* Dots counter */}
      <div className="lore-counter">
        {CHARACTERS.map((_, i) => (
          <div
            key={i}
            className="lore-dot"
            style={{
              background: i === idx ? C.txtSec : C.border,
              transform: i === idx ? "scale(1.5)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </>
  );
}
