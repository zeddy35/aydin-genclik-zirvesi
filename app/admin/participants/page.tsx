"use client";

import { useEffect, useState } from "react";
import { collection, query, getDocs, doc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Application, ApplicationStatus, EventType } from "@/types/firestore";

type FilterStatus = ApplicationStatus | "all";
type FilterEvent = EventType | "all";

export default function ParticipantsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [eventFilter, setEventFilter] = useState<FilterEvent>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, statusFilter, eventFilter, searchQuery]);

  const loadApplications = async () => {
    try {
      const appsRef = collection(db, "applications");
      const snapshot = await getDocs(appsRef);
      
      const apps = snapshot.docs.map(doc => doc.data() as Application);
      setApplications(apps);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Event filter
    if (eventFilter !== "all") {
      filtered = filtered.filter(app => app.eventType === eventFilter);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.profile.school.toLowerCase().includes(query) ||
        app.profile.department.toLowerCase().includes(query) ||
        app.profile.city.toLowerCase().includes(query)
      );
    }

    setFilteredApps(filtered);
  };

  const handleApprove = async (uid: string) => {
    if (!confirm("Bu başvuruyu onaylamak istediğinizden emin misiniz?")) return;
    
    try {
      const appRef = doc(db, "applications", uid);
      await updateDoc(appRef, {
        status: "approved",
        "timestamps.reviewedAt": new Date().toISOString(),
      });
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.uid === uid 
          ? { ...app, status: "approved" as ApplicationStatus }
          : app
      ));
      
      alert("Başvuru onaylandı!");
    } catch (error) {
      console.error("Error approving:", error);
      alert("Onaylama başarısız!");
    }
  };

  const handleReject = async (uid: string) => {
    const reason = prompt("Ret sebebi (opsiyonel):");
    
    try {
      const appRef = doc(db, "applications", uid);
      await updateDoc(appRef, {
        status: "rejected",
        statusReason: reason || "Belirtilmedi",
        "timestamps.reviewedAt": new Date().toISOString(),
      });
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.uid === uid 
          ? { ...app, status: "rejected" as ApplicationStatus, statusReason: reason || "Belirtilmedi" }
          : app
      ));
      
      alert("Başvuru reddedildi!");
    } catch (error) {
      console.error("Error rejecting:", error);
      alert("Reddetme başarısız!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Katılımcılar</h1>
        <p className="text-gray-600">Tüm başvuruları görüntüleyin ve yönetin</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Okul, bölüm, şehir ara..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="submitted">İncelemede</option>
            <option value="approved">Onaylı</option>
            <option value="rejected">Reddedilmiş</option>
          </select>

          {/* Event Filter */}
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value as FilterEvent)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tüm Etkinlikler</option>
            <option value="gamejam">Game Jam</option>
            <option value="hackathon">Hackathon</option>
          </select>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <span>Toplam: <strong>{applications.length}</strong></span>
          <span>•</span>
          <span>Gösterilen: <strong>{filteredApps.length}</strong></span>
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Başvuru Bulunamadı</h2>
          <p className="text-gray-600">Filtreleri değiştirerek tekrar deneyin.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <ApplicationCard
              key={app.uid}
              application={app}
              onApprove={() => handleApprove(app.uid)}
              onReject={() => handleReject(app.uid)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({
  application,
  onApprove,
  onReject,
}: {
  application: Application;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isGameJam = application.eventType === "gamejam";
  
  const getStatusBadge = (status: ApplicationStatus) => {
    const badges = {
      draft: { bg: "bg-gray-100", text: "text-gray-800", label: "Taslak" },
      submitted: { bg: "bg-blue-100", text: "text-blue-800", label: "İncelemede" },
      approved: { bg: "bg-green-100", text: "text-green-800", label: "Onaylandı" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Reddedildi" },
    };
    
    const badge = badges[status];
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden ${
      isGameJam ? "border-t-purple-600" : "border-t-gray-900"
    }`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              isGameJam ? "bg-purple-100" : "bg-gray-100"
            }`}>
              <span className="text-2xl">{isGameJam ? "🎮" : "💻"}</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {application.profile.school}
              </h3>
              <p className="text-sm text-gray-600">{application.profile.department}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
              isGameJam 
                ? "bg-purple-100 text-purple-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {isGameJam ? "Game Jam" : "Hackathon"}
            </span>
            {getStatusBadge(application.status)}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Şehir</p>
            <p className="font-medium text-gray-900">{application.profile.city}</p>
          </div>
          <div>
            <p className="text-gray-500">Başvuru Tarihi</p>
            <p className="font-medium text-gray-900">
              {new Date(application.timestamps.createdAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Deneyim</p>
            <p className="font-medium text-gray-900">
              {(application.eventData as any).experience || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">UID</p>
            <p className="font-mono text-xs text-gray-600">{application.uid.slice(0, 8)}...</p>
          </div>
        </div>

        {application.status === "submitted" && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onApprove}
              className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all"
            >
              ✅ Onayla
            </button>
            <button
              onClick={onReject}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all"
            >
              ❌ Reddet
            </button>
          </div>
        )}

        {application.status === "rejected" && application.statusReason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-900 text-sm">
              <strong>Red Sebebi:</strong> {application.statusReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
