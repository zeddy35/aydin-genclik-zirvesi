"use client";

import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function EventCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      // 16 Mayıs 2026, 09:00 TR (UTC+3)
      const targetDate = new Date("2026-05-16T09:00:00+03:00").getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const reduceMotion = typeof window !== "undefined" && 
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CountdownBox = ({ 
    value, 
    label, 
    color 
  }: { 
    value: number; 
    label: string; 
    color: "gj" | "hack" 
  }) => (
    <div
      className={`flex flex-col items-center px-3 py-2 rounded-lg backdrop-blur-sm ${
        color === "gj"
          ? "bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30"
          : "bg-white/5 border border-white/10"
      } ${!reduceMotion && "transition-all duration-300 hover:scale-105"}`}
    >
      <div
        className={`text-2xl font-bold tabular-nums ${
          color === "gj" ? "text-cyan-400" : "text-white"
        }`}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
  );

  return (
    <div className="w-full bg-gradient-to-r from-black via-gray-950 to-black border-y border-gray-800 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8">

          {/* Countdown Side */}
          <div className="flex flex-col items-center space-y-3">
            <h3 className="text-sm font-semibold text-white/80">
              Etkinliklerin Başlamasına Kalan Süre
            </h3>
            <div className="flex gap-2">
              <CountdownBox value={timeLeft.days} label="Gün" color="hack" />
              <CountdownBox value={timeLeft.hours} label="Saat" color="hack" />
              <CountdownBox value={timeLeft.minutes} label="Dakika" color="hack" />
              <CountdownBox value={timeLeft.seconds} label="Saniye" color="hack" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
