"use client";

import React, { useRef, useEffect } from "react";
import { PanelSplit } from "./PanelSplit";
import { JamFullView } from "./views/JamFullView";
import { HackFullView } from "./views/HackFullView";
import { SummitInfo } from "./sections/SummitInfo";
import { Footer } from "./footer/Footer";
import { EventCountdown } from "./sections/EventCountdown";

export function HeroExperience() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLElement | null>>([]);

  // Scroll to specific panel (0: Jam, 1: Split, 2: Hack)
  const scrollToPanel = (index: 0 | 1 | 2) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const targetPosition = index * window.innerWidth;
    scroller.scrollTo({
      left: targetPosition,
      behavior: "smooth",
    });

    // Reset panel scroll to top after transition
    window.setTimeout(() => {
      panelRefs.current[index]?.scrollTo({ top: 0, behavior: "instant" as any });
    }, 350);
  };

  // Handle Escape key to return to Split (panel 1)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        scrollToPanel(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={scrollerRef}
      className="h-screen w-screen overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none]"
    >
      {/* Hide scrollbar for Chrome, Safari */}
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="flex h-screen w-[300vw]">
        {/* Panel 0: Game Jam Full Page */}
        <section
          ref={(el) => {
            panelRefs.current[0] = el;
          }}
          className="w-screen h-screen shrink-0 snap-center overflow-y-auto overflow-x-hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <JamFullView onBack={() => scrollToPanel(1)} />
        </section>

        {/* Panel 1: Split Screen (Center) + Summit Info */}
        <section
          ref={(el) => {
            panelRefs.current[1] = el;
          }}
          className="w-screen h-screen shrink-0 snap-center overflow-y-auto overflow-x-hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Hero: Split Screen */}
          <div className="relative min-h-screen">
            <PanelSplit
              onJamClick={() => scrollToPanel(0)}
              onHackClick={() => scrollToPanel(2)}
            />
          </div>

          <EventCountdown />
          {/* Summit Info Section */}
          <SummitInfo />

          {/* Footer */}
          <Footer />
        </section>

        {/* Panel 2: Hackathon Full Page */}
        <section
          ref={(el) => {
            panelRefs.current[2] = el;
          }}
          className="w-screen h-screen shrink-0 snap-center overflow-y-auto overflow-x-hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <HackFullView onBack={() => scrollToPanel(1)} />
        </section>
      </div>
    </div>
  );
}
