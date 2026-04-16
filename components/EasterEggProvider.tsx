"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { easterEggEngine } from "@/lib/easterEggs/engine";
import { eggs } from "@/lib/easterEggs/eggs";
import { EasterToast } from "./EasterToast";
import { useEasterEggs } from "./EasterEggContext";

/* ─────────────────────────────────────────────────────────────
   Terminal commands map
   ───────────────────────────────────────────────────────────── */
type OutputEntry = { text: string; type: "success" | "error" | "info" | "special" };

const TERMINAL_COMMANDS: Record<string, () => OutputEntry[]> = {
  404:     () => [{ text: "Sen 2024 Stand etkinliğinde oradaydın...", type: "special" }],
  RAWR:    () => [{ text: "TANRI SIZI KORUSUN. RAWR! 🦕  [ekran titredi]", type: "special" }],
  EARLY:   () => [{ text: "*bıyığını büker* Henüz hazır değil. v0.0.1 yeter. — E.E.", type: "info" }],
  HSD:     () => [{ text: "Pandayı üzmeyin :3 ", type: "success" }],
  DINO:    () => [{ text: "🦕 ~wob wob wob~  [Dino dans ediyor]", type: "success" }],
  MIRZAHAN: () => [
    { text: "MIRZAHAN", type: "special" },
    { text: "// THE DICTATOR //", type: "special" },
  ],
  GDG:     () => [
    { text: "GOOGLE DEVELOPER GROUPS on ADU", type: "success" },
    { text: "// CHAPTER ACTIVE // MEMBERS: ???,", type: "success" },
  ],
  OTT: () => [
    { text: "OYUN VE TASARIM TOPLULUĞU", type: "special" },
    { text: "// LEVEL: MAX // QUESTS: ACTIVE", type: "special" },
  ],
  AYDIN: () => [
    { text: "Bu şehirde bir zirve var.", type: "info" },
    { text: "16 Mayıs 2026. Hazır mısın?", type: "info" },
  ],
};

export function EasterEggProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([]);

  // ── Terminal state ───────────────────────────────────────────
  const [terminalOpen,   setTerminalOpen]   = useState(false);
  const [terminalInput,  setTerminalInput]  = useState("");
  const [terminalOutput, setTerminalOutput] = useState<OutputEntry[]>([]);
  const [attempts,       setAttempts]       = useState(0);
  const inputRef       = useRef<HTMLInputElement>(null);
  const { markEggSeen } = useEasterEggs();

  // ── Footer terminal button trigger ──────────────────────────
  useEffect(() => {
    const handleOpen = () => {
      setTerminalOpen(true);
      markEggSeen("egg-terminal");
    };
    window.addEventListener("agz-open-terminal", handleOpen);
    return () => window.removeEventListener("agz-open-terminal", handleOpen);
  }, [markEggSeen]);

  // ── Escape / focus when terminal opens ──────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTerminalOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (terminalOpen) {
      setTerminalInput("");
      setTerminalOutput([
        { text: "AGZ SECURE TERMINAL v1.0", type: "info" },
        { text: "─────────────────────────────────────────", type: "info" },
        { text: "> Kimlik doğrulama gerekli", type: "info" },
        { text: "> Şifreyi girin ve Enter'a basın:", type: "info" },
      ]);
      setAttempts(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [terminalOpen]);

  const handleTerminalSubmit = useCallback(() => {
    const cmd = terminalInput.trim().toUpperCase();
    setTerminalInput("");

    if (TERMINAL_COMMANDS[cmd]) {
      const lines = TERMINAL_COMMANDS[cmd]();
      setTerminalOutput((prev) => [...prev, { text: `$ ${cmd}`, type: "info" as const }, ...lines]);
      setAttempts(0);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setTerminalOutput((prev) => [
          ...prev,
          { text: `$ ${cmd}`, type: "error" as const },
          { text: "ERİŞİM REDDEDİLDİ. İpucu: 'RAWR'", type: "error" as const },
        ]);
        setAttempts(0);
      } else {
        setTerminalOutput((prev) => [
          ...prev,
          { text: `$ ${cmd}`, type: "error" as const },
          { text: `Bilinmeyen komut. Deneme hakkı: ${3 - newAttempts}`, type: "error" as const },
        ]);
      }
    }
  }, [terminalInput, attempts]);

  // ── Easter egg engines ───────────────────────────────────────
  useEffect(() => {
    eggs.forEach((egg) => easterEggEngine.registerEgg(egg));
    const handleEasterEggUnlocked = (e: Event) => {
      const event = e as CustomEvent;
      const { name } = event.detail;
      addToast(`Achievement unlocked: ${name}`);
    };
    window.addEventListener("easter-egg-unlocked", handleEasterEggUnlocked);
    return () => {
      window.removeEventListener("easter-egg-unlocked", handleEasterEggUnlocked);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToast = (message: string) => {
    const id = Math.random().toString(36);
    setToasts((prev) => [...prev, { id, message }]);
    try {
      const audioContext = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
      const oscillator = audioContext.createOscillator();
      const gainNode   = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (_) { /* silent */ }
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const outputColor = (type: OutputEntry["type"]) => {
    if (type === "error")   return "#dc2626";
    if (type === "success") return "#4ade80";
    if (type === "special") return "#a78bfa";
    return "#166534";
  };

  return (
    <>
      {children}

      {/* ── Toast stack ─────────────────────────────────────── */}
      <div className="fixed top-6 right-6 z-[9999] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <EasterToast message={toast.message} />
          </div>
        ))}
      </div>

      {/* ── Terminal overlay (Egg 2) ─────────────────────────── */}
      {terminalOpen && (
        <>
          <style>{`
            @keyframes term-blink { 0%,100%{opacity:1} 50%{opacity:0} }
            .term-cursor { display: inline-block; animation: term-blink 1s step-end infinite; }
          `}</style>
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setTerminalOpen(false); }}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "rgba(0,0,0,0.92)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                width: "min(480px, 90vw)",
                background: "#050a05",
                border: "1px solid #1a3a1a",
                borderRadius: 6,
                padding: 24,
                fontFamily: "'Share Tech Mono', 'Courier New', monospace",
                color: "#4ade80",
                boxShadow: "0 0 60px rgba(74,222,128,0.08), 0 0 0 1px #0a1a0a",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontSize: 11, letterSpacing: "0.15em", color: "#166534",
                marginBottom: 16, borderBottom: "1px solid #0f2a0f", paddingBottom: 12,
              }}>
                <span>AGZ SECURE TERMINAL v1.0</span>
                <button
                  onClick={() => setTerminalOpen(false)}
                  style={{ background: "none", border: "none", color: "#166534", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                  aria-label="Kapat"
                >
                  [X]
                </button>
              </div>

              {/* Output */}
              <div style={{ fontSize: 12, lineHeight: 1.8, marginBottom: 16, maxHeight: 200, overflowY: "auto" }}>
                {terminalOutput.map((line, i) => (
                  <div key={i} style={{ color: outputColor(line.type) }}>{line.text}</div>
                ))}
              </div>

              {/* Input row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid #0f2a0f", paddingTop: 12 }}>
                <span style={{ color: "#4ade80", fontSize: 14 }}>$</span>
                <input
                  ref={inputRef}
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === "Enter") handleTerminalSubmit(); }}
                  style={{
                    background: "none", border: "none", outline: "none",
                    fontFamily: "inherit", fontSize: 14,
                    color: "#4ade80", flex: 1, caretColor: "#4ade80",
                    letterSpacing: "0.08em",
                  }}
                  placeholder=""
                  autoComplete="off"
                  spellCheck={false}
                />
                <span className="term-cursor" style={{ color: "#4ade80", fontSize: 14 }}>█</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
