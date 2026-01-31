"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Application, ApplicationProfile, GameJamEventData } from "@/types/firestore";

export default function GameJamApplyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasApplication, setHasApplication] = useState(false);
  
  // Form state
  const [school, setSchool] = useState("");
  const [department, setDepartment] = useState("");
  const [city, setCity] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [engine, setEngine] = useState("");
  const [experience, setExperience] = useState("beginner");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/gamejam/basvur`);
    } else if (user) {
      checkExistingApplication();
    }
  }, [user, authLoading, router]);

  const checkExistingApplication = async () => {
    if (!user) return;
    
    const appRef = doc(db, "applications", user.uid);
    const appSnap = await getDoc(appRef);
    
    if (appSnap.exists()) {
      const data = appSnap.data() as Application;
      if (data.eventType === "gamejam") {
        setHasApplication(true);
      }
    }
  };

  const handleRoleToggle = (role: string) => {
    setRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      const profile: ApplicationProfile = {
        school,
        department,
        city,
      };

      const eventData: GameJamEventData = {
        roles,
        engine,
        experience,
      };

      const application: Application = {
        uid: user.uid,
        eventType: "gamejam",
        status: "submitted",
        profile,
        eventData,
        timestamps: {
          createdAt: new Date().toISOString(),
          submittedAt: new Date().toISOString(),
        },
      };

      await setDoc(doc(db, "applications", user.uid), application);
      router.push("/dashboard/status");
    } catch (error) {
      console.error("Application error:", error);
      alert("Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (hasApplication) {
    return (
      <main className="min-h-screen bg-white text-zinc-900 font-lexend flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-black mb-4">Başvurunuz Mevcut</h1>
          <p className="text-zinc-600 mb-6">Game Jam etkinliğine zaten başvurdunuz.</p>
          <Link
            href="/dashboard/status"
            className="inline-flex px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
          >
            Başvuru Durumunu Gör
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-lexend">
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          ← Ana sayfaya dön
        </Link>

        <header className="mt-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Aydın Game Jam Başvuru
          </h1>
          <p className="mt-3 text-zinc-600 leading-relaxed">
            48 saat boyunca ekibinle oyun geliştir. Başvuru formunu aşağıdan doldur.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
            <h2 className="text-lg font-semibold mb-4">Kişisel Bilgiler</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Okul</label>
                <input
                  type="text"
                  required
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Üniversite/Lise adı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Bölüm</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Bilgisayar Mühendisliği, vs."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Şehir</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Aydın"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
            <h2 className="text-lg font-semibold mb-4">Game Jam Bilgileri</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Rollerin (Birden fazla seçebilirsin)
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Developer", "Designer", "Artist", "Sound Designer"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleToggle(role)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        roles.includes(role)
                          ? "bg-purple-600 text-white"
                          : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Oyun Motoru</label>
                <input
                  type="text"
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Unity, Unreal, Godot, vs."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Deneyim Seviyesi</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="beginner">Başlangıç</option>
                  <option value="intermediate">Orta</option>
                  <option value="advanced">İleri</option>
                </select>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading || roles.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
          </button>
        </form>
      </div>
    </main>
  );
}
