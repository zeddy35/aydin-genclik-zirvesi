"use client";

import React, { useState, useRef, useEffect } from "react";
import { CreditsCrawlOverlay } from "./CreditsCrawlOverlay";
import { StarfieldCanvas } from "./StarfieldCanvas";

// ── Design tokens (mirror SummitInfo) ────────────────────────
const F = {
  bg:           "#07060f",
  border:       "#1e1a2e",
  text:         "#e2e0f0",
  muted:        "#6b6880",
  gold:         "#d4a843",
  violetLight:  "#a78bfa",
  display:      "'Syne', sans-serif",
  mono:         "'Share Tech Mono', monospace",
};

function GDGMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke={F.gold} strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="24" r="16" fill="#1a1730" />
      <text x="24" y="30" textAnchor="middle" fontSize="18" fontWeight="700"
        fontFamily="Syne, sans-serif" fill={F.gold}>G</text>
    </svg>
  );
}

function OTTMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke={F.violetLight} strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="24" r="16" fill="#1a1730" />
      <text x="24" y="30" textAnchor="middle" fontSize="18" fontWeight="700"
        fontFamily="Syne, sans-serif" fill={F.violetLight}>O</text>
    </svg>
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
    { label: "Instagram", href: "https://instagram.com" },
    { label: "LinkedIn",  href: "https://linkedin.com" },
    { label: "Twitter",   href: "https://twitter.com" },
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
      {/* Subtle starfield */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.35, pointerEvents: "none" }}>
        <StarfieldCanvas />
      </div>

      {/* Gradient accent line */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 1,
        background: "linear-gradient(90deg, transparent 0%, #7c3aed 30%, #d4a843 70%, transparent 100%)",
        opacity: 0.6,
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
        </div>

        {/* Center — name + attribution */}
        <div style={{ textAlign: "center", flex: 1, minWidth: 180 }}>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 13, color: F.text, letterSpacing: "-0.01em" }}>
            Aydın Gençlik Zirvesi 2026
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: F.muted, marginTop: 4 }}>
            GDG on Campus Aydın × OTT
          </div>
        </div>

        {/* Right — socials + star */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: F.mono,
                fontSize: 9,
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
                color: F.muted,
                padding: "6px 10px",
                border: `1px solid ${F.border}`,
                borderRadius: 6,
                textDecoration: "none",
                transition: "color 0.2s, border-color 0.2s",
                minHeight: 32,
                display: "inline-flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = F.text; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#2d2848"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = F.muted; (e.currentTarget as HTMLAnchorElement).style.borderColor = F.border; }}
            >
              {s.label}
            </a>
          ))}

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
                color: showIdleTooltip ? F.gold : F.border,
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
                background: "#13111f",
                border: `1px solid ${F.border}`,
                borderRadius: 6,
                padding: "5px 10px",
                fontFamily: F.mono,
                fontSize: 10,
                letterSpacing: "0.1em",
                color: F.muted,
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
