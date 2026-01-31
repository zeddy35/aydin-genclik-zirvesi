"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Application, AdminDocument } from "@/types/firestore";

export default function DocumentsPage() {
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

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

  const handleDownload = async (doc: AdminDocument) => {
    if (!user) return;

    setDownloading(doc.id);
    try {
      const token = await user.getIdToken();

      // Get presigned download URL from API
      const response = await fetch(`/api/download/${doc.key}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Browser will automatically download the file
        // The API returns a redirect to presigned URL
        window.location.href = response.url;
      } else {
        alert("Dosya indirilemedi. Lütfen tekrar deneyin.");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("İndirme hatası oluştu.");
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  const documents = application?.adminDocs || [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Belgelerim</h1>
      <p className="text-gray-600 mb-8">
        Admin tarafından yüklenen belgelerinizi buradan indirebilirsiniz.
      </p>

      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Henüz Belge Yok</h2>
          <p className="text-gray-600">
            Başvurunuz onaylandıktan sonra admin tarafından belgeler yüklenecektir.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {documents.map((document: AdminDocument) => (
              <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <span className="text-2xl">
                        {document.mime.includes("pdf") ? "📕" : document.mime.includes("image") ? "🖼️" : "📄"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{document.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(document.uploadedAt).toLocaleDateString("tr-TR")} •{" "}
                        {(document.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(document)}
                    disabled={downloading === document.id}
                    className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading === document.id ? "İndiriliyor..." : "İndir"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
