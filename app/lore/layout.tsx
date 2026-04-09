import type { Metadata } from "next";
import { Oswald, Share_Tech_Mono, Lexend } from "next/font/google";

const oswald = Oswald({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oswald",
});
const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-share-tech-mono",
});
const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Vaka Dosyası · AGZ HackathOn 2026",
  description: "AGZ HackathOn 2026 — Gizli vaka dosyaları",
};

export default function LoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${oswald.variable} ${shareTechMono.variable} ${lexend.variable}`}>
      <body style={{ margin: 0, background: "#070709" }}>
        {children}
      </body>
    </html>
  );
}
