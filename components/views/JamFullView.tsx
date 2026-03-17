"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface GameJamFullViewProps {
  onBack: () => void;
}

// ── PIXEL STAR DECORATION ──
function PixelStar({ size = 8, color = "#a78bfa" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none">
      <rect x="3" y="0" width="2" height="2" fill={color} />
      <rect x="3" y="6" width="2" height="2" fill={color} />
      <rect x="0" y="3" width="2" height="2" fill={color} />
      <rect x="6" y="3" width="2" height="2" fill={color} />
      <rect x="3" y="3" width="2" height="2" fill={color} />
    </svg>
  );
}

// ── CONTROLLER ICON ──
function ControllerIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="12" rx="5" fill="#7c3aed" />
      <rect x="5" y="11" width="2" height="4" rx="1" fill="#ddd6fe" />
      <rect x="4" y="12" width="4" height="2" rx="1" fill="#ddd6fe" />
      <circle cx="16" cy="12" r="1.5" fill="#34d399" />
      <circle cx="18.5" cy="13.5" r="1.5" fill="#f472b6" />
      <circle cx="13.5" cy="13.5" r="1.5" fill="#fbbf24" />
      <circle cx="16" cy="15" r="1.5" fill="#60a5fa" />
      <rect x="9" y="9" width="6" height="2" rx="1" fill="#4c1d95" />
    </svg>
  );
}

// ── PIXEL EXPLOSION ──
function PixelBurst({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <rect x={x-1} y={y-3} width="2" height="2" fill={color} opacity="0.6" />
      <rect x={x+2} y={y-2} width="2" height="2" fill={color} opacity="0.5" />
      <rect x={x-3} y={y} width="2" height="2" fill={color} opacity="0.4" />
      <rect x={x+3} y={y+1} width="2" height="2" fill={color} opacity="0.5" />
      <rect x={x} y={y+3} width="2" height="2" fill={color} opacity="0.6" />
    </g>
  );
}

// ── COUNTDOWN ──
function GameCountdown() {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calc = () => {
      const diff = new Date("2026-05-16T09:00:00+03:00").getTime() - Date.now();
      if (diff > 0) setT({ days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60) });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px " }}>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: "#7c3aed", letterSpacing: "0.2em", textTransform: "uppercase" }}>
        — Başlamasına Kalan —
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
        {[{ v: t.days, l: "GÜN" }, { v: t.hours, l: "SAAT" }, { v: t.minutes, l: "DAK" }, { v: t.seconds, l: "SN" }].map(({ v, l }, i) => (
          <React.Fragment key={l}>
            {i > 0 && <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: "#c4b5fd", paddingBottom: 18, lineHeight: 1 }}>:</span>}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "clamp(18px,4vw,28px)",
                color: "#1e0050",
                background: "#ede9fe",
                border: "2px solid #7c3aed",
                borderRadius: 6,
                padding: "8px 10px",
                minWidth: 58,
                textAlign: "center",
                boxShadow: "3px 3px 0 #7c3aed",
                fontVariantNumeric: "tabular-nums",
              }}>{String(v).padStart(2, "0")}</div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#a78bfa", letterSpacing: "0.1em" }}>{l}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── MAIN ──
export function JamFullView({ onBack }: GameJamFullViewProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [hoveredRole, setHoveredRole] = useState<number | null>(null);

  const ROLES = [
    { emoji: "💻", title: "Geliştirici", desc: "Oyun motoru, kod tabanı, fizik sistemi. Unity, Godot, Pygame — seçim senin.", color: "#dbeafe", border: "#3b82f6", shadow: "#3b82f6" },
    { emoji: "🎨", title: "Sanatçı", desc: "Sprite, karakter, ortam. Pixel art mı? 3D mi? Her stil kabul.", color: "#fce7f3", border: "#ec4899", shadow: "#ec4899" },
    { emoji: "🎵", title: "Ses Tasarımcısı", desc: "SFX, müzik, atmosfer. Ses olmadan oyun yarım.", color: "#d1fae5", border: "#10b981", shadow: "#10b981" },
    { emoji: "🧩", title: "Game Designer", desc: "Mekanik, denge, eğlence döngüsü. Oyunun kalbi senin elinde.", color: "#fef3c7", border: "#f59e0b", shadow: "#f59e0b" },
  ];

  const FEATURES = [
    { icon: "⏱️", title: "48 Saatlik Maraton", desc: "Hızlı düşün, hızlı geliştir, hızlı sun. Jam ruhu: 'ship it!'" },
    { icon: "🧩", title: "Takım & Roller", desc: "Coder, artist, designer, sound... Her rol bir 'party member'." },
    { icon: "🏆", title: "Ödüller & Eğlence", desc: "Sürpriz ödüller, mini-challenge'lar, sahnede demo keyfi." },
  ];

  const FAQS = [
    { q: "Hangi oyun motorunu kullanabilirim?", a: "Unity, Godot, Pygame, GameMaker, Phaser — istediğin her şey. Kısıt yok." },
    { q: "Takım kaç kişi olabilir?", a: "1-5 kişi arası. Tek başına da katılabilirsin, eşleşme akışı var." },
    { q: "Tema ne zaman açıklanıyor?", a: "Jam başlangıcında tüm takımlara aynı anda duyurulacak. Sürpriz!" },
    { q: "Önceden oyun geliştirebilir miyim?", a: "Hayır. Tema açıklandıktan sonra sıfırdan başlanmalı. Assets hazır olabilir." },
    { q: "Deneyimim yok, katılabilir miyim?", a: "Kesinlikle. Mentor desteği, atölye ve rehber içerikler mevcut olacak." },
  ];

  const C = {
    purple: "#7c3aed",
    purpleLight: "#ede9fe",
    purpleMid: "#a78bfa",
    bg: "#f5f3ff",
    white: "#ffffff",
    dark: "#1e0050",
    text: "#3b0764",
    muted: "#6d28d9",
    pixel: "'Press Start 2P', monospace",
    body: "'Nunito', sans-serif",
    display: "'Fredoka One', cursive",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

        .gj-card { transition: transform .18s ease, box-shadow .18s ease; }
        .gj-card:hover { transform: translateY(-4px); }
        .gj-btn-primary { transition: transform .15s, box-shadow .15s; }
        .gj-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.4) !important; }
        .gj-btn-outline { transition: all .15s; }
        .gj-btn-outline:hover { background: #ede9fe !important; }
        .gj-role:hover { transform: scale(1.03); }
        .gj-faq-body { max-height: 0; overflow: hidden; transition: max-height .3s ease, padding .2s; padding: 0 16px; }
        .gj-faq-body.open { max-height: 120px; padding: 0 16px 14px; }
        @keyframes gj-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .gj-float { animation: gj-float 3s ease-in-out infinite; }
        @keyframes gj-float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .gj-float2 { animation: gj-float2 3.5s ease-in-out infinite 0.5s; }
        @keyframes gj-pulse-ring { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.8);opacity:0} }
        .gj-pulse::after { content:''; position:absolute; inset:0; border-radius:inherit; border:2px solid #7c3aed; animation: gj-pulse-ring 1.8s ease-out infinite; pointer-events:none; }
        .gj-reveal { opacity:0; transform:translateY(16px); transition: opacity .5s ease, transform .5s ease; }
        .gj-reveal.in { opacity:1; transform:translateY(0); }
        .gj-star-spin { animation: gj-spin 8s linear infinite; }
        @keyframes gj-spin { to{transform:rotate(360deg)} }
      `}</style>
      <GJReveal />

      <div style={{ fontFamily: C.body, background: C.bg, minHeight: "100vh", overflowX: "hidden", width: "100%" }}>

        {/* ── BG DECORATION ── */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <radialGradient id="gj-radial1" cx="10%" cy="20%" r="50%">
                <stop offset="0%" stopColor="#ddd6fe" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f5f3ff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gj-radial2" cx="90%" cy="80%" r="50%">
                <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f5f3ff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#gj-radial1)" />
            <rect width="100%" height="100%" fill="url(#gj-radial2)" />
            {/* Pixel grid dots */}
            {Array.from({ length: 12 }, (_, i) => Array.from({ length: 8 }, (_, j) => (
              <rect key={`${i}-${j}`} x={i * 120 + 40} y={j * 110 + 30} width="3" height="3" rx="1" fill="#c4b5fd" opacity="0.3" />
            )))}
            <PixelBurst x={80} y={120} color="#a78bfa" />
            <PixelBurst x={340} y={60} color="#f472b6" />
            <PixelBurst x={600} y={200} color="#34d399" />
            <PixelBurst x={200} y={400} color="#fbbf24" />
          </svg>
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "0 16px 80px" }}>

          {/* ── TOP NAV ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 0", gap: 12 }}>
            <button onClick={onBack} style={{ fontFamily: C.pixel, fontSize: 10, color: C.purple, background: C.white, border: "2px solid #c4b5fd", cursor: "pointer", letterSpacing: "0.1em", padding: "10px 16px", borderRadius: 8, transition: "all .15s", boxShadow: "0 2px 8px rgba(124,58,237,0.1)" }} onMouseOver={e => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,58,237,0.2)"; }} onMouseOut={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(124,58,237,0.1)"; }}>
              ← GERİ DÖN
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="gj-btn-outline" style={{ fontFamily: C.pixel, fontSize: 8, color: C.muted, background: "transparent", border: "2px solid #c4b5fd", cursor: "pointer", letterSpacing: "0.1em", padding: "8px 12px", borderRadius: 6, transition: "all .15s" }} onMouseOver={e => e.currentTarget.style.background = "#ede9fe"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                DETAYLAR
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ede9fe", border: "2px solid #c4b5fd", borderRadius: 20, padding: "5px 14px" }}>
                <ControllerIcon size={16} />
                <span style={{ fontFamily: C.pixel, fontSize: 7, color: C.purple, letterSpacing: "0.1em" }}>JAM MODE · 48 SAAT</span>
              </div>
            </div>
          </div>

          {/* ── HERO ── */}
          <section className="gj-reveal" style={{ textAlign: "center", padding: "48px 0 36px" }}>
            {/* Floating decorations */}
            <div className="gj-float" style={{ display: "inline-block", marginBottom: 8, fontSize: 40, lineHeight: 1 }}>🎮</div>
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* Pixel stars around title */}
              <div style={{ position: "absolute", top: -12, left: -24 }} className="gj-float2"><PixelStar size={10} color="#f472b6" /></div>
              <div style={{ position: "absolute", top: 4, right: -20 }} className="gj-float"><PixelStar size={8} color="#34d399" /></div>
              <div style={{ position: "absolute", bottom: -8, left: -16 }} className="gj-float2"><PixelStar size={7} color="#fbbf24" /></div>

              <h1 style={{ fontFamily: C.display, fontSize: "clamp(42px,9vw,80px)", color: C.dark, margin: "0 0 4px", lineHeight: 1.05, letterSpacing: "-0.01em" }}>
                Aydın{" "}
                <span style={{ background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Game Jam</span>
              </h1>
            </div>

            <p style={{ fontSize: 16, color: "#4c1d95", maxWidth: 520, margin: "12px auto 28px", lineHeight: 1.7, fontWeight: 600 }}>
              48 saat boyunca harika oyunlar geliştir, yetenekli takımlar kur ve fikirlerini dünyaya sun.
              Tam bir <em style={{ fontStyle: "italic", color: C.purple }}>"cartoonish chaos"</em> — ama üretken.
            </p>

            {/* Countdown */}
            <div style={{ background: C.white, border: "2px solid #e9d5ff", borderRadius: 16, padding: "4px 0 8px", maxWidth: 420, margin: "0 auto 28px", boxShadow: "0 4px 24px rgba(124,58,237,0.08)" }}>
              <GameCountdown />
            </div>
          </section>

          {/* ── FEATURE CARDS ── */}
          <section className="gj-reveal" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 40 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="gj-card" style={{ background: C.white, borderRadius: 16, padding: "20px 16px", border: "2px solid #e9d5ff", boxShadow: "0 2px 12px rgba(124,58,237,0.06)", cursor: "default" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontFamily: C.display, fontSize: 15, color: C.dark, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#6d28d9", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </section>

          {/* ── TEMEL BİLGİLER ── */}
          <section className="gj-reveal" style={{ background: C.white, borderRadius: 20, padding: "24px", border: "2px solid #e9d5ff", boxShadow: "0 4px 24px rgba(124,58,237,0.06)", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ fontFamily: C.display, fontSize: 20, color: C.dark, margin: 0 }}>Temel Bilgiler</h2>
              <div style={{ display: "flex", gap: 6 }}>
                {["🎮", "🕹️", "👾"].map(e => <span key={e} style={{ fontSize: 16 }}>{e}</span>)}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              {[
                { label: "BAŞLAMA TARİHİ", value: "Yakında", color: "#ede9fe", border: "#c4b5fd" },
                { label: "YER", value: "Aydın", color: "#fce7f3", border: "#f9a8d4" },
                { label: "SÜRE", value: "48 Saat", color: "#d1fae5", border: "#6ee7b7" },
                { label: "KATILIM", value: "Ücretsiz", color: "#fef3c7", border: "#fde68a" },
              ].map((i) => (
                <div key={i.label} className="gj-card" style={{ background: i.color, border: `2px solid ${i.border}`, borderRadius: 12, padding: "14px 16px", cursor: "default" }}>
                  <div style={{ fontFamily: C.pixel, fontSize: 7, letterSpacing: "0.15em", color: C.muted, marginBottom: 6, textTransform: "uppercase" }}>{i.label}</div>
                  <div style={{ fontFamily: C.display, fontSize: 20, color: C.dark }}>{i.value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── ROLLER ── */}
          <section className="gj-reveal" style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <h2 style={{ fontFamily: C.display, fontSize: 22, color: C.dark, margin: 0 }}>Takımda Rolün Ne?</h2>
              <PixelStar size={12} color="#f472b6" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
              {ROLES.map((r, i) => (
                <div
                  key={r.title}
                  className="gj-card"
                  style={{
                    background: hoveredRole === i ? r.color : C.white,
                    borderRadius: 16,
                    padding: "18px 16px",
                    border: `2px solid ${hoveredRole === i ? r.border : "#e9d5ff"}`,
                    boxShadow: hoveredRole === i ? `4px 4px 0 ${r.shadow}` : "0 2px 10px rgba(124,58,237,0.05)",
                    cursor: "default",
                    transition: "all .18s ease",
                  }}
                  onMouseEnter={() => setHoveredRole(i)}
                  onMouseLeave={() => setHoveredRole(null)}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{r.emoji}</div>
                  <div style={{ fontFamily: C.display, fontSize: 16, color: C.dark, marginBottom: 5 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: "#4c1d95", lineHeight: 1.6 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── GAME TYPES ── */}
          <section className="gj-reveal" style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <h2 style={{ fontFamily: C.display, fontSize: 22, color: C.dark, margin: 0 }}>Ne Yapabilirsin?</h2>
              <PixelStar size={10} color="#34d399" />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "Platformer", color: "#ede9fe", border: "#a78bfa", icon: "🏃" },
                { label: "Puzzle", color: "#fce7f3", border: "#f9a8d4", icon: "🧩" },
                { label: "RPG", color: "#d1fae5", border: "#6ee7b7", icon: "⚔️" },
                { label: "Arcade", color: "#fef3c7", border: "#fde68a", icon: "👾" },
                { label: "Horror", color: "#fee2e2", border: "#fca5a5", icon: "👻" },
                { label: "Endless Runner", color: "#e0f2fe", border: "#7dd3fc", icon: "🏁" },
                { label: "Visual Novel", color: "#f3e8ff", border: "#d8b4fe", icon: "📖" },
                { label: "... Her şey!", color: "#f0fdf4", border: "#86efac", icon: "✨" },
              ].map((t) => (
                <div key={t.label} className="gj-card" style={{ background: t.color, border: `2px solid ${t.border}`, borderRadius: 24, padding: "7px 14px", display: "flex", alignItems: "center", gap: 6, cursor: "default" }}>
                  <span style={{ fontSize: 14 }}>{t.icon}</span>
                  <span style={{ fontFamily: C.display, fontSize: 13, color: C.dark }}>{t.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── TIMELINE ── */}
          <section className="gj-reveal" style={{ background: C.white, borderRadius: 20, padding: "24px", border: "2px solid #e9d5ff", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <h2 style={{ fontFamily: C.display, fontSize: 20, color: C.dark, margin: 0 }}>Nasıl İlerler?</h2>
              <PixelStar size={10} color="#fbbf24" />
            </div>
            {[
              { n: "01", icon: "🚀", title: "Tema Açıklanır", desc: "Tüm takımlar aynı anda öğreniyor. Beyin fırtınası başlasın!", time: "T+0", color: "#ede9fe", border: "#a78bfa" },
              { n: "02", icon: "🛠️", title: "İnşa Et", desc: "Tasarım, kod, ses, sanat. 48 saat boyunca tam gaz.", time: "T+1 — T+46", color: "#d1fae5", border: "#6ee7b7" },
              { n: "03", icon: "🎮", title: "Sun & Oyna", desc: "Demo sunumu, jüri oylaması, ve birbirinin oyunlarını oynama zamanı!", time: "T+48", color: "#fce7f3", border: "#f9a8d4" },
            ].map((step) => (
              <div key={step.n} style={{ display: "flex", gap: 16, marginBottom: 14, alignItems: "flex-start" }}>
                <div style={{ background: step.color, border: `2px solid ${step.border}`, borderRadius: 12, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: C.display, fontSize: 15, color: C.dark }}>{step.title}</span>
                    <span style={{ fontFamily: C.pixel, fontSize: 7, color: C.muted, background: "#f3e8ff", padding: "2px 7px", borderRadius: 4 }}>{step.time}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#4c1d95", lineHeight: 1.6, margin: "3px 0 0" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ── FAQ ── */}
          <section className="gj-reveal" style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <h2 style={{ fontFamily: C.display, fontSize: 22, color: C.dark, margin: 0 }}>Aklındaki Sorular</h2>
              <PixelStar size={10} color="#60a5fa" />
            </div>
            <div style={{ background: C.white, borderRadius: 20, border: "2px solid #e9d5ff", overflow: "hidden" }}>
              {FAQS.map((f, i) => (
                <div key={f.q} style={{ borderTop: i > 0 ? "1px solid #f3e8ff" : undefined }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", background: "none", border: "none", cursor: "pointer" }}
                    onMouseOver={e => (e.currentTarget.style.background = "#faf5ff")}
                    onMouseOut={e => (e.currentTarget.style.background = "none")}
                  >
                    <span style={{ fontFamily: C.body, fontWeight: 700, fontSize: 13, color: C.dark }}>{f.q}</span>
                    <span style={{ fontFamily: C.pixel, fontSize: 14, color: openFaq === i ? C.purple : "#c4b5fd", transform: openFaq === i ? "rotate(45deg)" : "none", display: "inline-block", transition: "transform .2s", flexShrink: 0 }}>+</span>
                  </button>
                  <div className={`gj-faq-body${openFaq === i ? " open" : ""}`}>
                    <div style={{ fontSize: 13, color: "#4c1d95", lineHeight: 1.7 }}>{f.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="gj-reveal" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #4c1d95 100%)", borderRadius: 24, padding: "36px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            {/* Decorative pixel elements */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
              <svg width="100%" height="100%">
                {Array.from({ length: 20 }, (_, i) => (
                  <rect key={i} x={i * 45 + Math.random() * 20} y={Math.random() * 120} width="4" height="4" rx="1" fill="#ffffff" opacity={0.05 + Math.random() * 0.1} />
                ))}
                <PixelBurst x={40} y={40} color="#ddd6fe" />
                <PixelBurst x={780} y={100} color="#f9a8d4" />
                <PixelBurst x={400} y={20} color="#6ee7b7" />
              </svg>
            </div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }} className="gj-float">🎮</div>
              <h3 style={{ fontFamily: C.display, fontSize: "clamp(22px,5vw,36px)", color: "#fff", margin: "0 0 10px", letterSpacing: "-0.01em" }}>
                48 saatin var. Ne inşa edeceksin?
              </h3>
              <p style={{ fontSize: 14, color: "#ddd6fe", maxWidth: 400, margin: "0 auto 24px", lineHeight: 1.7 }}>
                Takımını kur, temayı bekle, oyununu yap. Kazanmak değil, <strong style={{ color: "#fff" }}>üretmek</strong> burada kural.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/auth/register" className="gj-btn-primary" style={{ fontFamily: C.display, fontSize: 16, background: "#fff", color: C.purple, padding: "12px 28px", borderRadius: 12, textDecoration: "none", display: "inline-block", boxShadow: "0 4px 14px rgba(0,0,0,0.2)", border: "none" }}>
                  Hemen Başvur 🚀
                </Link>
                <Link href="/gamejam/detay" className="gj-btn-outline" style={{ fontFamily: C.display, fontSize: 16, background: "rgba(255,255,255,0.1)", color: "#ddd6fe", padding: "12px 28px", borderRadius: 12, textDecoration: "none", display: "inline-block", border: "2px solid rgba(255,255,255,0.2)" }}>
                  Detaylar
                </Link>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <div style={{ textAlign: "center", padding: "28px 0 0", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <PixelStar size={8} color="#c4b5fd" />
              <span style={{ fontFamily: C.pixel, fontSize: 7, color: "#c4b5fd", letterSpacing: "0.15em" }}>GDG × OYUN VE TASARIM KULÜBÜ</span>
              <PixelStar size={8} color="#c4b5fd" />
            </div>
            <span style={{ fontFamily: C.pixel, fontSize: 6, color: "#ddd6fe", letterSpacing: "0.1em" }}>AYDIN GENÇLİK ZİRVESİ · 2026</span>
          </div>

        </div>
      </div>
    </>
  );
}

function GJReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".gj-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } }),
      { threshold: 0.06 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return null;
}
