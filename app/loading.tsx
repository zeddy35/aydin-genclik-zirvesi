"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const ChromeDinoGame = dynamic(() => import("react-chrome-dino"), { ssr: false });

// Toplam loading süresi page.tsx'deki timer ile eşleşmeli (4000ms)
const TOTAL_MS = 4000;

export default function Loading() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  /* ── Progress bar: 0→100 in TOTAL_MS ── */
  useEffect(() => {
    const start = performance.now();

    const tick = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min(Math.floor((elapsed / TOTAL_MS) * 100), 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── Auto-start dino (desktop only) ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 32, code: "Space", bubbles: true }));
      document.dispatchEvent(new KeyboardEvent("keyup",   { keyCode: 32, code: "Space", bubbles: true }));
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  /* ── Patch Runner: kaktüs yok, koyu arka plan ── */
  useEffect(() => {
    let patchInterval: ReturnType<typeof setInterval>;
    let cleanInterval: ReturnType<typeof setInterval>;

    patchInterval = setInterval(() => {
      const runner = (window as any).Runner?.instance_;
      if (!runner) return;
      clearInterval(patchInterval);

      if (runner.horizon) {
        runner.horizon.addNewObstacle = () => {};
        runner.horizon.obstacles = [];
      }
      runner.config.CLEAR_TIME = 9_999_999;
    }, 50);

    cleanInterval = setInterval(() => {
      const runner = (window as any).Runner?.instance_;
      if (runner?.horizon?.obstacles?.length > 0) runner.horizon.obstacles = [];
    }, 100);

    return () => {
      clearInterval(patchInterval);
      clearInterval(cleanInterval);
      // Runner'ın document'e eklediği klavye listener'larını temizle
      const runner = (window as any).Runner?.instance_;
      if (runner) {
        try { runner.stopListening(); } catch (_) {}
        try { runner.stop(); } catch (_) {}
      }
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@800&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Layout ── */
        .l-wrap {
          animation: fadeIn 0.6s ease forwards;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #0a0a0f;
          padding: 0 16px;
          box-sizing: border-box;
          gap: 0;
        }

        /* ── Title ── */
        .l-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(16px, 4vw, 22px);
          color: #d1cfe8;
          letter-spacing: 0.05em;
          margin: 0 0 8px;
          text-align: center;
        }

        /* ── Dino game area ── */
        .l-dino {
          display: block;
          width: min(600px, 92vw);
          overflow: hidden;
        }
        .l-dino .runner-container,
        #offline-resources,
        .runner-container {
          background: #0a0a0f !important;
        }
        .l-dino canvas {
          background: #0a0a0f !important;
          filter: brightness(1.1);
          max-width: 100%;
        }
        .l-dino .runner-score-holder { display: none !important; }

        /* ── Progress section ── */
        .l-progress-wrap {
          width: min(600px, 92vw);
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* Bar track */
        .l-bar-track {
          width: 100%;
          height: 3px;
          background: #1a1a2e;
          border-radius: 2px;
          overflow: hidden;
        }

        /* Bar fill */
        .l-bar-fill {
          height: 100%;
          background: #d4a843;
          border-radius: 2px;
          transition: width 0.05s linear;
          box-shadow: 0 0 8px rgba(212, 168, 67, 0.5);
        }

        /* Percentage + label row */
        .l-bar-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .l-bar-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.25em;
          color: #4a4568;
          text-transform: uppercase;
        }
        .l-bar-pct {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: #d4a843;
          min-width: 36px;
          text-align: right;
        }

        /* ── Year ── */
        .l-year {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.3em;
          color: #4a4568;
          margin-top: 20px;
        }
      `}</style>

      <div className="l-wrap">
        <p className="l-title">AYDIN GENÇLİK ZİRVESİ</p>

        {/* Tek ChromeDinoGame instance — mobile ve desktop için */}
        <div className="l-dino" ref={wrapperRef}>
          <ChromeDinoGame />
        </div>

        {/* Progress bar */}
        <div className="l-progress-wrap">
          <div className="l-bar-track">
            <div className="l-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="l-bar-meta">
            <span className="l-bar-label">yükleniyor</span>
            <span className="l-bar-pct">%{progress}</span>
          </div>
        </div>

        <p className="l-year">2026</p>
      </div>
    </>
  );
}

