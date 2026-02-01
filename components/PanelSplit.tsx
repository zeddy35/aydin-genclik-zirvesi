"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";
import jambg from "@/public/backgrounds/jambg.png";
import hackbg from "@/public/backgrounds/hackbg.png";

interface PanelSplitProps {
  onJamClick: () => void;
  onHackClick: () => void;
}

export function PanelSplit({ onJamClick, onHackClick }: PanelSplitProps) {
  const [hovered, setHovered] = useState<"left" | "right" | null>(null);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-r from-[#9645ed] to-black/50">

      {/* 3D Perspective Container */}
      <div
        className="flex h-full w-full"
        style={{
          perspective: "1200px",
        }}
      >
        {/* Left Panel: Game Jam */}
        <div
          className={cn(
            "flex-1 bg-[url('/backgrounds/jambg.png')] bg-no-repeat bg-center bg-contain flex flex-col items-center justify-center px-8 py-12 relative",
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

          <div className="relative z-10 text-center max-w-sm">
            {/* Logo Area */}
            <div className="mb-10 h-32 sm:h-36 flex items-center justify-center">
              <Image 
                src="/logos/gamejam.png" 
                alt="Game Jam Logo" 
                width={250} 
                height={150}
                className="object-contain"
              />
            </div>

            {/* Title */}
            {/* 
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 bg-white  bg-clip-text text-transparent">
              Aydın Game Jam
            </h1>

            Tagline 
            <p className="text-lg text-zinc-100 mb-9 leading-relaxed">
              48 saat oyun geliştir, ekip kur, sunum yap
            </p>
              */}

            {/* Buttons */}
            <div className="flex flex-col gap-4 items-center">
              <div className="bg-white rounded-2xl px-10 py-4 font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 motion-reduce:hover:scale-100">
                <Link
                  href="/gamejam/basvur"
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold rounded-2xl text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 motion-reduce:hover:scale-100"
                > 
                  Başvur
                </Link>
              </div>
              <button
                onClick={onJamClick}
                className="group inline-flex items-center gap-3 text-white hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition-colors"
                aria-label="Game Jam tam görünümü"
              >
                <span className="text-6xl leading-none transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none">
                  ←
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Hackathon */}
        <div
          className={cn(
            "flex-1 flex flex-col bg-[url('/backgrounds/hackbg.png')] bg-no-repeat bg-center bg-contain items-center justify-center px-8 py-12 relative",
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

          <div className="relative z-10 text-center max-w-sm">
            {/* Logo Area */}
            <div className="mb-15 h-32 sm:h-36 flex items-center justify-center">
              <Image 
                src="/logos/hackathongif.gif" 
                alt="Hackathon Logo" 
                width={250} 
                height={150}
                className="object-contain"
              />
            </div>


            {/* 
              Title 
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-white">
              HackathOn Aydın
            </h1>
            
              Tagline 
            <p className="text-lg text-zinc-400 mb-9 leading-relaxed">
              Ürün geliştir, çözüm üret, sahnede sun
            </p>
            
            */}

            {/* Buttons */}
            <div className="flex flex-col gap-4 items-center">
              <div className="bg-white rounded-2xl px-10 py-4 font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 motion-reduce:hover:scale-100">
                <Link
                  href="/hackathon/basvur"
                  className="px-3 py-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold rounded-2xl text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 motion-reduce:hover:scale-100"
                >
                  Başvur
                </Link>
              </div>
              <button
                onClick={onHackClick}
                className="group inline-flex items-center gap-3 text-zinc-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors"
                aria-label="Hackathon tam görünümü"
              >
                <span className="text-6xl leading-none transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
