import { isApiConfigured } from "@/config/env";
import { apiClient, ApiClientError } from "@/lib/api-client";
import type {
  MerchantDetailResponse,
  SuperAdminMerchantListParams,
  SuperAdminMerchantListResponse,
} from "@/types/merchant";

const MERCHANTS_BASE = "/api/super-admin/merchants";
const SESSION_FETCH = { credentials: "include" as const };

export class MerchantServiceError extends Error {
  readonly status?: number;

  constructor(message: string, options?: { status?: number }) {
    super(message);
    this.name = "MerchantServiceError";
    this.status = options?.status;
  }
}

function mapApiError(error: unknown, fallback: string): MerchantServiceError {
  if (error instanceof ApiClientError) {
    return new MerchantServiceError(error.message || fallback, { status: error.status });
  }
  if (error instanceof Error) {
    return new MerchantServiceError(error.message || fallback);
  }
  return new MerchantServiceError(fallback);
}

function toQuery(params: SuperAdminMerchantListParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.search?.trim()) search.set("search", params.search.trim());
  if (params.account_status) search.set("account_status", params.account_status);
  if (params.onboarding_status) search.set("onboarding_status", params.onboarding_status);
  if (params.store_published != null) {
    search.set("store_published", params.store_published ? "true" : "false");
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function listSuperAdminMerchants(
  params: SuperAdminMerchantListParams = {},
): Promise<SuperAdminMerchantListResponse> {
  if (!isApiConfigured()) {
    throw new MerchantServiceError(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
    );
  }

  try {
    return await apiClient.get<SuperAdminMerchantListResponse>(
      `${MERCHANTS_BASE}${toQuery(params)}`,
      SESSION_FETCH,
    );
  } catch (error) {
    throw mapApiError(error, "Unable to load merchants.");
  }
}

export async function getSuperAdminMerchant(
  merchantId: string,
): Promise<MerchantDetailResponse> {
  if (!isApiConfigured()) {
    throw new MerchantServiceError(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
    );
  }

  const id = merchantId.trim();
  if (!id) {
    throw new MerchantServiceError("Merchant id is required.");
  }

  try {
    return await apiClient.get<MerchantDetailResponse>(
      `${MERCHANTS_BASE}/${encodeURIComponent(id)}`,
      SESSION_FETCH,
    );
  } catch (error) {
    throw mapApiError(error, "Unable to load merchant details.");
  }
}