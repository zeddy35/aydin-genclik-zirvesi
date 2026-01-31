// lib/easterEggs/engine.ts

import { EasterEgg, EasterEggState } from "./types";

const STORAGE_PREFIX = "egg_";
const COOLDOWN_MS = 3000; // Default cooldown

export class EasterEggEngine {
  private eggs: Map<string, EasterEgg> = new Map();
  private states: Map<string, EasterEggState> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadStates();
  }

  private loadStates() {
    if (typeof window === "undefined") return;

    this.eggs.forEach((egg) => {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${egg.id}`);
      if (stored) {
        this.states.set(egg.id, JSON.parse(stored));
      } else {
        this.states.set(egg.id, {
          id: egg.id,
          unlocked: false,
          seenCount: 0,
        });
      }
    });
  }

  private saveState(id: string) {
    if (typeof window === "undefined") return;

    const state = this.states.get(id);
    if (state) {
      localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(state));
    }
  }

  registerEgg(egg: EasterEgg) {
    this.eggs.set(egg.id, egg);
    if (!this.states.has(egg.id)) {
      this.states.set(egg.id, {
        id: egg.id,
        unlocked: false,
        seenCount: 0,
      });
    }
  }

  unregisterEgg(id: string) {
    this.eggs.delete(id);
    this.states.delete(id);
  }

  isEggUnlocked(id: string): boolean {
    return this.states.get(id)?.unlocked ?? false;
  }

  async triggerEgg(id: string): Promise<void> {
    const egg = this.eggs.get(id);
    const state = this.states.get(id);

    if (!egg || !state || !egg.enabled) {
      return;
    }

    // Check cooldown
    if (state.lastTriggeredAt) {
      const cooldown = egg.cooldown ?? COOLDOWN_MS;
      if (Date.now() - state.lastTriggeredAt < cooldown) {
        return;
      }
    }

    // Update state
    state.unlocked = true;
    state.seenCount += 1;
    state.lastTriggeredAt = Date.now();
    this.states.set(id, state);
    this.saveState(id);

    // Call callback
    await egg.callback();

    // Notify listeners
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getAllEggs(): EasterEgg[] {
    return Array.from(this.eggs.values());
  }

  getState(id: string): EasterEggState | undefined {
    return this.states.get(id);
  }
}

export const easterEggEngine = new EasterEggEngine();
