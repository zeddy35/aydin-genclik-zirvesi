import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { EasterEggProvider } from "@/components/EasterEggProvider";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "Aydın Gençlik Zirvesi",
  description: "HackathOn Aydın ve Aydın Game Jam etkinliklerine ev sahipliği yapan Aydın'ın en büyük gençlik etkinliği.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased flex flex-col min-h-screen">
        <EasterEggProvider>
          <AuthProvider>
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </EasterEggProvider>
      </body>
    </html>
  );
}
