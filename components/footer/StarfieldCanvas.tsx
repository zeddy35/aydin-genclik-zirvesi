"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  depth: number;
}

export function StarfieldCanvas({ width = 1200, height = 800 }: { width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Generate stars
    const generateStars = () => {
      const stars: Star[] = [];
      for (let i = 0; i < 150; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5,
          opacity: Math.random() * 0.7 + 0.3,
          depth: Math.random() * 0.5 + 0.5,
        });
      }
      return stars;
    };

    starsRef.current = generateStars();

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = "rgba(5, 5, 25, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update stars
      starsRef.current.forEach((star) => {
        // Slight parallax effect
        star.opacity = (Math.sin(Date.now() / 3000 + star.x) + 1) / 2 * 0.5 + 0.3;

        ctx.fillStyle = `rgba(255, 255, 200, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 1.85);
        ctx.fill();

        // Slow drift
        star.x += Math.sin(Date.now() / 5000) * 0.2;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
