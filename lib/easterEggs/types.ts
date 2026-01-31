// lib/easterEggs/types.ts

export interface EasterEgg {
  id: string;
  name: string;
  description?: string;
  trigger: "konami" | "long-press" | "click-sequence" | "keyboard-shortcut" | "time-based";
  triggerConfig?: {
    key?: string; // for keyboard-shortcut
    count?: number; // for click-sequence
    duration?: number; // for long-press in ms
    time?: string; // for time-based (e.g., "00:00")
  };
  cooldown?: number; // ms
  enabled: boolean;
  rarity?: "common" | "rare" | "legendary";
  callback: () => void | Promise<void>;
}

export interface EasterEggState {
  id: string;
  unlocked: boolean;
  seenCount: number;
  lastTriggeredAt?: number;
}

export interface EasterEggContextType {
  registerEgg: (egg: EasterEgg) => void;
  unregisterEgg: (id: string) => void;
  isEggUnlocked: (id: string) => boolean;
  triggerEgg: (id: string) => Promise<void>;
  eggs: Map<string, EasterEgg>;
  states: Map<string, EasterEggState>;
}
