"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Application } from "@/types/firestore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userDoc, signOut } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadApplication();
    }
  }, [user]);

  const loadApplication = async () => {
    if (!user) return;
    
    try {
      const appRef = doc(db, "applications", user.uid);
      const appSnap = await getDoc(appRef);
      
      if (appSnap.exists()) {
        setApplication(appSnap.data() as Application);
      }
    } catch (error) {
      console.error("Error loading application:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const navItems = [
    { href: "/dashboard/status", label: "Durum", icon: "📊" },
    { href: "/dashboard/documents", label: "Belgelerim", icon: "📄" },
  ];

  // Add conditional menu items based on eventType
  if (application?.eventType === "gamejam") {
    navItems.push({
      href: "/dashboard/game-submission",
      label: "Oyun Yükle",
      icon: "🎮",
    });
  } else if (application?.eventType === "hackathon") {
    navItems.push({
      href: "/dashboard/trailer",
      label: "Trailer Link",
      icon: "🎬",
    });
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <Link href="/" className="text-xl font-black text-gray-900">
              Aydın Gençlik <span className="text-purple-600">Zirvesi</span>
            </Link>
          </div>

          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">{userDoc?.name}</p>
            <p className="text-xs text-gray-500">{userDoc?.email}</p>
            {application && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  application.eventType === "gamejam"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
                }`}>
                  {application.eventType === "gamejam" ? "🎮 Game Jam" : "💻 Hackathon"}
                </span>
              </div>
            )}
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-purple-100 text-purple-900 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
            >
              <span>🚪</span>
              <span>Çıkış Yap</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Yükleniyor...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
