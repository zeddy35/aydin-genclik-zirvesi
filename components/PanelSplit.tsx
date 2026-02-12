"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface PanelSplitProps {
  onJamClick: () => void;
  onHackClick: () => void;
}

export function PanelSplit({ onJamClick, onHackClick }: PanelSplitProps) {
  const [hovered, setHovered] = useState<"left" | "right" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full bg-gradient-to-r from-[#9645ed] to-black/50">
      {/* 3D Perspective Container */}
      <div
        className="flex w-full min-h-[100svh] md:h-screen overflow-x-auto md:overflow-hidden snap-x snap-mandatory md:snap-none scroll-smooth touch-pan-x"
        style={{
          perspective: "1200px",
        }}
      >
        {/* Left Panel: Game Jam */}
        <div
          className={cn(
            "min-w-full md:min-w-0 md:flex-1 bg-[url('/backgrounds/jambg.png')] bg-no-repeat bg-center bg-[length:420px_auto] md:bg-[length:620px_auto] lg:bg-[length:820px_auto] flex flex-col items-center justify-center px-6 py-10 sm:px-8 sm:py-12 relative snap-center overflow-hidden",
            "transition-all duration-300 ease-out motion-reduce:transition-none"
          )}
          onMouseEnter={() => setHovered("left")}
          onMouseLeave={() => setHovered(null)}
          style={{
            flex: hovered === "left" ? "1.16" : hovered === "right" ? "0.84" : 1,
            transform:
              hovered === "left"
                ? "perspective(1200px) translateZ(70px) rotateY(7deg) scale(1.02)"
                : hovered === "right"
                  ? "perspective(1200px) translateZ(-10px) rotateY(-4deg) scale(0.98)"
                  : "perspective(1200px) translateZ(0) rotateY(0) scale(1)",
          }}
        >
          {/* Animated Background Gradient */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.3), transparent 70%)",
              animation: "pulse 4s ease-in-out infinite",
            }}
          />

          {/* Specular Highlight (Left) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 motion-reduce:opacity-0"
            style={{
              opacity: hovered === "left" ? 1 : 0,
            }}
          >
            <div className="absolute -inset-20 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
          </div>

          {/* Shadow Overlay (Left - when right is hovered) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 motion-reduce:opacity-0"
            style={{
              opacity: hovered === "right" ? 1 : 0,
            }}
          >
            <div className="absolute inset-y-8 -inset-x-6 rounded-[32px] bg-black/30 blur-2xl" />
          </div>

          <div 
            className={cn(
              "relative z-10 text-center max-w-md transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {/* Logo Area with Hover Effect */}
            <div className="mb-6 sm:mb-8 h-28 sm:h-32 md:h-36 flex items-center justify-center group/logo">
              <Image 
                src="/logos/gamejam.png" 
                alt="Game Jam Logo" 
                width={300} 
                height={150}
                className="object-contain drop-shadow-2xl transition-transform duration-300 group-hover/logo:scale-110"
              />
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col gap-3 pt-4 items-center">
              <Link
                href="/gamejam/basvur"
                className="group/cta relative w-full sm:w-auto"
              >
                {/* Glowing Background */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-2xl blur-xl opacity-70 group-hover/cta:opacity-100 transition-opacity duration-300 animate-gradient-xy" />
                
                {/* Button */}
                <div className="relative bg-white rounded-2xl px-12 py-4 font-black text-lg shadow-2xl group-hover/cta:shadow-purple-500/60 transition-all duration-200">
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                    Hemen Başvur
                  </span>
                </div>
              </Link>
              
              <button
                onClick={onJamClick}
                className="group/details inline-flex items-center gap-2 text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-xl px-5 py-2.5 hover:bg-white/10 transition-all duration-200"
                aria-label="Game Jam detayları"
              >
                <span className="text-sm font-semibold">Tüm Detaylar</span>
                <span className="text-2xl leading-none transition-transform duration-200 group-hover/details:-translate-x-1">
                  ←
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Hackathon */}
        <div
          className={cn(
            "min-w-full md:min-w-0 md:flex-1 flex flex-col bg-[url('/backgrounds/hackbg.png')] bg-no-repeat bg-center bg-[length:420px_auto] md:bg-[length:620px_auto] lg:bg-[length:820px_auto] items-center justify-center px-6 py-10 sm:px-8 sm:py-12 relative snap-center overflow-hidden",
            "transition-all duration-300 ease-out motion-reduce:transition-none"
          )}
          onMouseEnter={() => setHovered("right")}
          onMouseLeave={() => setHovered(null)}
          style={{
            backgroundColor: "#0B0B0F",
            flex: hovered === "right" ? "1.16" : hovered === "left" ? "0.84" : 1,
            transform:
              hovered === "right"
                ? "perspective(1200px) translateZ(70px) rotateY(-7deg) scale(1.02)"
                : hovered === "left"
                  ? "perspective(1200px) translateZ(-10px) rotateY(4deg) scale(0.98)"
                  : "perspective(1200px) translateZ(0) rotateY(0) scale(1)",
          }}
        >
          {/* Animated Background Gradient */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.2), transparent 70%)",
              animation: "pulse 4s ease-in-out infinite",
            }}
          />

          {/* Specular Highlight (Right) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 motion-reduce:opacity-0"
            style={{
              opacity: hovered === "right" ? 1 : 0,
            }}
          >
            <div className="absolute -inset-20 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
          </div>

          {/* Shadow Overlay (Right - when left is hovered) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 motion-reduce:opacity-0"
            style={{
              opacity: hovered === "left" ? 1 : 0,
            }}
          >
            <div className="absolute inset-y-8 -inset-x-6 rounded-[32px] bg-black/30 blur-2xl" />
          </div>

          <div 
            className={cn(
              "relative z-10 text-center max-w-md transition-all duration-700 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {/* Logo Area with Hover Effect */}
            <div className="mb-6 pb-8 sm:mb-8 h-28 sm:h-32 md:h-36 flex items-center justify-center group/logo">
              <Image 
                src="/logos/hackathonlogo.png" 
                alt="Hackathon Logo" 
                width={250} 
                height={150}
                className="object-contain drop-shadow-2xl transition-transform duration-300 group-hover/logo:scale-110"
              />
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col gap-3 items-center">
              <Link
                href="/hackathon/basvur"
                className="group/cta relative w-full sm:w-auto"
              >
                {/* Glowing Background */}
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl blur-xl opacity-70 group-hover/cta:opacity-100 transition-opacity duration-300 animate-gradient-xy" />
                
                {/* Button */}
                <div className="relative bg-white rounded-2xl px-12 py-4 font-black text-lg shadow-2xl group-hover/cta:shadow-green-500/60 transition-all duration-200">
                  <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                    Hemen Başvur
                  </span>
                </div>
              </Link>
              
              <button
                onClick={onHackClick}
                className="group/details inline-flex items-center gap-2 text-zinc-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-xl px-5 py-2.5 hover:bg-white/10 transition-all duration-200"
                aria-label="Hackathon detayları"
              >
                <span className="text-sm font-semibold">Tüm Detaylar</span>
                <span className="text-2xl leading-none transition-transform duration-200 group-hover/details:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Hint */}
      <div className="pointer-events-none absolute left-1/2 bottom-6 -translate-x-1/2 z-50">
        <EnhancedHintGlyph /> 
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

// Helper Components
function InfoBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full text-white font-semibold inline-flex items-center gap-1.5 hover:bg-white/35 transition-colors">
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  );
}

function InfoBadgeDark({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-zinc-200 font-semibold inline-flex items-center gap-1.5 hover:bg-white/25 transition-colors">
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg sm:text-xl font-black text-white">{value}</div>
      <div className="text-xs text-white/70 font-medium">{label}</div>
    </div>
  );
}

function StatItemDark({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg sm:text-xl font-black text-white">{value}</div>
      <div className="text-xs text-zinc-400 font-medium">{label}</div>
    </div>
  );
}

function EnhancedHintGlyph() {
  return (
    <div className="inline-flex flex-col items-center gap-4 rounded-full border border-white/25 bg-black/50 backdrop-blur-md px-5 py-3 text-white shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform">
      <span className="text-xs flex font-semibold opacity-80 inline-block">
          Kaydır
      </span>

      <div className="flex items-center gap-6">
        <span className="text-lg font-bold leading-none animate-[nL2_1.8s_ease-in-out_infinite]">
            ←
        </span>
        <span className="text-lg font-bold leading-none animate-[nD2_1.8s_ease-in-out_infinite]">
          ↓
        </span>
        <span className="text-lg font-bold leading-none animate-[nR2_1.8s_ease-in-out_infinite]">
          →
        </span>
      </div>
    </div>
  );
}