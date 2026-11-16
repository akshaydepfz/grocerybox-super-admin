import { isApiConfigured } from "@/config/env";
import { apiClient, ApiClientError } from "@/lib/api-client";
import type { PaginationMeta } from "@/types/merchant";

const SESSION_FETCH = { credentials: "include" as const };

export type MasterSubcategoryListItem = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
};

export type MasterSubcategoryListResponse = {
  items: MasterSubcategoryListItem[];
  pagination: PaginationMeta;
};

export class MasterSubcategoryServiceError extends Error {
  readonly status?: number;

  constructor(message: string, options?: { status?: number }) {
    super(message);
    this.name = "MasterSubcategoryServiceError";
    this.status = options?.status;
  }
}

function mapApiError(error: unknown, fallback: string): MasterSubcategoryServiceError {
  if (error instanceof ApiClientError) {
    return new MasterSubcategoryServiceError(error.message || fallback, {
      status: error.status,
    });
  }
  if (error instanceof Error) {
    return new MasterSubcategoryServiceError(error.message || fallback);
  }
  return new MasterSubcategoryServiceError(fallback);
}

export async function listMasterSubcategories(
  categoryId: string,
  params: { page?: number; limit?: number } = {},
): Promise<MasterSubcategoryListResponse> {
  if (!isApiConfigured()) {
    throw new MasterSubcategoryServiceError(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
    );
  }
  const id = categoryId.trim();
  if (!id) {
    return { items: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0 } };
  }
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  const query = search.toString();
  try {
    return await apiClient.get<MasterSubcategoryListResponse>(
      `/api/super-admin/master-categories/${encodeURIComponent(id)}/subcategories${query ? `?${query}` : ""}`,
      SESSION_FETCH,
    );
  } catch (error) {
    throw mapApiError(error, "Unable to load subcategories.");
  }
}