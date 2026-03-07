"use client";

import React, { useState, useRef, useEffect } from "react";
import { CreditsCrawlOverlay } from "./CreditsCrawlOverlay";
import Image from "next/image";

// ── Design tokens (mirror SummitInfo light theme) ───────────
const F = {
  bg:          "#f0edf8",
  surf:        "#faf9fd",
  border:      "#ddd8ef",
  borderHigh:  "#c4bce0",
  text:        "#16142a",
  muted:       "#5c5778",
  faint:       "#c0b9d8",
  gold:        "#b8891e",
  violetLight: "#7c3aed",
  display:     "'Syne', sans-serif",
  mono:        "'Share Tech Mono', monospace",
};

function GDGMark() {
  return (
    <button >
      <Image src="/logos/gdg-logo.svg" alt="GDG Mark" width={40} height={40} style={{ borderRadius: "20%" }} />
    </button>
  );
}

function OTTMark() {
  return (
    <Image src="/logos/ott-logo.png" alt="OTT Mark" width={40} height={40} style={{ borderRadius: "20%" }} />
  );
}

function HSDMark() {
  return (
    <Image src="/logos/hsd-logo.svg" alt="HSD Mark" width={40} height={40} style={{ borderRadius: "20%" }} />
  );
}

export function Footer() {
  const [showCredits, setShowCredits] = useState(false);
  const [showIdleTooltip, setShowIdleTooltip] = useState(false);
  const starIconRef = useRef<HTMLDivElement>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Idle tooltip logic
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setShowIdleTooltip(false);
      
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      
      idleTimeoutRef.current = setTimeout(() => {
        setShowIdleTooltip(true);
      }, 8000);
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    idleTimeoutRef.current = setTimeout(() => {
      setShowIdleTooltip(true);
    }, 8000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  // Long-press handler
  const handleStarMouseDown = () => {
    longPressTimeoutRef.current = setTimeout(() => {
      setShowCredits(true);
      setShowIdleTooltip(false);
    }, 2000);
  };

  const handleStarMouseUp = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+E to toggle credits
      if (e.ctrlKey && e.shiftKey && e.key === "E") {
        e.preventDefault();
        setShowCredits(!showCredits);
        return;
      }

      // Konami code is handled by EasterEggProvider globally
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCredits]);

  const SOCIALS = [
    { label: "GDG Instagram", href: "#" },
    { label: "OTT Instagram",  href: "#" },
    { label: "HSD Instagram",   href: "#" },
  ];

  return (
    <footer
      style={{
        background: F.bg,
        borderTop: `1px solid ${F.border}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient accent line */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${F.violetLight} 30%, ${F.gold} 70%, transparent 100%)`,
        opacity: 0.5,
      }} />

      <div style={{
        position: "relative",
        maxWidth: 1040,
        margin: "0 auto",
        padding: "clamp(20px,3vw,32px) clamp(16px,4vw,32px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 20,
      }}>

        {/* Left — organiser marks */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <GDGMark />
          <div style={{ width: 1, height: 28, background: F.border }} />
          <OTTMark />
          <div style={{ width: 1, height: 28, background: F.border }} />
          <HSDMark />
        </div>

        {/* Center — name + attribution */}
        <div style={{ textAlign: "center", flex: 1, minWidth: 180 }}>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 15, color: F.text, letterSpacing: "-0.01em" }}>
            Aydın Gençlik Zirvesi 2026
          </div>
        </div>

        {/* Right — socials + star */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

          {/* Star — long-press for credits */}
          <div
            ref={starIconRef}
            onMouseDown={handleStarMouseDown}
            onMouseUp={handleStarMouseUp}
            onMouseLeave={handleStarMouseUp}
            style={{ position: "relative", cursor: "pointer", marginLeft: 4 }}
          >
            <div
              style={{
                fontSize: 20,
                color: showIdleTooltip ? F.gold : F.faint,
                transition: "color 0.3s",
                userSelect: "none",
              }}
              role="button"
              aria-label="Hold for credits"
            >
              ★
            </div>
            {showIdleTooltip && (
              <div style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                right: 0,
                whiteSpace: "nowrap",
                background: F.surf,
                border: `1px solid ${F.border}`,
                borderRadius: 6,
                padding: "5px 10px",
                fontFamily: F.mono,
                fontSize: 10,
                letterSpacing: "0.1em",
                color: F.muted,
                boxShadow: "0 4px 16px rgba(109,40,217,0.08)",
              }}>
                Hold for credits ⭐
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Credits Overlay */}
      {showCredits && (
        <CreditsCrawlOverlay isOpen={showCredits} onClose={() => setShowCredits(false)} />
      )}
    </footer>
  );
}
