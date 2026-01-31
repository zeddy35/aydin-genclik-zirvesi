"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Submission } from "@/types/firestore";

export default function TrailerPage() {
  const { user } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubmission();
    }
  }, [user]);

  const loadSubmission = async () => {
    if (!user) return;
    
    try {
      const subRef = doc(db, "submissions", user.uid);
      const subSnap = await getDoc(subRef);
      
      if (subSnap.exists()) {
        const data = subSnap.data() as Submission;
        setSubmission(data);
        setTrailerUrl(data.hackathon?.trailerUrl || "");
      }
    } catch (error) {
      console.error("Error loading submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/youtu\.be\/[\w-]+/,
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const handleSaveTrailer = async () => {
    if (!user) return;
    
    if (!validateYouTubeUrl(trailerUrl)) {
      alert("Lütfen geçerli bir YouTube linki girin (youtube.com/watch?v=... veya youtu.be/...)");
      return;
    }
    
    setSaving(true);
    try {
      const subData: Submission = {
        uid: user.uid,
        eventType: "hackathon",
        hackathon: {
          trailerUrl,
          updatedAt: new Date().toISOString(),
        },
      };

      await setDoc(doc(db, "submissions", user.uid), subData, { merge: true });
      setSubmission(subData);
      alert("Trailer linki kaydedildi!");
    } catch (error) {
      console.error("Error saving trailer:", error);
      alert("Link kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-2">🎬 Trailer Link</h1>
      <p className="text-gray-600 mb-8">
        Projenizin tanıtım videosunun YouTube linkini buradan paylaşabilirsiniz.
      </p>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">YouTube Video Linki</h2>
        <p className="text-gray-600 text-sm mb-4">
          Projenizin tanıtım videosunu YouTube'a yükleyin ve linkini buraya ekleyin.
        </p>
        
        <div className="flex gap-3">
          <input
            type="url"
            value={trailerUrl}
            onChange={(e) => setTrailerUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={handleSaveTrailer}
            disabled={saving || !trailerUrl}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>

        {submission?.hackathon?.trailerUrl && (
          <div className="mt-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-green-900 font-medium">Kayıtlı Video:</p>
              <a
                href={submission.hackathon.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 underline break-all text-sm"
              >
                {submission.hackathon.trailerUrl}
              </a>
              <p className="text-green-700 text-xs mt-1">
                Son güncelleme: {new Date(submission.hackathon.updatedAt || "").toLocaleDateString("tr-TR")}
              </p>
            </div>

            {/* Video Preview */}
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              <iframe
                src={getYouTubeEmbedUrl(submission.hackathon.trailerUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Trailer Preview"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 İpucu</h3>
        <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
          <li>Videonuzu YouTube'a "Herkese Açık" veya "Bağlantıyı Bilenler" olarak yükleyin</li>
          <li>Video süresi 2-5 dakika arası olmalıdır</li>
          <li>Projenizin temel özelliklerini ve kullanımını gösterin</li>
        </ul>
      </div>
    </div>
  );
}
