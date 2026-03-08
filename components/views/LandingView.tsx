"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEasterEggs } from "@/components/EasterEggContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth as firebaseAuth, db } from "@/lib/firebase/config";

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
    glow:     "rgba(57, 233, 17, 0.35)",
    btn:      "linear-gradient(135deg,#b7791f 0%,#d97706 100%)",
  },
  text:  "#f0eeff",
  muted: "#8880a8",
};

export function LandingView({ onJamClick, onHackClick }: LandingViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [hovered, setHovered] = useState<"jam" | "hack" | null>(null);
  const [tapped,  setTapped]  = useState<"jam" | "hack" | null>(null);
  const [mounted, setMounted] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalEmail,    setModalEmail]    = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalError,    setModalError]    = useState('');
  const [modalLoading,  setModalLoading]  = useState(false);
  const [modalShowPw,   setModalShowPw]   = useState(false);

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

  const handleModalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);
    try {
      const { user: fbUser } = await signInWithEmailAndPassword(firebaseAuth, modalEmail, modalPassword);
      const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid));
      router.push(adminSnap.exists() ? '/admin' : '/panel');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setModalError('E-posta veya şifre hatalı.');
      } else if (code === 'auth/wrong-password') {
        setModalError('Şifre hatalı.');
      } else if (code === 'auth/invalid-email') {
        setModalError('Geçersiz e-posta adresi.');
      } else if (code === 'auth/too-many-requests') {
        setModalError('Çok fazla başarısız deneme. Lütfen bekleyin.');
      } else {
        setModalError('Giriş başarısız. Lütfen tekrar deneyin.');
      }
    } finally {
      setModalLoading(false);
    }
  };

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

        .lnd-login-jam {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 40;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 4px;
          background: rgba(8,4,18,0.82);
          border: 1.5px solid #9b59b688;
          color: #ce93f8;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-decoration: none;
          text-transform: uppercase;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 10px rgba(155,89,182,0.2), inset 0 0 6px rgba(155,89,182,0.08);
          white-space: nowrap;
        }
        .lnd-login-jam::before { content: '▶ '; font-size: 8px; opacity: 0.7; }
        .lnd-login-jam:hover { background: rgba(124,58,237,0.22); border-color: #ce93f8; box-shadow: 0 0 18px rgba(155,89,182,0.45), inset 0 0 8px rgba(155,89,182,0.15); }
        .lnd-login-jam:active { transform: scale(0.96); }

        .lnd-login-hack {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 40;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          background: rgba(8,6,2,0.82);
          backdrop-filter: blur(12px);
          border: 1px solid #d4a84355;
          color: #f5c842cc;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-decoration: none;
          text-transform: uppercase;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4);
          white-space: nowrap;
        }
        .lnd-login-hack:hover { background: rgba(212,168,67,0.15); border-color: #d4a843aa; box-shadow: 0 0 14px rgba(212,168,67,0.25); }
        .lnd-login-hack:active { transform: scale(0.96); }

        .lnd-pill-nav {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: auto;
          max-width: 720px;
          background: rgba(10,10,20,0.65);
          backdrop-filter: blur(16px) saturate(1.5);
          -webkit-backdrop-filter: blur(16px) saturate(1.5);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px;
          padding: 12px 20px;
          gap: 20px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset;
          white-space: nowrap;
        }

        .lnd-pill-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.13);
          color: rgba(255,255,255,0.85);
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.18s;
        }
        .lnd-pill-icon-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.28); transform: scale(1.08); }
        .lnd-pill-icon-btn:active { transform: scale(0.94); }

        .lnd-pill-title {
          flex: 1;
          text-align: center;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.14em;
          color: rgba(240,238,255,0.88);
          pointer-events: none;
          user-select: none;
        }

        .lnd-pill-login-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 18px;
          border-radius: 999px;
          border: 1px solid #D4A843;
          color: #D4A843;
          background: transparent;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-decoration: none;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
        }
        .lnd-pill-login-btn:hover { background: #D4A843; color: #000; box-shadow: 0 0 18px rgba(212,168,67,0.45); }
        .lnd-pill-login-btn:active { transform: scale(0.96); }

        /* ── Login Modal ── */
        .lnd-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .lnd-modal-card {
          position: relative;
          width: 100%;
          max-width: 400px;
          background: rgba(12,10,24,0.97);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 24px;
          padding: 40px 36px 36px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.06) inset;
        }
        .lnd-modal-close {
          position: absolute;
          top: 14px; right: 16px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 26px;
          line-height: 1;
          cursor: pointer;
          padding: 2px 8px;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .lnd-modal-close:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .lnd-modal-eyebrow {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.25em;
          color: rgba(212,168,67,0.7);
          margin: 0 0 10px;
          text-transform: uppercase;
        }
        .lnd-modal-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 26px;
          color: #f0eeff;
          margin: 0 0 6px;
        }
        .lnd-modal-sub {
          font-size: 13px;
          color: rgba(200,195,230,0.55);
          margin: 0 0 28px;
        }
        .lnd-modal-error {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.35);
          color: #fca5a5;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 18px;
        }
        .lnd-modal-group { margin-bottom: 18px; }
        .lnd-modal-label {
          display: block;
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: rgba(180,175,210,0.65);
          margin-bottom: 7px;
          text-transform: uppercase;
        }
        .lnd-modal-input {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #f0eeff;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .lnd-modal-input:focus { border-color: rgba(155,89,182,0.6); box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        .lnd-modal-pw-wrap { position: relative; }
        .lnd-modal-eye {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          opacity: 0.55;
          transition: opacity 0.2s;
        }
        .lnd-modal-eye:hover { opacity: 1; }
        .lnd-modal-submit {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: filter 0.2s, transform 0.18s;
          margin-top: 8px;
        }
        .lnd-modal-submit:hover { filter: brightness(1.15); }
        .lnd-modal-submit:active { transform: scale(0.98); }
        .lnd-modal-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .lnd-modal-register {
          text-align: center;
          margin-top: 22px;
          font-size: 13px;
          color: rgba(200,195,230,0.5);
        }
        .lnd-modal-register a { color: rgba(155,89,182,0.9); text-decoration: none; font-weight: 600; }
        .lnd-modal-register a:hover { color: #ce93f8; text-decoration: underline; }

        /* Mobile: stack panels */
        @media (max-width: 767px) {
          .lnd-split { flex-direction: column !important; }
          .lnd-panel { flex: 1 1 50% !important; transform: none !important; }
          .lnd-divider { top: 50%; bottom: auto; left: 0; right: 0; width: auto; height: 2px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.1) 70%, transparent);
          }
          .lnd-pill-nav { width: 90%; padding: 10px 14px; gap: 12px; }
          .lnd-pill-title { font-size: 10px; letter-spacing: 0.1em; }
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
                opacity: 0.33,
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
                  height={240}
                  className="object-contain w-36 sm:w-52 h-auto hover:scale-150 transition-transform duration-300"
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
                Sola KAYDIR // HCK-AYD-48
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
                opacity: 0.35,
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
                  className="object-contain w-36 sm:w-52 h-auto hover:scale-150 transition-transform duration-300"
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
                Sağa KAYDIR // HCK-AYD-48
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
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── Bottom Pill Navigation ────────────────────────────────── */}
      <div ref={badgeRef} className="lnd-pill-nav" onClick={e => e.stopPropagation()}>


        {/* CENTER: Title */}
        <span className="lnd-pill-title">AYDIN GENÇLİK ZİRVESİ 2026</span>

        {/* RIGHT: Login / Panel */}
        {user ? (
          <Link href="/panel" className="lnd-pill-login-btn">PANELİM</Link>
        ) : (
          <button className="lnd-pill-login-btn" onClick={() => setShowLoginModal(true)}>
            GİRİŞ YAP
          </button>
        )}
      </div>

      {/* ── Login Modal ──────────────────────────────────────── */}
      {showLoginModal && (
        <div className="lnd-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="lnd-modal-card" onClick={e => e.stopPropagation()}>
            <button className="lnd-modal-close" onClick={() => setShowLoginModal(false)} aria-label="Kapat">×</button>
            <p className="lnd-modal-eyebrow">◈ Aydın Gençlik Zirvesi — GİRİŞ SİSTEMİ ◈</p>
            <h2 className="lnd-modal-title">Giriş Yap</h2>
            <p className="lnd-modal-sub">Hesabınıza erişmek için giriş yapın.</p>

            {modalError && <div className="lnd-modal-error">{modalError}</div>}

            <form onSubmit={handleModalLogin} autoComplete="on">
              <div className="lnd-modal-group">
                <label className="lnd-modal-label" htmlFor="modal-email">E-POSTA</label>
                <input
                  id="modal-email" type="email" className="lnd-modal-input"
                  placeholder="ornek@eposta.com"
                  value={modalEmail} onChange={e => setModalEmail(e.target.value)}
                  autoComplete="email" required
                />
              </div>
              <div className="lnd-modal-group">
                <label className="lnd-modal-label" htmlFor="modal-pw">ŞİFRE</label>
                <div className="lnd-modal-pw-wrap">
                  <input
                    id="modal-pw" type={modalShowPw ? 'text' : 'password'} className="lnd-modal-input"
                    placeholder="············"
                    value={modalPassword} onChange={e => setModalPassword(e.target.value)}
                    autoComplete="current-password" required
                    style={{ paddingRight: 42 }}
                  />
                  <button type="button" className="lnd-modal-eye"
                    onClick={() => setModalShowPw(v => !v)}
                    aria-label={modalShowPw ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {modalShowPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button type="submit" className="lnd-modal-submit" disabled={modalLoading}>
                {modalLoading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
              </button>
            </form>

            <p className="lnd-modal-register">
              Hesabın yok mu?{' '}
              <Link href="/auth/register" onClick={() => setShowLoginModal(false)}>Kayıt Ol</Link>
            </p>
          </div>
        </div>
      )}

      {/* ── Egg 5: Pokémon battle ─────────────────────────── */}
      {showPoke && (
        <div className="lnd-poke-box">
          {pokeText}
        </div>
      )}

    </>
  );
}

