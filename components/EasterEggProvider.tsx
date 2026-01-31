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
      easterEggEngine.triggerEgg("konami-credits");
    });

    // Setup custom event listeners
    const handleEasterEggUnlocked = (e: Event) => {
      const event = e as CustomEvent;
      const { id, name } = event.detail;
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
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <>
      {children}
      <div className="fixed bottom-8 left-8 z-40 space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <EasterToast message={toast.message} />
          </div>
        ))}
      </div>
    </>
  );
}
