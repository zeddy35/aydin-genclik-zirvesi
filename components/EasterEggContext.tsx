"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

/* ─────────────────────────────────────────────────────────────────
   EasterEggContext
   Tracks which of the 5 new easter eggs have been discovered
   this session. When all 5 fire → achievement toast.

   Egg IDs:
     egg-portal      (SummitInfo sponsors 3-click)
     egg-terminal    (Global 5-rapid-click terminal)
     egg-minecraft   (HackFullView "Ücretsiz" 3s hover)
     egg-amogus      (GameJam FAQ 3× open/close)
     egg-pokemon     (LandingView both panels clicked)
   ───────────────────────────────────────────────────────────────── */

const ALL_EGG_IDS = [
  "egg-portal",
  "egg-terminal",
  "egg-minecraft",
  "egg-amogus",
  "egg-pokemon",
] as const;

interface EggContextValue {
  markEggSeen: (id: string) => void;
  hasSeenEgg: (id: string) => boolean;
  seenCount: number;
}

const EggContext = createContext<EggContextValue>({
  markEggSeen: () => {},
  hasSeenEgg: () => false,
  seenCount: 0,
});

export function useEasterEggs() {
  return useContext(EggContext);
}

// ── Achievement toast ────────────────────────────────────────────
function AchievementToast({ onDone }: { onDone: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 6500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <>
      <style>{`
        @keyframes egg-achieve-in {
          from { transform: translateY(-32px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        .egg-achieve {
          position: fixed;
          top: 28px;
          right: 28px;
          z-index: 10000;
          background: #0f0d1a;
          border: 1.5px solid #d4a843;
          border-radius: 10px;
          padding: 16px 24px;
          font-family: 'Share Tech Mono', monospace;
          color: #d4a843;
          font-size: 13px;
          letter-spacing: 0.05em;
          text-align: center;
          box-shadow: 0 4px 32px rgba(212,168,67,0.18), 0 0 0 1px #1a1730;
          animation: egg-achieve-in 0.5s ease forwards;
          max-width: 320px;
        }
        .egg-achieve-sub {
          font-size: 11px;
          color: #8b6a20;
          margin-top: 6px;
        }
      `}</style>
      <div className="egg-achieve">
        🏆 TÜM EASTER EGG&apos;LER BULUNDU!
        <div className="egg-achieve-sub">&quot;Gerçek bir ajan olduğunu kanıtladın.&quot; — Dino &amp; Beta</div>
      </div>
    </>
  );
}

// ── Provider ─────────────────────────────────────────────────────
export function EasterEggContext({ children }: { children: React.ReactNode }) {
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [showAchievement, setShowAchievement] = useState(false);
  const achievementShownRef = useRef(false);

  const markEggSeen = useCallback((id: string) => {
    setSeen((prev) => {
      const next = new Set([...prev, id]);
      if (next.size >= ALL_EGG_IDS.length && !achievementShownRef.current) {
        achievementShownRef.current = true;
        setTimeout(() => setShowAchievement(true), 600);
      }
      return next;
    });
  }, []);

  const hasSeenEgg = useCallback(
    (id: string) => seen.has(id),
    [seen]
  );

  return (
    <EggContext.Provider
      value={{ markEggSeen, hasSeenEgg, seenCount: seen.size }}
    >
      {children}
      {showAchievement && (
        <AchievementToast onDone={() => { setShowAchievement(false); achievementShownRef.current = false; }} />
      )}
    </EggContext.Provider>
  );
}
