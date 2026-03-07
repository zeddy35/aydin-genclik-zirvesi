"use client";

import { HeroExperience } from "@/components/HeroExperience";
import { useState, useEffect } from 'react';
import Loading from "./loading";

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