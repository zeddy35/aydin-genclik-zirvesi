"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Application } from "@/types/firestore";
import Link from "next/link";

export default function StatusPage() {
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Henüz Başvurunuz Yok</h1>
          <p className="text-gray-600 mb-6">
            Aşağıdaki etkinliklerden birine başvuru yaparak başlayabilirsiniz.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/gamejam/basvur"
              className="inline-flex px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
            >
              🎮 Game Jam Başvuru
            </Link>
            <Link
              href="/hackathon/basvur"
              className="inline-flex px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all"
            >
              💻 Hackathon Başvuru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { bg: "bg-gray-100", text: "text-gray-800", label: "Taslak", icon: "📝" },
      submitted: { bg: "bg-blue-100", text: "text-blue-800", label: "İncelemede", icon: "⏳" },
      approved: { bg: "bg-green-100", text: "text-green-800", label: "Onaylandı", icon: "✅" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Reddedildi", icon: "❌" },
    };
    
    const badge = badges[status as keyof typeof badges] || badges.draft;
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Başvuru Durumu</h1>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${
          application.eventType === "gamejam"
            ? "bg-gradient-to-r from-purple-600 to-blue-600"
            : "bg-gradient-to-r from-gray-900 to-gray-700"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">
                {application.eventType === "gamejam" ? "🎮 Aydın Game Jam" : "💻 HackathOn Aydın"}
              </h2>
              <p className="text-white/80 mt-1">
                {application.eventType === "gamejam" 
                  ? "48 saat, sınırsız yaratıcılık"
                  : "İnovasyon için kod yaz"}
              </p>
            </div>
            <div>
              {getStatusBadge(application.status)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Message */}
          {application.status === "submitted" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900 font-medium">
                Başvurunuz başarıyla alındı! Değerlendirme süreci devam ediyor.
              </p>
            </div>
          )}

          {application.status === "approved" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-900 font-medium">
                🎉 Tebrikler! Başvurunuz onaylandı. Etkinlik detayları için belgelerim sayfasını kontrol edin.
              </p>
            </div>
          )}

          {application.status === "rejected" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-900 font-medium">
                Başvurunuz reddedildi.
              </p>
              {application.statusReason && (
                <p className="text-red-700 mt-2 text-sm">
                  <strong>Sebep:</strong> {application.statusReason}
                </p>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Başvuru Tarihi</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(application.timestamps.createdAt)}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Gönderim Tarihi</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(application.timestamps.submittedAt)}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">İnceleme Tarihi</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(application.timestamps.reviewedAt)}
              </p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Başvuru Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Okul</p>
                <p className="font-medium text-gray-900">{application.profile.school}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bölüm</p>
                <p className="font-medium text-gray-900">{application.profile.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Şehir</p>
                <p className="font-medium text-gray-900">{application.profile.city}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
