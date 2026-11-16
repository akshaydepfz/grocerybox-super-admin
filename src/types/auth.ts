/** Standard Go backend envelope. */
export type ApiEnvelope<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

export type SuperAdminProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type SuperAdminSession = {
  admin: SuperAdminProfile;
};

export type SuperAdminAuthPayload = {
  admin: SuperAdminProfile;
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