"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Application, EventType } from "@/types/firestore";

export default function HackathonApplyPage() {
  const router = useRouter();
  const { user, userDoc, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    school: "",
    department: "",
    city: "",
    roles: [] as string[],
    tracks: "",
    stackInput: "",
    ideaSummary: "",
    experience: "intermediate",
  });

  if (authLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </main>
    );
  }

  if (!user || !userDoc) {
    return (
      <main className="min-h-screen bg-white text-zinc-900 font-lexend">
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-bold text-red-900">Giriş Gerekli</h2>
            <p className="mt-2 text-red-800">
              Başvuru yapmak için giriş yapmanız gerekmektedir.
            </p>
            <Link
              href="/auth/login"
              className="mt-4 inline-block px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const roleOptions = ["Backend", "Frontend", "Design", "PM"];

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Aynı event'e iki başvuru kontrolü
      const appRef = doc(db, "applications", user.uid);
      const existingApp = await getDoc(appRef);

      if (existingApp.exists()) {
        const existing = existingApp.data() as Application;
        if (existing.eventType === "hackathon") {
          setError("Zaten bu etkinliğe başvuru yapmışsınız!");
          setLoading(false);
          return;
        }
      }

      // Yeni başvuru oluştur
      const applicationData: Application = {
        uid: user.uid,
        eventType: "hackathon",
        status: "submitted",
        profile: {
          school: formData.school,
          department: formData.department,
          city: formData.city,
        },
        eventData: {
          roles: formData.roles,
          tracks: [formData.tracks],
          stack: formData.stackInput.split(",").map(s => s.trim()).filter(s => s),
          experience: formData.experience,
          ideaSummary: formData.ideaSummary,
        },
        adminDocs: [],
        timestamps: {
          createdAt: new Date().toISOString(),
          submittedAt: new Date().toISOString(),
        },
      };

      await setDoc(appRef, applicationData);

      // Dashboard'a yönlendir
      router.push("/dashboard/status");
    } catch (err) {
      console.error("Başvuru hatası:", err);
      setError("Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 font-lexend">
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Ana sayfaya dön
        </Link>

        <header className="mt-6 mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            HackathOn Aydın <span className="text-gray-900">Başvuru</span>
          </h1>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Hoş geldin, <strong>{userDoc.name}</strong>! Ürün geliştir, çözüm üret, sun.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profil Bilgileri */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold mb-4">Profil Bilgileri</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Okul *
                </label>
                <input
                  type="text"
                  required
                  value={formData.school}
                  onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                  placeholder="Üniversite / Lise adı"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Bölüm *
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Ör: Bilgisayar Mühendisliği"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Şehir *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Ör: Aydın"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Rol Seçimi */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold mb-4">Roller (Çok seçim) *</h2>
            
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleToggle(role)}
                  className={`px-4 py-3 rounded-lg font-semibold border-2 transition-all ${
                    formData.roles.includes(role)
                      ? "border-purple-600 bg-purple-50 text-purple-900"
                      : "border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {formData.roles.includes(role) ? "✓ " : ""}{role}
                </button>
              ))}
            </div>
            {formData.roles.length === 0 && (
              <p className="mt-2 text-sm text-red-600">En az bir rol seçmelisiniz</p>
            )}
          </section>

          {/* Teknik Bilgiler */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold mb-4">Teknik Bilgiler</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Takım Sınırlandırması *
                </label>
                <select
                  required
                  value={formData.tracks}
                  onChange={(e) => setFormData(prev => ({ ...prev, tracks: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Seçiniz...</option>
                  <option value="fintech">FinTech</option>
                  <option value="healthtech">HealthTech</option>
                  <option value="edutech">EduTech</option>
                  <option value="agritech">AgriTech</option>
                  <option value="open">Open Track</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Kullanacağınız Teknolojiler (virgülle ayırın) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.stackInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, stackInput: e.target.value }))}
                  placeholder="Ör: React, Node.js, MongoDB"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Deneyim Seviyesi *
                </label>
                <select
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="beginner">Başlangıç</option>
                  <option value="intermediate">Orta Seviye</option>
                  <option value="advanced">İleri</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  İdea Özeti (150 karaktere kadar) *
                </label>
                <textarea
                  required
                  maxLength={150}
                  value={formData.ideaSummary}
                  onChange={(e) => setFormData(prev => ({ ...prev, ideaSummary: e.target.value }))}
                  placeholder="Hackathon'da geliştireceğiniz ürünün kısa özeti..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.ideaSummary.length}/150
                </p>
              </div>
            </div>
          </section>

          {/* Koşullar */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-bold mb-4">Başvuru Koşulları</h3>
            <ul className="space-y-2 text-gray-600 list-disc list-inside">
              <li>Tüm yaş grupları başvurabilir</li>
              <li>Bireysel veya takım halinde katılabilirsiniz</li>
              <li>Önceden deneyim sahibi olmanız zorunlu değildir</li>
              <li>Katılım tamamen ücretsizdir</li>
              <li>Yemeği ve konaklama sağlanmaktadır</li>
              <li>Mentor ve uzmanlardan destek alacaksınız</li>
            </ul>
          </section>

          {/* Submit Butonu */}
          <button
            type="submit"
            disabled={loading || formData.roles.length === 0}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
          </button>
        </form>
      </div>
    </main>
  );
}
