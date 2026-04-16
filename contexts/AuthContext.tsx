'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onIdTokenChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { Kullanici } from '@/lib/firebase/types';

interface AuthContextType {
  user: User | null;
  kullanici: Kullanici | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  kullanici: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [kullanici, setKullanici] = useState<Kullanici | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const [userSnap, adminSnap] = await Promise.all([
            getDoc(doc(db, 'users', firebaseUser.uid)),
            getDoc(doc(db, 'admins', firebaseUser.uid)),
          ]);
          setKullanici(userSnap.exists() ? (userSnap.data() as Kullanici) : null);
          setIsAdmin(adminSnap.exists());
        } catch {
          setKullanici(null);
          setIsAdmin(false);
        }
      } else {
        setKullanici(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    // Clear the httpOnly session cookie via API route
    await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});
    setUser(null);
    setKullanici(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, kullanici, isAdmin, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
