"use client";

import React, { useEffect, useRef } from "react";
import HorizontalScroll from "./HorizontalScroll";
import Navbar from "./Navbar";

export function HeroExperience() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to panel 1 (split screen) on mount
    if (scrollContainerRef.current) {
      const scrollWidth = scrollContainerRef.current.scrollWidth;
      const viewportWidth = scrollContainerRef.current.clientWidth;
      const panelWidth = scrollWidth / 2; // Assuming 2 panels
      scrollContainerRef.current.scrollLeft = panelWidth;
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <Navbar />
      <HorizontalScroll ref={scrollContainerRef} />
    </div>
  );
}
