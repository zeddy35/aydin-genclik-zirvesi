"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useState } from "react";

export function useAdminActions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const approveApplication = async (uid: string, reason?: string) => {
    return updateApplicationStatus(uid, "approved", reason);
  };

  const rejectApplication = async (uid: string, reason: string) => {
    if (!reason) {
      setError("Lütfen red sebebini yazın");
      return false;
    }
    return updateApplicationStatus(uid, "rejected", reason);
  };

  const updateApplicationStatus = async (
    uid: string,
    status: "approved" | "rejected",
    reason?: string
  ) => {
    if (!user) {
      setError("Lütfen giriş yapın");
      return false;
    }

    setLoading(true);
    setError("");

    try {
      const token = await user.getIdToken();

      const response = await fetch("/api/admin/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid,
          status,
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "İşlem başarısız oldu");
      }

      return true;
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    approveApplication,
    rejectApplication,
    loading,
    error,
  };
}
