import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { EasterEggProvider } from "@/components/EasterEggProvider";
import "./globals.css";

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
        <EasterEggProvider>
          <AuthProvider>{children}</AuthProvider>
        </EasterEggProvider>
      </body>
    </html>
  );
}
