'use client';

import { useState, useEffect } from 'react';

/** Returns the current hour in Turkey Standard Time (UTC+3). */
function getTurkeyTime(): { h: number; m: number; s: number } {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const trt   = new Date(utcMs + 3 * 3_600_000);
  return { h: trt.getHours(), m: trt.getMinutes(), s: trt.getSeconds() };
}

/** Dark hours: 21:00–09:00 Turkey time. */
function isDarkTime(h: number): boolean {
  return h >= 21 || h < 9;
}

/** Milliseconds until the next 09:00 or 21:00 boundary in Turkey time. */
function msToNextBoundary(): number {
  const { h, m, s } = getTurkeyTime();
  const elapsed = h * 3600 + m * 60 + s;
  const b9  = 9  * 3600;
  const b21 = 21 * 3600;
  if (elapsed < b9)  return (b9  - elapsed) * 1000;
  if (elapsed < b21) return (b21 - elapsed) * 1000;
  return (24 * 3600 - elapsed + b9) * 1000;
}

/**
 * Returns 'dark' between 21:00–09:00 Turkey time, 'light' otherwise.
 * Automatically re-evaluates at each boundary.
 */
export function useThemeMode(): 'dark' | 'light' {
  // SSR-safe: default to dark so first paint matches the common night-time use
  const [mode, setMode] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const update = () =>
      setMode(isDarkTime(getTurkeyTime().h) ? 'dark' : 'light');

    update(); // resolve on client immediately

    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => { update(); schedule(); }, msToNextBoundary());
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return mode;
}
