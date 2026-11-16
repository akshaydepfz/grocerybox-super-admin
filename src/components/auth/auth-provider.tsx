"use client";

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
import {
  revalidateSuperAdminSession,
  signOutSuperAdmin,
} from "@/services/auth-service";
import type { SuperAdminProfile } from "@/types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  admin: SuperAdminProfile | null;
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
  const [admin, setAdmin] = useState<SuperAdminProfile | null>(null);

  const refreshSession = useCallback(async () => {
    const session = await revalidateSuperAdminSession();
    if (session) {
      setAdmin(session.admin);
      setStatus("authenticated");
      return true;
    }
    setAdmin(null);
    setStatus("unauthenticated");
    return false;
  }, []);

  const signOut = useCallback(async () => {
    await signOutSuperAdmin();
    setAdmin(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    if (!configured) {
      return;
    }
    void refreshSession();
  }, [configured, refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      admin,
      email: admin?.email ?? null,
      configured,
      signOut,
      refreshSession,
    }),
    [admin, configured, refreshSession, signOut, status],
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