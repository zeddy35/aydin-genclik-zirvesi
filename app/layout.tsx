import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthProvider as AGZAuthProvider } from "@/contexts/AuthContext";
import { EasterEggProvider } from "@/components/EasterEggProvider";
import { EasterEggContext } from "@/components/EasterEggContext";
import "./globals.css";
import "./arcade-theme.css";

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
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Lexend:wght@100..900&family=Share+Tech+Mono&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <EasterEggContext>
          <EasterEggProvider>
            <AGZAuthProvider>
              <AuthProvider>{children}</AuthProvider>
            </AGZAuthProvider>
          </EasterEggProvider>
        </EasterEggContext>
      </body>
    </html>
  );
}
