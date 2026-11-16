import { getApiBaseUrl } from "@/config/env";
import type { ApiEnvelope } from "@/types/auth";

export class ApiClientError extends Error {
  readonly status: number;
  readonly body?: ApiEnvelope;

  constructor(message: string, status: number, body?: ApiEnvelope) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.body = body;
  }
}

export type ApiRequestOptions = {
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeoutMs?: number;
  authToken?: string | null;
};

const DEFAULT_TIMEOUT_MS = 30_000;

type TokenProvider = () => string | null | Promise<string | null>;

let tokenProvider: TokenProvider | undefined;

export function setApiAuthTokenProvider(provider: TokenProvider | undefined): void {
  tokenProvider = provider;
}

async function resolveAuthToken(explicit?: string | null): Promise<string | null> {
  if (explicit !== undefined) {
    return explicit;
  }
  if (!tokenProvider) {
    return null;
  }
  return tokenProvider();
}

function resolveUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiClientError(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
      0,
    );
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: ApiRequestOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const onAbort = () => controller.abort();
  options.signal?.addEventListener("abort", onAbort);

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  const token = await resolveAuthToken(options.authToken);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(resolveUrl(path), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      credentials: "omit",
    });

    let envelope: ApiEnvelope<T> | null = null;
    try {
      envelope = (await response.json()) as ApiEnvelope<T>;
    } catch {
      if (!response.ok) {
        throw new ApiClientError(
          response.statusText || "Request failed",
          response.status,
        );
      }
      throw new ApiClientError("Invalid response from server", response.status);
    }

    if (!response.ok || !envelope.success) {
      throw new ApiClientError(
        envelope.message || response.statusText || "Request failed",
        response.status,
        envelope,
      );
    }

    return envelope.data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiClientError("Request timed out", 0);
    }
    throw new ApiClientError(
      error instanceof Error ? error.message : "Network request failed",
      0,
    );
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", onAbort);
  }
}

export const apiClient = {
  get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return request<T>("GET", path, undefined, options);
  },
  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return request<T>("POST", path, body, options);
  },
  put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return request<T>("PUT", path, body, options);
  },
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return request<T>("DELETE", path, undefined, options);
  },
};