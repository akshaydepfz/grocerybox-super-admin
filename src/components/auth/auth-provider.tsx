"use client";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { isAuthStackConfigured } from "@/config/env";
import { setApiAuthTokenProvider } from "@/lib/api-client";
import { getFirebaseAuth } from "@/lib/firebase/client";
import {
  getCurrentIdToken,
  revalidatePlatformAdminSession,
  signOutSuperAdmin,
} from "@/services/auth-service";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  email: string | null;
  configured: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isAuthStackConfigured();
  const [status, setStatus] = useState<AuthStatus>(() =>
    configured ? "loading" : "unauthenticated",
  );
  const [user, setUser] = useState<User | null>(null);

  const refreshSession = useCallback(async () => {
    const valid = await revalidatePlatformAdminSession();
    if (valid) {
      setUser(getFirebaseAuth().currentUser);
      setStatus("authenticated");
    } else {
      setUser(null);
      setStatus("unauthenticated");
    }
    return valid;
  }, []);

  const signOut = useCallback(async () => {
    await signOutSuperAdmin();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    setApiAuthTokenProvider(() => getCurrentIdToken());

    if (!configured) {
      return;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      setStatus("loading");
      const valid = await revalidatePlatformAdminSession();
      if (valid) {
        setUser(nextUser);
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    });

    return () => unsubscribe();
  }, [configured]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      email: user?.email ?? null,
      configured,
      signOut,
      refreshSession,
    }),
    [configured, refreshSession, signOut, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}