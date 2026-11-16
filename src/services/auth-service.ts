import {
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

import { isApiConfigured, isFirebaseConfigured } from "@/config/env";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { getFirebaseAuth } from "@/lib/firebase/client";
import {
  AuthServiceError,
  type LoginCredentials,
  type SuperAdminSession,
} from "@/types/auth";
import { firebaseAuthMessage } from "@/utils/firebase-auth-messages";

const ADMIN_PROBE_PATH = "/api/v1/admin/master-categories?limit=1";

/** Confirms the current Firebase ID token is authorized for platform-admin API routes. */
export async function verifyPlatformAdminAccess(idToken: string): Promise<void> {
  try {
    await apiClient.get<unknown>(ADMIN_PROBE_PATH, { authToken: idToken });
  } catch (error) {
    if (error instanceof ApiClientError) {
      if (error.status === 401) {
        throw new AuthServiceError("Authentication failed. Sign in again.", {
          status: 401,
        });
      }
      if (error.status === 403) {
        throw new AuthServiceError(
          "Your account is not authorized as a GroceryBox platform administrator.",
          { status: 403 },
        );
      }
      throw new AuthServiceError(error.message, { status: error.status });
    }
    throw error;
  }
}

export async function getCurrentIdToken(
  forceRefresh = false,
): Promise<string | null> {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    return null;
  }
  return user.getIdToken(forceRefresh);
}

export async function signInSuperAdmin(
  credentials: LoginCredentials,
): Promise<SuperAdminSession> {
  if (!isFirebaseConfigured()) {
    throw new AuthServiceError(
      "Firebase authentication is not configured. Add NEXT_PUBLIC_FIREBASE_* variables.",
    );
  }
  if (!isApiConfigured()) {
    throw new AuthServiceError(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
    );
  }

  const auth = getFirebaseAuth();
  await setPersistence(
    auth,
    credentials.rememberMe ? browserLocalPersistence : browserSessionPersistence,
  );

  let user: User;
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      credentials.email.trim(),
      credentials.password,
    );
    user = credential.user;
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: string }).code)
        : undefined;
    const message =
      error && typeof error === "object" && "code" in error
        ? firebaseAuthMessage(error as { code: string; message?: string })
        : "Sign-in failed.";
    throw new AuthServiceError(message, { code });
  }

  const idToken = await user.getIdToken();

  try {
    await verifyPlatformAdminAccess(idToken);
  } catch (error) {
    await signOut(auth);
    throw error;
  }

  const email = user.email?.trim() || credentials.email.trim();

  return {
    user,
    email,
    uid: user.uid,
    isPlatformAdmin: true,
  };
}

export async function signOutSuperAdmin(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new AuthServiceError("Firebase is not configured.");
  }
  const trimmed = email.trim();
  if (!trimmed) {
    throw new AuthServiceError("Enter your email address first.");
  }
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), trimmed);
  } catch (error) {
    const message =
      error && typeof error === "object" && "code" in error
        ? firebaseAuthMessage(error as { code: string; message?: string })
        : "Unable to send reset email.";
    throw new AuthServiceError(message);
  }
}

export async function revalidatePlatformAdminSession(): Promise<boolean> {
  const token = await getCurrentIdToken();
  if (!token) {
    return false;
  }
  try {
    await verifyPlatformAdminAccess(token);
    return true;
  } catch {
    await signOutSuperAdmin();
    return false;
  }
}