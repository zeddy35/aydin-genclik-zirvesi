"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { StarfieldCanvas } from "./StarfieldCanvas.tsx";

interface CreditItem {
  section: string;
  items: string[];
}

const creditsData: CreditItem[] = [
  {
    section: "Organizers",
    items: ["Z. Erden Dereli", "Mirza Eker", "İsmail and Eyüp", "Mr Ceyhun"],
  },
  {
    section: "Communities",
    items: ["GDG on Campus ADÜ", "OTT", "HSD"],
  },
  {
    section: "Special Thanks",
    items: ["All Participants", "Mentors", "Volunteers", "Dino"],
  },
];

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

interface CreditsCrawlOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "gamejam" | "hackathon";
}

export function CreditsCrawlOverlay({ isOpen, onClose, theme = "gamejam" }: CreditsCrawlOverlayProps) {
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(!prefersReducedMotion);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const themeColor = theme === "gamejam" ? "from-purple-600 to-blue-600" : "from-gray-800 to-black";

  return (
    <div
      className="fixed inset-0 z-50 bg-black overflow-hidden"
      onClick={onClose}
    >
      {/* Starfield Background */}
      <div className="absolute inset-0">
        <StarfieldCanvas width={1400} height={900} />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 text-gray-300 hover:text-white text-3xl transition-colors"
        aria-label="Close credits"
      >
        ×
      </button>

      {/* Credits Content */}
      <div className="relative h-full w-full flex items-center justify-center p-8">
        {prefersReducedMotion ? (
          // Reduced motion: static list
          <div className="max-w-2xl space-y-12 text-center">
            <div>
              <h1 className="text-4xl font-bold text-yellow-100 mb-4">
                Aydın Gençlik Zirvesi
              </h1>
              <p className="text-lg text-yellow-50/70">presents</p>
            </div>

            {creditsData.map((credit) => (
              <div key={credit.section}>
                <h2 className="text-2xl font-bold text-yellow-100 mb-3">
                  {credit.section}
                </h2>
                <div className="space-y-2">
                  {credit.items.map((item) => (
                    <p key={item} className="text-yellow-50/80">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-12 text-sm text-yellow-50/50">
              ESC to close
            </div>
          </div>
        ) : (
          // Full animation: Star Wars crawl
          <div
            className="perspective absolute inset-0 flex items-center justify-center"
            style={{
              perspective: "1000px",
            } as React.CSSProperties}
          >
            <div
              className={cn(
                "text-center font-bold tracking-wider animate-crawl",
                theme === "gamejam" && "text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-300"
              )}
              style={
                {
                  "--crawl-duration": "60s",
                  transform: "rotateX(75deg)",
                  transformStyle: "preserve-3d",
                  animation: "crawl 60s linear forwards",
                } as React.CSSProperties & { "--crawl-duration": string }
              }
            >
              <div className="mb-20">
                <h1 className="text-6xl font-black tracking-widest text-yellow-100 mb-8">
                  AYDÍN GENÇLIK ZİRVESİ
                </h1>
                <p className="text-2xl text-yellow-50/80">presents</p>
              </div>

              {creditsData.map((credit) => (
                <div key={credit.section} className="mb-16">
                  <h2 className="text-3xl font-bold text-yellow-100 mb-4">
                    {credit.section}
                  </h2>
                  {credit.items.map((item) => (
                    <p key={item} className="text-xl text-yellow-50/80 mb-2">
                      {item}
                    </p>
                  ))}
                </div>
              ))}

              <div className="mt-20">
                <p className="text-lg text-yellow-50/60">Thank you</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Crawl Animation Keyframes */}
      <style>{`
        @keyframes crawl {
          from {
            opacity: 0;
            transform: translateZ(0) rotateX(75deg) translateY(100px);
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          to {
            opacity: 0;
            transform: translateZ(0) rotateX(75deg) translateY(-1500px);
          }
        }

        .animate-crawl {
          animation: crawl 60s linear forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-crawl {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
