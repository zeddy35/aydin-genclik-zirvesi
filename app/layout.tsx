import type { Metadata } from "next";
import { Lexend, Share_Tech_Mono, Press_Start_2P, Oswald } from "next/font/google";
import { AuthProvider as AGZAuthProvider } from "@/contexts/AuthContext";
import { EasterEggProvider } from "@/components/EasterEggProvider";
import { EasterEggContext } from "@/components/EasterEggContext";
import "./globals.css";
import "./arcade-theme.css";

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});
const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-share-tech-mono",
});
const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-press-start",
});
const oswald = Oswald({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: "Aydın Gençlik Zirvesi 2026",
  description:
    "Aydın Gençlik Zirvesi - Game Jam ve HackathOn etkinliğine katıl",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Aydın Gençlik Zirvesi 2026",
    description:
      "Aydın Gençlik Zirvesi - Game Jam ve HackathOn etkinliğine katıl",
    url: "https://aydin-genclik-zirvesi.vercel.app",
    siteName: "Aydın Gençlik Zirvesi",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning className={`${lexend.variable} ${shareTechMono.variable} ${pressStart2P.variable} ${oswald.variable}`}>
      <head>
        {/* Preload LCP background images so browser discovers them before React renders */}
        <link rel="preload" href="/backgrounds/jambg.png" as="image" />
        <link rel="preload" href="/backgrounds/hackbg.png" as="image" />
      </head>
      <body className="antialiased">
        <EasterEggContext>
          <EasterEggProvider>
            <AGZAuthProvider>
              {children}
            </AGZAuthProvider>
          </EasterEggProvider>
        </EasterEggContext>
      </body>
    </html>
  );
}
