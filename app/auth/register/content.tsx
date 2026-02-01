"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { KVKKModal } from "@/components/KVKKModal";
import { DuplicateCheckModal } from "@/components/DuplicateCheckModal";
import { useCheckUserExists } from "@/lib/hooks/useCheckUserExists";
import { debounce } from "@/lib/debounce";

export default function RegisterPageContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [kvkkModalOpen, setKvkkModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  
  const { check } = useCheckUserExists();
  const debouncedCheckRef = useRef<((emailVal: string, phoneVal: string) => void) | null>(null);
  const [duplicateModal, setDuplicateModal] = useState({
    isOpen: false,
    emailExists: false,
    phoneExists: false,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Don't allow submit if duplicates exist
    if (duplicateModal.emailExists || duplicateModal.phoneExists) {
      setError("Bu email veya telefon numarası zaten kullanılıyor.");
      return;
    }

    if (!kvkkAccepted) {
      setError("KVKK onayı zorunludur.");

      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create Firestore user document
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        phone: phone || null,
        role: "user",
        kvkkAccepted: true,
        kvkkAcceptedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const destination = nextParam || "/dashboard/status";
      router.push(destination);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Bu e-posta adresi zaten kullanılıyor.");
      } else if (err.code === "auth/invalid-email") {
        setError("Geçersiz e-posta adresi.");
      } else if (err.code === "auth/weak-password") {
        setError("Şifre çok zayıf. Daha güçlü bir şifre seçin.");
      } else {
        setError(err.message || "Kayıt başarısız. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Kayıt Ol</h1>
          <p className="text-gray-600 mb-8">Yeni hesap oluşturun</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Ad Soyad
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Adınız Soyadınız"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Telefon (Opsiyonel)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="05xx xxx xx xx"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Şifre Tekrar
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* KVKK Checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <input
                id="kvkk"
                type="checkbox"
                checked={kvkkAccepted}
                onChange={(e) => setKvkkAccepted(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
              />
              <div className="flex-1">
                <label htmlFor="kvkk" className="text-sm text-gray-700 cursor-pointer block mb-2">
                  <span className="font-semibold">☑️</span> Kişisel verilerimin, KVKK kapsamında Aydın
                  Gençlik Zirvesi tarafından işlenmesini kabul ediyorum.
                </label>
                <button
                  type="button"
                  onClick={() => setKvkkModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  → KVKK Metnini Oku
                </button>
              </div>
            </div>

            {!kvkkAccepted && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>⚠️</strong> Kayıt olmak için KVKK onayı zorunludur.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !kvkkAccepted}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Zaten hesabınız var mı?{" "}
              <Link 
                href={`/auth/login${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}`} 
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Giriş Yap
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Ana sayfaya dön
            </Link>
          </div>
        </div>
      </div>

      {/* KVKK Modal */}
      <KVKKModal isOpen={kvkkModalOpen} onClose={() => setKvkkModalOpen(false)} />

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
