import type { User } from "firebase/auth";

/** Standard Go backend envelope. */
export type ApiEnvelope<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

export type SuperAdminSession = {
  user: User;
  email: string;
  uid: string;
  isPlatformAdmin: true;
};

export type LoginCredentials = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export class AuthServiceError extends Error {
  readonly code?: string;
  readonly status?: number;

  constructor(message: string, options?: { code?: string; status?: number }) {
    super(message);
    this.name = "AuthServiceError";
    this.code = options?.code;
    this.status = options?.status;
  }
}