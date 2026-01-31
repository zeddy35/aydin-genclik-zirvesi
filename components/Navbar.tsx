"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "./auth/AuthProvider";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black/50 backdrop-blur">
      {/* Logo - Center */}
      <div className="flex-1 text-center">
        <Link href="/" className="text-2xl font-bold text-white hover:text-purple-400 transition-colors">
          🌟 Aydın Gençlik Zirvesi
        </Link>
      </div>

      {/* Auth Links - Right */}
      <div className="flex-1 flex justify-end gap-4">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-white hover:text-purple-400 transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="px-4 py-2 text-white hover:text-purple-400 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
