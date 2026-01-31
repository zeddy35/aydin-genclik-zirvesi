"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Submission } from "@/types/firestore";

export default function GameSubmissionPage() {
  const { user } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [itchLink, setItchLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        setItchLink(data.gamejam?.itchLink || "");
      }
    } catch (error) {
      console.error("Error loading submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/zip" && file.type !== "application/x-zip-compressed") {
        alert("Lütfen ZIP dosyası seçiniz!");
        return;
      }
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        alert("Dosya 500MB'dan küçük olmalıdır!");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadZip = async () => {
    if (!user || !selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Get auth token
      const token = await user.getIdToken();

      // 1. Get presigned URL from API
      const presignedResponse = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          eventType: "gamejam",
        }),
      });

      if (!presignedResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { presignedUrl, key } = await presignedResponse.json();

      // 2. Upload file to R2 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // 3. Update Firestore with file metadata
      const subData: Submission = {
        uid: user.uid,
        eventType: "gamejam",
        gamejam: {
          gameUpload: {
            key,
            size: selectedFile.size,
            uploadedAt: new Date().toISOString(),
          },
          itchLink,
          updatedAt: new Date().toISOString(),
        },
      };

      await setDoc(doc(db, "submissions", user.uid), subData, { merge: true });
      setSubmission(subData);
      setSelectedFile(null);
      alert("Oyun dosyası başarıyla yüklendi!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Dosya yüklenirken hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveItchLink = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const subData: Submission = {
        uid: user.uid,
        eventType: "gamejam",
        gamejam: {
          itchLink,
          updatedAt: new Date().toISOString(),
        },
      };

      await setDoc(doc(db, "submissions", user.uid), subData, { merge: true });
      setSubmission(subData);
      alert("Itch.io linki kaydedildi!");
    } catch (error) {
      console.error("Error saving link:", error);
      alert("Link kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-2">🎮 Oyun Yükleme</h1>
      <p className="text-gray-600 mb-8">
        Geliştirdiğiniz oyunu buradan yükleyebilir veya Itch.io linkinizi paylaşabilirsiniz.
      </p>

      {/* ZIP Upload */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Oyun Dosyası (ZIP)</h2>
        <p className="text-gray-600 text-sm mb-4">
          Maksimum 500MB, ZIP formatında
        </p>
        
        {!submission?.gamejam?.gameUpload ? (
          <div className="space-y-4">
            <input
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100"
            />

            {selectedFile && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 font-medium">
                  Seçilen dosya: {selectedFile.name}
                </p>
                <p className="text-blue-700 text-sm">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <button
              onClick={handleUploadZip}
              disabled={uploading || !selectedFile}
              className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? `Yükleniyor... ${uploadProgress}%` : "Dosyayı Yükle"}
            </button>
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-900 font-medium">
              ✅ Oyun dosyası yüklendi
            </p>
            <p className="text-green-700 text-sm mt-1">
              {(submission.gamejam.gameUpload.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className="text-green-600 text-xs mt-2">
              {new Date(submission.gamejam.gameUpload.uploadedAt).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}
      </div>

      {/* Itch.io Link */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Itch.io Linki</h2>
        <p className="text-gray-600 text-sm mb-4">
          Oyununuzu Itch.io'ya yüklediyseniz, linkini buraya ekleyebilirsiniz.
        </p>
        <div className="flex gap-3">
          <input
            type="url"
            value={itchLink}
            onChange={(e) => setItchLink(e.target.value)}
            placeholder="https://yourgame.itch.io/game-name"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleSaveItchLink}
            disabled={saving || !itchLink}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
        {submission?.gamejam?.itchLink && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-900 font-medium">Kayıtlı Link:</p>
            <a
              href={submission.gamejam.itchLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 underline break-all"
            >
              {submission.gamejam.itchLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
