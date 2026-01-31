"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import Image from "next/image";

const HorizontalScroll = forwardRef<HTMLDivElement>((_props, ref) => {
  return (
    <div
      ref={ref}
      className="flex w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth"
    >
      {/* Panel 0: Game Jam */}
      <div className="flex-shrink-0 w-full h-full flex items-center justify-center snap-center bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent)]" />
        </div>
        <div className="text-center z-10 flex flex-col items-center gap-8">
          <div className="relative w-48 h-48">
            <Image
              src="/logos/gamejam.png"
              alt="Game Jam Aydın"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-5xl font-black text-white mb-2">Aydın Game Jam</h1>
            <p className="text-lg text-purple-100">48 saat, sınırsız yaratıcılık</p>
          </div>
          <Link
            href="/gamejam/basvur"
            className="px-8 py-3 bg-white text-purple-600 font-bold rounded-full hover:bg-purple-50 transition-colors shadow-lg"
          >
            Başvur
          </Link>
          <p className="text-purple-200 text-sm">← Scroll →</p>
        </div>
      </div>

      {/* Panel 1: Hackathon (Split Screen) */}
      <div className="flex-shrink-0 w-full h-full flex items-center justify-center snap-center bg-black relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,100,0.2),transparent)]" />
        </div>
        <div className="text-center z-10 flex flex-col items-center gap-8">
          <div className="relative w-48 h-48">
            <Image
              src="/logos/hackathongif.gif"
              alt="HackathOn Aydın"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-5xl font-black text-white mb-2">HackathON Aydın</h1>
            <p className="text-lg text-gray-400">İnovation için kod yaz</p>
          </div>
          <Link
            href="/hackathon/basvur"
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            Başvur
          </Link>
          <p className="text-gray-500 text-sm">← Scroll →</p>
        </div>
      </div>
    </div>
  );
});

HorizontalScroll.displayName = "HorizontalScroll";

export default HorizontalScroll;
