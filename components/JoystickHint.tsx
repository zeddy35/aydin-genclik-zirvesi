import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/cn";

type JoystickVariant = "jam" | "hack" | "auto";

interface JoystickProps {
  variant?: JoystickVariant;
  className?: string;
  onMove?: (x: number, y: number) => void; // x and y are -1 to 1
  onRelease?: () => void;
  deadZone?: number; // 0 to 1, default 0.1
}

export function Joystick({ 
  variant = "auto", 
  className,
  onMove,
  onRelease,
  deadZone = 0.1
}: JoystickProps) {
  const resolved = variant === "auto" ? "jam" : variant;
  const isDark = resolved === "hack";
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const maxDistance = 20; // pixels from center

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    updatePosition(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    updatePosition(clientX, clientY);
  };

  const handleEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onRelease?.();
  };

  const updatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;

    // Limit to max distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > maxDistance) {
      const angle = Math.atan2(deltaY, deltaX);
      deltaX = Math.cos(angle) * maxDistance;
      deltaY = Math.sin(angle) * maxDistance;
    }

    setPosition({ x: deltaX, y: deltaY });

    // Normalize to -1 to 1 and apply deadzone
    let normalizedX = deltaX / maxDistance;
    let normalizedY = deltaY / maxDistance;

    const normalizedDistance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
    if (normalizedDistance < deadZone) {
      normalizedX = 0;
      normalizedY = 0;
    }

    onMove?.(normalizedX, normalizedY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleMouseUp = () => handleEnd();
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div
      className={cn(
        "fixed z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6",
        "bottom-[max(env(safe-area-inset-bottom),12px)] md:bottom-6",
        className
      )}
    >
      <div
        ref={containerRef}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        className={cn(
          "w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-2xl",
          "backdrop-blur-md border shadow-[0_6px_16px_rgba(0,0,0,0.18)]",
          "flex flex-col items-center justify-center gap-1 cursor-pointer select-none",
          "active:scale-95 transition-transform",
          isDark
            ? "bg-black/40 border-white/20 text-white/70"
            : "bg-white/60 border-purple-300/50 text-zinc-900/70"
        )}
      >
        <div className="relative grid grid-cols-3 grid-rows-3 w-[44px] h-[44px]">
          <span className={cn(
            "col-start-2 row-start-1 text-[10px] transition-opacity",
            position.y < -5 ? "opacity-80" : "opacity-30"
          )}>↑</span>
          <span className={cn(
            "col-start-1 row-start-2 text-[12px] transition-opacity",
            position.x < -5 ? "opacity-80" : "opacity-40"
          )}>←</span>
          <span
            className={cn(
              "col-start-2 row-start-2 w-3 h-3 rounded-md border mx-auto my-auto transition-all",
              isDark ? "border-white/30 bg-white/10" : "border-purple-400/50 bg-purple-200/30",
              isDragging && "scale-110"
            )}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
            }}
          />
          <span className={cn(
            "col-start-3 row-start-2 text-[12px] transition-opacity",
            position.x > 5 ? "opacity-80" : "opacity-40"
          )}>→</span>
          <span className={cn(
            "col-start-2 row-start-3 text-[12px] transition-opacity",
            position.y > 5 ? "opacity-80" : "opacity-40"
          )}>↓</span>
        </div>
        <div className={cn(
          "text-[9px] tracking-[0.2em]", 
          isDark ? "text-white/60" : "text-zinc-800/60"
        )}>
          {isDragging ? "ACTIVE" : "DRAG · TOUCH"}
        </div>
      </div>
    </div>
  );
}