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
