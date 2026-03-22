"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from 'react';
import Loading from "./loading";

const HeroExperience = dynamic(
  () => import("@/components/HeroExperience").then(m => ({ default: m.HeroExperience })),
  { ssr: false }
);

export default function Home() {
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setReady(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !ready) return <Loading />;

  return <HeroExperience /> ;
}