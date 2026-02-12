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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [eventType, setEventType] = useState<"" | "hackathon" | "game_jam">("");
  const [participationType, setParticipationType] = useState<"individual" | "team">("individual");
  const [teamName, setTeamName] = useState("");
  const [teammates, setTeammates] = useState<
    {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      university: string;
      department: string;
    }[]
  >([]);
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

  const handleAddTeammate = () => {
    if (teammates.length >= 3) return;
    setTeammates((prev) => [
      ...prev,
      { firstName: "", lastName: "", email: "", phone: "", university: "", department: "" },
    ]);
  };

  const handleRemoveTeammate = (index: number) => {
    setTeammates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTeammateChange = (
    index: number,
    field: "firstName" | "lastName" | "email" | "phone" | "university" | "department",
    value: string
  ) => {
    setTeammates((prev) =>
      prev.map((member, i) => (i === index ? { ...member, [field]: value } : member))
    );
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

    if (!eventType) {
      setError("Lütfen etkinlik türünü seçin.");
      return;
    }

    if (participationType === "team") {
      if (!teamName.trim()) {
        setError("Takım adını giriniz.");
        return;
      }

      if (teammates.length === 0) {
        setError("Takım seçtiyseniz en az 1 takım arkadaşı eklemelisiniz.");
        return;
      }

      const invalidMember = teammates.find(
        (member) =>
          !member.firstName.trim() ||
          !member.lastName.trim() ||
          !member.email.trim() ||
          !member.phone.trim() ||
          !member.university.trim() ||
          !member.department.trim()
      );

      if (invalidMember) {
        setError("Takım arkadaşlarının tüm bilgilerini eksiksiz doldurun.");
        return;
      }
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
        displayName: `${firstName} ${lastName}`.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone || null,
        university: university.trim(),
        department: department.trim(),
        eventType,
        participationType,
        teamName: participationType === "team" ? teamName.trim() : "",
        teammates: participationType === "team" ? teammates : [],
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
    <main className="min-h-screen bg-[url('/backgrounds/hackathon_apply_bg.png')] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Kayıt Ol</h1>
          <p className="text-gray-600 mb-8">Yeni hesap oluşturun</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  İsim
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="İsminiz"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Soyisim
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Soyisminiz"
                />
              </div>
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
                Telefon
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="05xx xxx xx xx"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="university" className="block text-sm font-semibold text-gray-700 mb-2">
                  Üniversite
                </label>
                <input
                  id="university"
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Üniversiteniz"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                  Bölüm
                </label>
                <input
                  id="department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Bölümünüz"
                />
              </div>
            </div>

            <div>
              <span className="block text-sm font-semibold text-gray-700 mb-2">
                Etkinlik Türü
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                  <input
                    type="radio"
                    name="eventType"
                    value="hackathon"
                    checked={eventType === "hackathon"}
                    onChange={() => setEventType("hackathon")}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Hackathon</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                  <input
                    type="radio"
                    name="eventType"
                    value="game_jam"
                    checked={eventType === "game_jam"}
                    onChange={() => setEventType("game_jam")}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Game Jam</span>
                </label>
              </div>
            </div>

            <div>
              <span className="block text-sm font-semibold text-gray-700 mb-2">
                Katılım Türü
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                  <input
                    type="radio"
                    name="participationType"
                    value="individual"
                    checked={participationType === "individual"}
                    onChange={() => setParticipationType("individual")}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Bireysel</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                  <input
                    type="radio"
                    name="participationType"
                    value="team"
                    checked={participationType === "team"}
                    onChange={() => setParticipationType("team")}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Takım</span>
                </label>
              </div>
            </div>

            {participationType === "team" && (
              <div className="space-y-4 rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Takım Adı
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Takım adınız"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Takım Arkadaşları</h3>
                    <p className="text-xs text-gray-600">
                      Toplam takım en fazla 4 kişi olabilir. (Siz + en fazla 3 kişi)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTeammate}
                    disabled={teammates.length >= 3}
                    className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    + Takım Arkadaşı Ekle
                  </button>
                </div>

                {teammates.length === 0 && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
                    Takım seçtiyseniz en az 1 takım arkadaşı eklemelisiniz.
                  </div>
                )}

                {teammates.map((member, index) => (
                  <div
                    key={`teammate-${index}`}
                    className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        Takım Arkadaşı {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTeammate(index)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Kaldır
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`teammate-first-${index}`}
                          className="block text-xs font-semibold text-gray-600 mb-2"
                        >
                          İsim
                        </label>
                        <input
                          id={`teammate-first-${index}`}
                          type="text"
                          value={member.firstName}
                          onChange={(e) =>
                            handleTeammateChange(index, "firstName", e.target.value)
                          }
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                          placeholder="İsim"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`teammate-last-${index}`}
                          className="block text-xs font-semibold text-gray-600 mb-2"
                        >
                          Soyisim
                        </label>
                        <input
                          id={`teammate-last-${index}`}
                          type="text"
                          value={member.lastName}
                          onChange={(e) =>
                            handleTeammateChange(index, "lastName", e.target.value)
                          }
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                          placeholder="Soyisim"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`teammate-email-${index}`}
                          className="block text-xs font-semibold text-gray-600 mb-2"
                        >
                          E-posta
                        </label>
                        <input
                          id={`teammate-email-${index}`}
                          type="email"
                          value={member.email}
                          onChange={(e) =>
                            handleTeammateChange(index, "email", e.target.value)
                          }
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                          placeholder="ornek@email.com"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`teammate-phone-${index}`}
                          className="block text-xs font-semibold text-gray-600 mb-2"
                        >
                          Telefon
                        </label>
                        <input
                          id={`teammate-phone-${index}`}
                          type="tel"
                          value={member.phone}
                          onChange={(e) =>
                            handleTeammateChange(index, "phone", e.target.value)
                          }
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                          placeholder="05xx xxx xx xx"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor={`teammate-university-${index}`}
                        className="block text-xs font-semibold text-gray-600 mb-2"
                      >
                        Üniversite
                      </label>
                      <input
                        id={`teammate-university-${index}`}
                        type="text"
                        value={member.university}
                        onChange={(e) =>
                          handleTeammateChange(index, "university", e.target.value)
                        }
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                        placeholder="Üniversite"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`teammate-department-${index}`}
                        className="block text-xs font-semibold text-gray-600 mb-2"
                      >
                        Bölüm
                      </label>
                      <input
                        id={`teammate-department-${index}`}
                        type="text"
                        value={member.department}
                        onChange={(e) =>
                          handleTeammateChange(index, "department", e.target.value)
                        }
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                        placeholder="Bölüm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
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
