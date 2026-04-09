import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vaka Dosyası · AGZ HackathOn 2026",
  description: "AGZ HackathOn 2026 — Gizli vaka dosyaları",
};

export default function LoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
