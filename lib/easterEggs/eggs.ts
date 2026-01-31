// lib/easterEggs/eggs.ts

import { EasterEgg } from "./types";

export const eggs: EasterEgg[] = [
  {
    id: "credits-crawl",
    name: "Credits Crawl",
    description: "Star Wars style credits experience",
    trigger: "long-press",
    triggerConfig: { duration: 2000 },
    enabled: true,
    rarity: "rare",
    callback: () => {
      // Callback handled by UI component
      const event = new CustomEvent("show-credits-crawl");
      window.dispatchEvent(event);
    },
  },
  {
    id: "konami-credits",
    name: "Secret Code",
    description: "Unlock the ancient code",
    trigger: "konami",
    enabled: true,
    rarity: "legendary",
    callback: () => {
      const event = new CustomEvent("show-credits-crawl");
      window.dispatchEvent(event);
    },
  },
  {
    id: "logo-click-7",
    name: "Lucky Number",
    description: "Click the logo 7 times",
    trigger: "click-sequence",
    triggerConfig: { count: 7 },
    enabled: true,
    rarity: "rare",
    callback: async () => {
      const event = new CustomEvent("easter-egg-unlocked", {
        detail: { id: "logo-click-7", name: "Lucky Number" },
      });
      window.dispatchEvent(event);
    },
  },
];
