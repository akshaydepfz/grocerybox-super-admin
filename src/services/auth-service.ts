import { isApiConfigured } from "@/config/env";
import { apiClient, ApiClientError } from "@/lib/api-client";
import {
  AuthServiceError,
  type LoginCredentials,
  type SuperAdminAuthPayload,
  type SuperAdminSession,
} from "@/types/auth";

const SUPER_ADMIN_AUTH_BASE = "/api/super-admin/auth";
const LOGIN_PATH = `${SUPER_ADMIN_AUTH_BASE}/login`;
const ME_PATH = `${SUPER_ADMIN_AUTH_BASE}/me`;
const LOGOUT_PATH = `${SUPER_ADMIN_AUTH_BASE}/logout`;

const SESSION_FETCH = { credentials: "include" as const };

function mapApiError(error: unknown, fallback: string): AuthServiceError {
  if (error instanceof ApiClientError) {
    return new AuthServiceError(error.message || fallback, { status: error.status });
  }
  if (error instanceof Error) {
    return new AuthServiceError(error.message || fallback);
  }
  return new AuthServiceError(fallback);
}

export async function signInSuperAdmin(
  credentials: LoginCredentials,
): Promise<SuperAdminSession> {
  if (!isApiConfigured()) {
    throw new AuthServiceError(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
    );
  }

  try {
    const data = await apiClient.post<SuperAdminAuthPayload>(
      LOGIN_PATH,
      {
        email: credentials.email.trim(),
        password: credentials.password,
      },
      SESSION_FETCH,
    );
    return { admin: data.admin };
  } catch (error) {
    throw mapApiError(error, "Unable to sign in.");
  }
}

export async function signOutSuperAdmin(): Promise<void> {
  if (!isApiConfigured()) {
    return;
  }
  try {
    await apiClient.post<unknown>(LOGOUT_PATH, undefined, SESSION_FETCH);
  } catch {
    // Best-effort: cookie may already be cleared client-side after navigation.
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  const target = email.trim() || "this account";
  throw new AuthServiceError(
    `Password reset is not available for ${target}. Contact a platform administrator.`,
  );
}

/** Returns whether the browser still has a valid super-admin session cookie. */
export async function revalidateSuperAdminSession(): Promise<SuperAdminSession | null> {
  if (!isApiConfigured()) {
    return null;
  }
  try {
    const data = await apiClient.get<SuperAdminAuthPayload>(ME_PATH, SESSION_FETCH);
    return { admin: data.admin };
  } catch {
    return null;
  }
}