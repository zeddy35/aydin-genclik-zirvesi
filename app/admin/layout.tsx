"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userDoc, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-black text-gray-900">
                Aydın Gençlik <span className="text-purple-600">Zirvesi</span>
              </Link>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                ADMIN
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{userDoc?.name}</p>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium text-sm"
              >
                Çıkış
              </button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <Link
              href="/admin/participants"
              className="inline-flex items-center gap-2 px-4 py-3 border-b-2 border-purple-600 text-purple-600 font-semibold"
            >
              <span>👥</span>
              <span>Katılımcılar</span>
            </Link>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
