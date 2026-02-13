"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useCheckUserExists } from "@/lib/hooks/useCheckUserExists";
import { DuplicateCheckModal } from "@/components/DuplicateCheckModal";
import { debounce } from "@/lib/debounce";

export default function GameJamApplyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { check } = useCheckUserExists();
  const debouncedCheckRef = useRef<((emailVal: string, phoneVal: string) => void) | null>(null);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [duplicateModal, setDuplicateModal] = useState({
    isOpen: false,
    emailExists: false,
    phoneExists: false,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/auth/login?next=/apply/gamejam`);
    }
  }, [user, loading, router]);

  // Initialize debounced check
  useEffect(() => {
    debouncedCheckRef.current = debounce(async (emailVal: string, phoneVal: string) => {
      const result = await check(emailVal, phoneVal);
      if (result.emailExists || result.phoneExists) {
        setDuplicateModal({
          isOpen: true,
          emailExists: result.emailExists,
          phoneExists: result.phoneExists,
        });
      } else {
        setDuplicateModal((prev) => ({
          ...prev,
          isOpen: false,
        }));
      }
    }, 800);
  }, [check]);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    debouncedCheckRef.current?.(val, phone);
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    debouncedCheckRef.current?.(email, val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-cyan-500 rounded-full animate-spin mx-auto" />
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Aydin Game Jam'e Başvur
          </h1>
          <p className="text-gray-400">
            48 saat boyunca oyun geliştirme yarışmasına katılmak için başvur.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-8">
          {/* Profile Section */}
          <div className="space-y-6 p-8 rounded-lg bg-white/5 border border-white/10">
            <h2 className="text-xl font-bold text-purple-400">Kişisel Bilgiler</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="Adınız Soyadınız"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-Posta *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Şehir *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="Aydın"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Okul/Üniversite *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="Okul Adı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bölüm *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="Bilgisayar Mühendisliği"
                />
              </div>
            </div>
          </div>

          {/* Game Jam Specific Section */}
          <div className="space-y-6 p-8 rounded-lg bg-white/5 border border-white/10">
            <h2 className="text-xl font-bold text-purple-400">Game Jam Detayları</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Takım Durumunuz *
              </label>
              <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500">
                <option value="">Seçiniz...</option>
                <option value="solo">Bireysel (Takımı bulamadım)</option>
                <option value="with-team">Takımım Var</option>
                <option value="looking">Takım Arıyorum</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Roller (Birden çok seçebilirsiniz)
              </label>
              <div className="space-y-2">
                {["Programcı", "Tasarımcı", "Müzisyen", "Yönetici"].map((role) => (
                  <label key={role} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      value={role}
                      className="w-4 h-4 accent-purple-500 rounded"
                    />
                    <span className="text-gray-300">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deneyim Seviyesi *
              </label>
              <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500">
                <option value="">Seçiniz...</option>
                <option value="beginner">Başlangıç</option>
                <option value="intermediate">Orta</option>
                <option value="advanced">İleri</option>
                <option value="expert">Uzman</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Engine Tercihi *
              </label>
              <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500">
                <option value="">Seçiniz...</option>
                <option value="unity">Unity</option>
                <option value="unreal">Unreal Engine</option>
                <option value="godot">Godot</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Portföy Linki (İsteğe bağlı)
              </label>
              <input
                type="url"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          {/* KVKK & Consents */}
          <div className="space-y-4 p-8 rounded-lg bg-white/5 border border-white/10">
            <h2 className="text-xl font-bold text-purple-400">Onaylar</h2>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required className="w-4 h-4 accent-purple-500 mt-1 rounded" />
              <span className="text-sm text-gray-300">
                <strong>KVKK Aydınlatma Metni</strong>'ni okudum ve kabul ettim. (
                <Link href="/kvkk" className="text-purple-400 hover:text-purple-300">
                  Metni Oku
                </Link>
                )
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required className="w-4 h-4 accent-purple-500 mt-1 rounded" />
              <span className="text-sm text-gray-300">
                Fotoğraf ve video çekiminde yer almamı onaylıyorum.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Başvuru Yap
            </button>
            <Link
              href="/"
              className="px-8 py-3 border border-white/20 text-white font-bold rounded-lg hover:border-white hover:bg-white/5 transition-all"
            >
              İptal
            </Link>
          </div>
        </form>
      </div>

      {/* Duplicate Check Modal */}
      <DuplicateCheckModal
        isOpen={duplicateModal.isOpen}
        onClose={() =>
          setDuplicateModal({ ...duplicateModal, isOpen: false })
        }
        emailExists={duplicateModal.emailExists}
        phoneExists={duplicateModal.phoneExists}
        email={email}
        phone={phone}
      />
    </main>
  );
}
