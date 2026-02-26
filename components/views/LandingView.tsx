"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEasterEggs } from "@/components/EasterEggContext";

/* ─────────────────────────────────────────────────────────────────
   LandingView — Premium split hero  (replaces PanelSplit)
   Left  : Game Jam  — arcade / violet world
   Right : Hackathon — noir   / gold   world
   Center: floating AGZ badge
   CSS prefix: lnd-
   ───────────────────────────────────────────────────────────────── */

interface LandingViewProps {
  onJamClick:  () => void;
  onHackClick: () => void;
}

// ── Design tokens ────────────────────────────────────────────────
const T = {
  jam: {
    bg:       "#0e0720",
    bgDeep:   "#060210",
    accent:   "#9b59b6",
    accentBr: "#ce93f8",
    glow:     "rgba(155,89,182,0.35)",
    btn:      "linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)",
  },
  hack: {
    bg:       "#080808",
    bgDeep:   "#030304",
    accent:   "#d4a843",
    accentBr: "#f5c842",
    glow:     "rgba(212,168,67,0.35)",
    btn:      "linear-gradient(135deg,#b7791f 0%,#d97706 100%)",
  },
  text:  "#f0eeff",
  muted: "#8880a8",
};

export function LandingView({ onJamClick, onHackClick }: LandingViewProps) {
  const [hovered, setHovered] = useState<"jam" | "hack" | null>(null);
  const [tapped,  setTapped]  = useState<"jam" | "hack" | null>(null);
  const [mounted, setMounted] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Badge micro-float
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    let frame: number;
    let t = 0;
    const tick = () => {
      t += 0.018;
      if (badgeRef.current) {
        badgeRef.current.style.transform = `translateX(-50%) translateY(${Math.sin(t) * 5}px)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Egg 5: Pokémon battle ─────────────────────────────────────
  const { markEggSeen } = useEasterEggs();
  const jamClickedRef  = useRef(false);
  const hackClickedRef = useRef(false);
  const pokeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pokeShownRef   = useRef(false);
  const [showPoke, setShowPoke] = useState(false);
  const [pokeText, setPokeText] = useState("");
  const POKE_FULL = "AGZ, İKİLİ ET KİNLİK kullandı!\nSüper etkili!\n\nVahşi ERKEN ERİŞİM kaçtı!";

  const firePoke = useCallback(() => {
    if (pokeShownRef.current) return;
    pokeShownRef.current = true;
    markEggSeen("egg-pokemon");
    setShowPoke(true);
    setPokeText("");
    let i = 0;
    const full = POKE_FULL;
    const iv = setInterval(() => {
      i++;
      setPokeText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(iv);
        setTimeout(() => {
          setShowPoke(false);
          pokeShownRef.current = false;
          jamClickedRef.current = false;
          hackClickedRef.current = false;
        }, 3000);
      }
    }, 40);
  }, [markEggSeen, POKE_FULL]);

  const handleJamBgClick = useCallback(() => {
    if (pokeShownRef.current) return;
    jamClickedRef.current = true;
    if (hackClickedRef.current) { firePoke(); return; }
    if (pokeTimeoutRef.current) clearTimeout(pokeTimeoutRef.current);
    pokeTimeoutRef.current = setTimeout(() => { jamClickedRef.current = false; }, 5000);
  }, [firePoke]);

  const handleHackBgClick = useCallback(() => {
    if (pokeShownRef.current) return;
    hackClickedRef.current = true;
    if (jamClickedRef.current) { firePoke(); return; }
    if (pokeTimeoutRef.current) clearTimeout(pokeTimeoutRef.current);
    pokeTimeoutRef.current = setTimeout(() => { hackClickedRef.current = false; }, 5000);
  }, [firePoke]);

  const active = hovered ?? tapped;

  const jamFlex  = active === "jam"  ? 1.22 : active === "hack" ? 0.78 : 1;
  const hackFlex = active === "hack" ? 1.22 : active === "jam"  ? 0.78 : 1;

  const jamTransform  = active === "jam"
    ? "perspective(1400px) translateZ(72px) rotateY(6deg) scale(1.015)"
    : active === "hack"
    ? "perspective(1400px) translateZ(-12px) rotateY(-4deg) scale(0.985)"
    : "perspective(1400px) translateZ(0px) rotateY(0deg)";

  const hackTransform = active === "hack"
    ? "perspective(1400px) translateZ(72px) rotateY(-6deg) scale(1.015)"
    : active === "jam"
    ? "perspective(1400px) translateZ(-12px) rotateY(4deg) scale(0.985)"
    : "perspective(1400px) translateZ(0px) rotateY(0deg)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Share+Tech+Mono&family=Press+Start+2P&display=swap');

        @media (prefers-reduced-motion: reduce) {
          .lnd-panel  { transition: none !important; }
          .lnd-shine  { display: none !important; }
          .lnd-badge  { animation: none !important; }
        }

        .lnd-panel {
          transition: flex 0.38s cubic-bezier(.4,0,.2,1),
                      transform 0.38s cubic-bezier(.4,0,.2,1);
        }

        .lnd-divider {
          position: absolute;
          top: 0; bottom: 0;
          left: 50%;
          width: 2px;
          background: linear-gradient(180deg,
            transparent 0%,
            rgba(255,255,255,0.08) 20%,
            rgba(255,255,255,0.14) 50%,
            rgba(255,255,255,0.08) 80%,
            transparent 100%);
          z-index: 20;
          pointer-events: none;
        }

        .lnd-shine {
          position: absolute;
          inset: 0;
          pointer-events: none;
          transition: opacity 0.5s ease;
        }

        .lnd-apply-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 10px 28px;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #fff;
          border: none;
          cursor: pointer;
          transition: filter 0.2s ease, transform 0.18s ease;
          text-decoration: none;
        }
        .lnd-apply-btn:hover  { filter: brightness(1.18); transform: translateY(-1px) scale(1.04); }
        .lnd-apply-btn:active { transform: scale(0.96); }

        @keyframes lnd-poke-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .lnd-poke-box { position:fixed; bottom:0; left:0; right:0; background:#f0f0f0; border-top:4px solid #1a1a1a; padding:16px 28px 28px; font-family:'Press Start 2P',monospace; font-size:10px; color:#1a1a1a; line-height:2; z-index:9500; min-height:80px; box-shadow:0 -4px 0 #888; white-space:pre-line; }
        .lnd-poke-box::after { content:'▶'; position:absolute; right:24px; bottom:18px; animation:lnd-poke-blink 0.8s step-end infinite; }

        .lnd-nav-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          min-width: 44px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(8px);
          color: #fff;
          cursor: pointer;
          font-size: 22px;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .lnd-nav-btn:hover  { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.32); transform: scale(1.1); }
        .lnd-nav-btn:active { transform: scale(0.93); }
        .lnd-nav-btn:focus-visible { outline: 2px solid #a78bfa; outline-offset: 3px; }

        .lnd-badge-pill {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: rgba(10,8,20,0.72);
          backdrop-filter: blur(20px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 100px;
          padding: 10px 28px 10px 20px;
          white-space: nowrap;
          box-shadow: 0 4px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.06) inset;
        }

        /* Mobile: stack panels */
        @media (max-width: 767px) {
          .lnd-split { flex-direction: column !important; }
          .lnd-panel { flex: 1 1 50% !important; transform: none !important; }
          .lnd-divider { top: 50%; bottom: auto; left: 0; right: 0; width: auto; height: 2px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.1) 70%, transparent);
          }
          .lnd-badge-pill { bottom: 16px; padding: 8px 18px 8px 14px; }
        }
      `}</style>

      <div className="relative h-screen w-full overflow-hidden" style={{ background: "#050508" }}>

        {/* ── Split container ───────────────────────────────────── */}
        <div
          className="lnd-split flex h-full w-full"
          style={{ perspective: "1400px" }}
        >

          {/* ── LEFT — Game Jam ──────────────────────────────────── */}
          <div
            className="lnd-panel relative flex flex-col items-center justify-center px-6 sm:px-10 py-10 overflow-hidden"
            style={{
              flex: jamFlex,
              background: `radial-gradient(ellipse 80% 100% at 60% 30%, ${T.jam.glow}, transparent 65%), ${T.jam.bgDeep}`,
              transform: jamTransform,
            }}
            onMouseEnter={() => setHovered("jam")}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setTapped("jam")}
            onTouchEnd={() => setTapped(null)}
            onClick={handleJamBgClick}
          >
            {/* Background texture — jambg */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url('/backgrounds/jambg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.18,
                mixBlendMode: "luminosity",
              }}
            />

            {/* Specular shine */}
            <div
              className="lnd-shine"
              style={{
                opacity: active === "jam" ? 1 : 0,
                background: "radial-gradient(ellipse 70% 60% at 70% 15%, rgba(255,255,255,0.13), transparent 60%)",
              }}
            />

            {/* Shadow when inactive */}
            <div
              className="lnd-shine"
              style={{
                opacity: active === "hack" ? 1 : 0,
                background: "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 100%)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8">
              {/* Logo */}
              <div className="h-24 sm:h-32 flex items-center justify-center">
                <Image
                  src="/logos/gamejam.png"
                  alt="AGZ Game Jam Logo"
                  width={240}
                  height={144}
                  className="object-contain w-36 sm:w-52 h-auto"
                  draggable={false}
                />
              </div>

              {/* Genre pill */}
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.2em",
                color: T.jam.accentBr,
                background: "rgba(155,89,182,0.12)",
                border: `1px solid ${T.jam.accent}40`,
                borderRadius: 100,
                padding: "4px 14px",
              }}>
                INSERT COIN TO CONTINUE
              </div>

              {/* CTA row */}
              <div className="flex flex-col items-center gap-3">
                <Link
                  href="/apply/gamejam"
                  className="lnd-apply-btn"
                  style={{ background: T.jam.btn }}
                >
                  Başvur
                </Link>
                <button
                  onClick={onJamClick}
                  className="lnd-nav-btn"
                  aria-label="Game Jam tam görünümüne git"
                  style={{ borderColor: `${T.jam.accent}55` }}
                >
                  ←
                </button>
              </div>
            </div>
          </div>



          {/* ── RIGHT — Hackathon ────────────────────────────────── */}
          <div
            className="lnd-panel relative flex flex-col items-center justify-center px-6 sm:px-10 py-10 overflow-hidden"
            style={{
              flex: hackFlex,
              background: `radial-gradient(ellipse 80% 100% at 40% 30%, ${T.hack.glow}, transparent 65%), ${T.hack.bgDeep}`,
              transform: hackTransform,
            }}
            onMouseEnter={() => setHovered("hack")}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setTapped("hack")}
            onTouchEnd={() => setTapped(null)}
            onClick={handleHackBgClick}
          >
            {/* Background texture — hackbg */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url('/backgrounds/hackbg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.18,
                mixBlendMode: "luminosity",
              }}
            />

            {/* Specular shine */}
            <div
              className="lnd-shine"
              style={{
                opacity: active === "hack" ? 1 : 0,
                background: "radial-gradient(ellipse 70% 60% at 30% 15%, rgba(255,255,255,0.13), transparent 60%)",
              }}
            />

            {/* Shadow when inactive */}
            <div
              className="lnd-shine"
              style={{
                opacity: active === "jam" ? 1 : 0,
                background: "linear-gradient(to left, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 100%)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8">
              {/* Logo / GIF */}
              <div className="h-24 sm:h-32 flex items-center justify-center">
                <Image
                  src="/logos/hackathongif.gif"
                  alt="AGZ Hackathon Logo"
                  width={240}
                  height={144}
                  className="object-contain w-36 sm:w-52 h-auto"
                  unoptimized
                  draggable={false}
                />
              </div>

              {/* Status pill */}
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.2em",
                color: T.hack.accentBr,
                background: "rgba(212,168,67,0.10)",
                border: `1px solid ${T.hack.accent}40`,
                borderRadius: 100,
                padding: "4px 14px",
              }}>
                SAVE SLOT 1 // HCK-AYD-48
              </div>

              {/* CTA row */}
              <div className="flex flex-col items-center gap-3">
                <Link
                  href="/apply/hackathon"
                  className="lnd-apply-btn"
                  style={{ background: T.hack.btn }}
                >
                  Başvur
                </Link>
                <button
                  onClick={onHackClick}
                  className="lnd-nav-btn"
                  aria-label="Hackathon tam görünümüne git"
                  style={{ borderColor: `${T.hack.accent}55` }}
                >
                  →
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ── Floating AGZ badge ────────────────────────────────── */}
        <div ref={badgeRef} className="lnd-badge-pill">
          {/* AGZ logo mark */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 8}}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            </svg>
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: "0.12em",
              color: T.text,
            }}>
              AYDIN GENÇLİK ZİRVESİ
            </span>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 15,
              color: T.muted,
              letterSpacing: "0.08em",
              marginLeft: 2,
            }}>
              2026
            </span>
          </div>
          {/* Slim accent line */}
          <div style={{
            width: "80%",
            height: 1.5,
            borderRadius: 2,
            background: "linear-gradient(90deg, #7c3aed 0%, #d4a843 100%)",
            opacity: 0.7,
            marginTop: 2,
          }} />

          {/* ── Scroll hint chevron ── */}
          <div className={`lnd-scroll-hint${scrolled ? " hidden" : ""}`}>
            <div className="lnd-chevron-wrap">
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path d="M2 2l6 6 6-6" stroke="rgba(167,139,250,0.7)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 6l6 6 6-6" stroke="rgba(167,139,250,0.4)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Egg 5: Pokémon battle ─────────────────────────── */}
      {showPoke && (
        <div className="lnd-poke-box">
          {pokeText}
        </div>
      )}

    </>
  );
}

