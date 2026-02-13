"use client";

import React, { useState, useRef, useEffect } from "react";
import { CreditsCrawlOverlay } from "./CreditsCrawlOverlay";
import { StarfieldCanvas } from "./StarfieldCanvas";

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

  return (
    <footer className="w-full border-t border-gray-800 bg-gradient-to-r from-gray-900 via-gray-950 to-black">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="text-gray-500 text-sm">
          © 2024 Aydın Gençlik Zirvesi. All rights reserved.
        </div>

        {/* Star Icon for Credits */}
        <div
          ref={starIconRef}
          onMouseDown={handleStarMouseDown}
          onMouseUp={handleStarMouseUp}
          onMouseLeave={handleStarMouseUp}
          className="relative cursor-pointer group"
        >
          <div className="text-2xl text-gray-800 hover:text-yellow-400 transition-colors duration-200">
            ★
          </div>

          {/* Idle Tooltip */}
          {showIdleTooltip && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-xs text-gray-300 rounded whitespace-nowrap animate-fade-in">
              Hold for credits ⭐
            </div>
          )}
        </div>
      </div>

      {/* Credits Overlay */}
      {showCredits && (
        <CreditsCrawlOverlay isOpen={showCredits} onClose={() => setShowCredits(false)} />
      )}
    </footer>
  );
}
