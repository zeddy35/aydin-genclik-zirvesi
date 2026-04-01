"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth as firebaseAuth, db } from "@/lib/firebase/config";
import s from "./LandingView.module.css";

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
  isActive?:   boolean;
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
    glow:     "#a78625",
    btn:      "linear-gradient(135deg,#b7791f 0%,#d97706 100%)",
  },
  text:  "#f0eeff",
  muted: "#8880a8",
};

export function LandingView({ onJamClick, onHackClick, isActive = true }: LandingViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [hovered, setHovered] = useState<"jam" | "hack" | null>(null);
  const [tapped,  setTapped]  = useState<"jam" | "hack" | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalEmail,    setModalEmail]    = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalError,    setModalError]    = useState('');
  const [modalLoading,  setModalLoading]  = useState(false);
  const [modalShowPw,   setModalShowPw]   = useState(false);

  const [panelScrolled, setPanelScrolled] = useState(false);
  useEffect(() => {
    if (!heroRef.current) return;
    let el: HTMLElement | null = heroRef.current.parentElement;
    while (el) {
      const { overflowY } = window.getComputedStyle(el);
      if (overflowY === "auto" || overflowY === "scroll") break;
      el = el.parentElement;
    }
    scrollParentRef.current = el;
    if (!el) return;
    const container = el;
    const onScroll = () => setPanelScrolled(container.scrollTop > 80);
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollDown = useCallback(() => {
    scrollParentRef.current?.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  }, []);

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
      <div ref={heroRef} className="relative h-screen w-full overflow-hidden" style={{ background: "#050508" }}>

        {/* ── Split container ───────────────────────────────────── */}
        <div
          className={`${s.split} flex h-full w-full`}
          style={{ perspective: "1200px" }}
        >

          {/* ── LEFT — Game Jam ──────────────────────────────────── */}
          <div
            className={`${s.panel} relative flex flex-col items-center justify-center px-6 sm:px-10 py-10 overflow-hidden`}
            style={{
              flex: jamFlex,
              background: `radial-gradient(ellipse 80% 100% at 60% 30%, ${T.jam.glow}, transparent 65%), ${T.jam.bgDeep}`,
              transform: jamTransform,
            }}
            onMouseEnter={() => setHovered("jam")}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setTapped("jam")}
            onTouchEnd={() => setTapped(null)}
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
              className={s.shine}
              style={{
                opacity: active === "jam" ? 1 : 0,
                background: "radial-gradient(ellipse 70% 60% at 70% 15%, rgba(255,255,255,0.13), transparent 60%)",
              }}
            />

            {/* Shadow when inactive */}
            <div
              className={s.shine}
              style={{
                opacity: active === "hack" ? 1 : 0,
                background: "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 100%)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6">
              {/* Logo */}
              <div
                className="h-52 sm:h-72 w-52 sm:w-72 flex items-center justify-center cursor-pointer"
                onClick={onJamClick}
                role="button"
                aria-label="Game Jam sayfasına git"
              >
                <Image
                  src="/logos/gamejamlogo.png"
                  alt="AGZ Game Jam Logo"
                  width={1246}
                  height={786}
                  priority
                  className="w-full h-full object-contain hover:scale-150 transition-transform duration-300"
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
                  href="/auth/register"
                  className={s.applyBtn}
                  style={{ background: T.jam.btn }}
                >
                  Başvur
                </Link>
              </div>
            </div>
          </div>



          {/* ── RIGHT — Hackathon ────────────────────────────────── */}
          <div
            className={`${s.panel} relative flex flex-col items-center justify-center px-6 sm:px-10 py-10 overflow-hidden`}
            style={{
              flex: hackFlex,
              background: `radial-gradient(ellipse 80% 100% at 40% 30%, ${T.hack.glow}, transparent 65%), ${T.hack.bgDeep}`,
              transform: hackTransform,
            }}
            onMouseEnter={() => setHovered("hack")}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setTapped("hack")}
            onTouchEnd={() => setTapped(null)}
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
              className={s.shine}
              style={{
                opacity: active === "hack" ? 1 : 0,
                background: "radial-gradient(ellipse 70% 60% at 30% 15%, rgba(255,255,255,0.13), transparent 60%)",
              }}
            />

            {/* Shadow when inactive */}
            <div
              className={s.shine}
              style={{
                opacity: active === "jam" ? 1 : 0,
                background: "linear-gradient(to left, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 100%)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6">
              {/* Logo */}
              <div
                className="h-52 sm:h-72 w-52 sm:w-72 flex items-center justify-center cursor-pointer"
                onClick={onHackClick}
                role="button"
                aria-label="Hackathon sayfasına git"
              >
                <Image
                  src="/logos/hackathonlogo.png"
                  alt="AGZ Hackathon Logo"
                  width={2648}
                  height={1859}
                  className="w-full h-full object-contain hover:scale-150 transition-transform duration-300"
                  priority
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
                  href="/auth/register"
                  className={s.applyBtn}
                  style={{ background: T.hack.btn }}
                >
                  Başvur
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* ── Nav arrows — outside panels so transforms don't move them ── */}
        <button
          onClick={onJamClick}
          className={`${s.navBtn} ${s.navBtnJam}`}
          aria-label="Game Jam tam görünümüne git"
          style={{ borderColor: `${T.jam.accent}55` }}
        >
          ←
        </button>
        <button
          onClick={onHackClick}
          className={`${s.navBtn} ${s.navBtnHack}`}
          aria-label="Hackathon tam görünümüne git"
          style={{ borderColor: `${T.hack.accent}55` }}
        >
          →
        </button>

      </div>

      {/* ── Bottom Stack: Pill + Scroll Arrow ─────────────────────── */}
      <div
        className={s.pillWrapper}
        style={{
          opacity: isActive && !panelScrolled ? 1 : 0,
          pointerEvents: isActive && !panelScrolled ? "auto" : "none",
          transition: "opacity 0.4s ease",
          animationPlayState: isActive ? "running" : "paused",
        }}
      >
        {/* Pill — chevron left, title center, login right */}
        <div
          className={s.pillNav}
          onClick={e => e.stopPropagation()}
        >
          <button
            className={s.pillChevron}
            onClick={handleScrollDown}
            aria-label="Aşağı kaydır"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className={s.pillTitle}>
            <span className={s.pillTitleLong}>AYDIN GENÇLİK ZİRVESİ 2026</span>
            <span className={s.pillTitleShort}>AGZ 2026</span>
          </span>
          {user ? (
            <Link href="/panel" className={s.pillLoginBtn}>PANELİM</Link>
          ) : (
            <button className={s.pillLoginBtn} onClick={() => setShowLoginModal(true)}>
              GİRİŞ YAP
            </button>
          )}
        </div>
      </div>

      {/* ── Login Modal ──────────────────────────────────────── */}
      {showLoginModal && (
        <div className={s.modalOverlay} onClick={() => setShowLoginModal(false)}>
          <div className={s.modalCard} onClick={e => e.stopPropagation()}>
            <button className={s.modalClose} onClick={() => setShowLoginModal(false)} aria-label="Kapat">×</button>
            <p className={s.modalEyebrow}>◈ Aydın Gençlik Zirvesi — GİRİŞ SİSTEMİ ◈</p>
            <h2 className={s.modalTitle}>Giriş Yap</h2>
            <p className={s.modalSub}>Hesabınıza erişmek için giriş yapın.</p>

            {modalError && <div className={s.modalError}>{modalError}</div>}

            <form onSubmit={handleModalLogin} autoComplete="on">
              <div className={s.modalGroup}>
                <label className={s.modalLabel} htmlFor="modal-email">E-POSTA</label>
                <input
                  id="modal-email" type="email" className={s.modalInput}
                  placeholder="ornek@eposta.com"
                  value={modalEmail} onChange={e => setModalEmail(e.target.value)}
                  autoComplete="email" required
                />
              </div>
              <div className={s.modalGroup}>
                <label className={s.modalLabel} htmlFor="modal-pw">ŞİFRE</label>
                <div className={s.modalPwWrap}>
                  <input
                    id="modal-pw" type={modalShowPw ? 'text' : 'password'} className={s.modalInput}
                    placeholder="············"
                    value={modalPassword} onChange={e => setModalPassword(e.target.value)}
                    autoComplete="current-password" required
                    style={{ paddingRight: 42 }}
                  />
                  <button type="button" className={s.modalEye}
                    onClick={() => setModalShowPw(v => !v)}
                    aria-label={modalShowPw ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {modalShowPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button type="submit" className={s.modalSubmit} disabled={modalLoading}>
                {modalLoading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
              </button>
            </form>

            <p className={s.modalRegister}>
              Hesabın yok mu?{' '}
              <span style={{ color: '#666', cursor: 'not-allowed' }}>Kayıt Ol (Şimdilik Kapalı)</span>
            </p>
          </div>
        </div>
      )}


    </>
  );
}

