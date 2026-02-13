import { useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface UserCheckResult {
  emailExists: boolean;
  phoneExists: boolean;
}

export function useCheckUserExists() {
  const [checking, setChecking] = useState(false);

  const check = useCallback(
    async (email?: string, phone?: string): Promise<UserCheckResult> => {
      if (!email && !phone) return { emailExists: false, phoneExists: false };

      setChecking(true);
      const result: UserCheckResult = {
        emailExists: false,
        phoneExists: false,
      };

      try {
        // Check email
        if (email && email.trim()) {
          const emailQuery = query(
            collection(db, "users"),
            where("email", "==", email.toLowerCase())
          );
          const emailDocs = await getDocs(emailQuery);
          result.emailExists = !emailDocs.empty;
        }

        // Check phone
        if (phone && phone.trim()) {
          const phoneQuery = query(
            collection(db, "users"),
            where("phone", "==", phone)
          );
          const phoneDocs = await getDocs(phoneQuery);
          result.phoneExists = !phoneDocs.empty;
        }
      } catch (error) {
        console.error("User check error:", error);
      } finally {
        setChecking(false);
      }

      return result;
    },
    []
  );

  return { check, checking };
}
