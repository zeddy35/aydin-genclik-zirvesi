"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { PanelSplit } from "./PanelSplit";
import { JamFullView } from "./views/JamFullView";
import { HackFullView } from "./views/HackFullView";
import { SummitInfo } from "./sections/SummitInfo";
import { Footer } from "./footer/Footer";
import { EventCountdown } from "./sections/EventCountdown";

/* ═══════════════════════════════════════════════════════════
   Doubly Linked List – Panel Navigation System
   ═══════════════════════════════════════════════════════════
   Logical indexes (page identifiers):
     0 → MidPage      (Split Hero)   — entry point
     1 → GameJamPage
     2 → HackathonPage

   Physical DOM order (flex children):
     [0] GameJam  |  [1] MidPage  |  [2] Hackathon

   Linked-list wiring:
     MidPage:       left(tail) → GameJam       right(head) → Hackathon
     GameJamPage:   left(tail) → null           right(head) → MidPage
     HackathonPage: left(tail) → MidPage        right(head) → null

   Navigation uses CSS translateX — no scrollLeft hacks.
   Default transform: translateX(-100vw) → MidPage visible on mount.
   ═══════════════════════════════════════════════════════════ */

interface PanelNode {
  id: "mid" | "gamejam" | "hackathon";
  physicalIndex: number;     // position in DOM flex row
  left: PanelNode | null;    // tail – left traversal
  right: PanelNode | null;   // head – right traversal
}

// ── Create nodes ──
const midPage: PanelNode        = { id: "mid",        physicalIndex: 1, left: null, right: null };
const gameJamPage: PanelNode    = { id: "gamejam",    physicalIndex: 0, left: null, right: null };
const hackathonPage: PanelNode  = { id: "hackathon",  physicalIndex: 2, left: null, right: null };

// ── Wire doubly linked list ──
midPage.left        = gameJamPage;     // Mid  ←  GameJam
midPage.right       = hackathonPage;   // Mid  →  Hackathon
gameJamPage.left    = null;            // GameJam  ←  null (boundary)
gameJamPage.right   = midPage;         // GameJam  →  Mid
hackathonPage.left  = midPage;         // Hackathon ← Mid
hackathonPage.right = null;            // Hackathon → null (boundary)

export function HeroExperience() {
  const panelRefs = useRef<Array<HTMLElement | null>>([]);
  const currentNodeRef = useRef<PanelNode>(midPage);
  const isAnimating = useRef(false);

  // CSS transform offset – starts at MidPage (physicalIndex 1 → -100vw)
  const [offset, setOffset] = useState(`-${midPage.physicalIndex * 100}vw`);

  // ── Navigate to a linked-list node ──
  const navigateTo = useCallback((node: PanelNode) => {
    if (isAnimating.current || node.id === currentNodeRef.current.id) return;
    isAnimating.current = true;
    currentNodeRef.current = node;
    setOffset(`-${node.physicalIndex * 100}vw`);

    // Reset target panel scroll & unlock after CSS transition ends
    setTimeout(() => {
      panelRefs.current[node.physicalIndex]?.scrollTo({
        top: 0,
        behavior: "instant" as ScrollBehavior,
      });
      isAnimating.current = false;
    }, 500);
  }, []);

  // ── Linked-list traversals ──
  const moveLeft = useCallback(() => {
    const next = currentNodeRef.current.left;
    if (next) navigateTo(next);
  }, [navigateTo]);

  const moveRight = useCallback(() => {
    const next = currentNodeRef.current.right;
    if (next) navigateTo(next);
  }, [navigateTo]);

  // ── Direct-jump helpers (for buttons) ──
  const goToMid  = useCallback(() => navigateTo(midPage), [navigateTo]);
  const goToJam  = useCallback(() => navigateTo(gameJamPage), [navigateTo]);
  const goToHack = useCallback(() => navigateTo(hackathonPage), [navigateTo]);

  // ── Keyboard: Escape → Mid, Arrows ← → ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     goToMid();
      if (e.key === "ArrowLeft")  moveLeft();
      if (e.key === "ArrowRight") moveRight();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goToMid, moveLeft, moveRight]);

  // ── Horizontal wheel → linked-list traversal ──
  useEffect(() => {
    let acc = 0;
    const THRESHOLD = 80;

    const onWheel = (e: WheelEvent) => {
      // Let vertical scroll pass through to panels
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;
      e.preventDefault();
      acc += e.deltaX;
      if (acc > THRESHOLD)       { moveRight(); acc = 0; }
      else if (acc < -THRESHOLD) { moveLeft();  acc = 0; }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [moveLeft, moveRight]);

  // ── Touch swipe → linked-list traversal ──
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
      if (dx < 0) moveRight(); // swipe left → go right in list
      else        moveLeft();  // swipe right → go left in list
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [moveLeft, moveRight]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>

      {/* Sliding track – CSS transform drives navigation */}
      <div
        className="flex h-screen w-[300vw] transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(${offset})` }}
      >
        {/* Physical 0 — Game Jam Page */}
        <section
          ref={(el) => { panelRefs.current[0] = el; }}
          className="w-screen h-screen shrink-0 overflow-y-auto overflow-x-hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <JamFullView onBack={goToMid} />
        </section>

        {/* Physical 1 — Mid Page (Split Hero) ◀ STARTS HERE */}
        <section
          ref={(el) => { panelRefs.current[1] = el; }}
          className="w-screen h-screen shrink-0 overflow-y-auto overflow-x-hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="relative min-h-screen">
            <PanelSplit onJamClick={goToJam} onHackClick={goToHack} />
          </div>
          <EventCountdown />
          <SummitInfo />
          <Footer />
        </section>

        {/* Physical 2 — Hackathon Page */}
        <section
          ref={(el) => { panelRefs.current[2] = el; }}
          className="w-screen h-screen shrink-0 overflow-y-auto overflow-x-hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <HackFullView onBack={goToMid} />
        </section>
      </div>
    </div>
  );
}