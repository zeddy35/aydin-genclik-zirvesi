"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface ToastProps {
  message: string;
  duration?: number;
  type?: "success" | "info";
}

export function EasterToast({ message, duration = 4000, type = "success" }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "px-6 py-4 rounded-lg shadow-lg animate-slide-up",
        "font-semibold text-sm",
        type === "success" && "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
        type === "info" && "bg-gray-900 border border-gray-700 text-gray-100"
      )}
    >
      {type === "success" && "🏆 "}
      {message}
    </div>
  );
}
