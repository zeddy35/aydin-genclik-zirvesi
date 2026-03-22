"use client";

import dynamic from "next/dynamic";

const HeroExperience = dynamic(
  () => import("@/components/HeroExperience").then(m => ({ default: m.HeroExperience })),
  { ssr: false }
);

export default function Home() {
  return <HeroExperience />;
}