"use client";

import React, { useEffect, useRef, useState } from "react";
import { easterEggEngine } from "@/lib/easterEggs/engine";
import { eggs } from "@/lib/easterEggs/eggs";
import { createKonamiListener } from "@/lib/easterEggs/konami";
import { EasterToast } from "./EasterToast";

export function EasterEggProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([]);
  const clickCountRef = useRef<Map<string, number>>(new Map());
  const longPressRef = useRef<{ timeout: NodeJS.Timeout | null }>({ timeout: null });

  useEffect(() => {
    // Register all eggs
    eggs.forEach((egg) => easterEggEngine.registerEgg(egg));

    // Setup Konami listener
    const unsubscribeKonami = createKonamiListener(() => {
      console.log("[EasterEgg] Konami triggered, calling easterEggEngine.triggerEgg");
      easterEggEngine.triggerEgg("konami-credits");
    });

    // Setup custom event listeners
    const handleEasterEggUnlocked = (e: Event) => {
      const event = e as CustomEvent;
      const { id, name } = event.detail;
      console.log(`[EasterEgg] Unlocked! ID: ${id}, Name: ${name}`);
      addToast(`Achievement unlocked: ${name}`);
    };

    window.addEventListener("easter-egg-unlocked", handleEasterEggUnlocked);

    return () => {
      unsubscribeKonami();
      window.removeEventListener("easter-egg-unlocked", handleEasterEggUnlocked);
    };
  }, []);

  const addToast = (message: string) => {
    const id = Math.random().toString(36);
    console.log(`[Toast] Adding toast: ${message}`);
    setToasts((prev) => [...prev, { id, message }]);
    
    // Play achievement sound (Web Audio API)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Beep: 800Hz to 1200Hz ramp up
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      
      // Fade out
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Audio context not supported, continue silently
    }
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <>
      {children}
      <div className="fixed top-6 right-6 z-[9999] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <EasterToast message={toast.message} />
          </div>
        ))}
      </div>
    </>
  );
}
