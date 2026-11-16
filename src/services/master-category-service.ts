import { isApiConfigured } from "@/config/env";
import { apiClient, ApiClientError } from "@/lib/api-client";
import type {
  MasterCategory,
  MasterCategoryCreateInput,
  MasterCategoryListParams,
  MasterCategoryListResponse,
} from "@/types/master-category";

const CATEGORIES_BASE = "/api/super-admin/master-categories";
const SESSION_FETCH = { credentials: "include" as const };

export class MasterCategoryServiceError extends Error {
  readonly status?: number;

  constructor(message: string, options?: { status?: number }) {
    super(message);
    this.name = "MasterCategoryServiceError";
    this.status = options?.status;
  }
}

function mapApiError(error: unknown, fallback: string): MasterCategoryServiceError {
  if (error instanceof ApiClientError) {
    return new MasterCategoryServiceError(error.message || fallback, { status: error.status });
  }
  if (error instanceof Error) {
    return new MasterCategoryServiceError(error.message || fallback);
  }
  return new MasterCategoryServiceError(fallback);
}

function toQuery(params: MasterCategoryListParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.search?.trim()) search.set("search", params.search.trim());
  if (params.is_active != null) {
    search.set("is_active", params.is_active ? "true" : "false");
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function listMasterCategories(
  params: MasterCategoryListParams = {},
): Promise<MasterCategoryListResponse> {
  if (!isApiConfigured()) {
    throw new MasterCategoryServiceError(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
    );
  }

  try {
    return await apiClient.get<MasterCategoryListResponse>(
      `${CATEGORIES_BASE}${toQuery(params)}`,
      SESSION_FETCH,
    );
  } catch (error) {
    throw mapApiError(error, "Unable to load categories.");
  }
}

export async function createMasterCategory(
  input: MasterCategoryCreateInput,
): Promise<MasterCategory> {
  if (!isApiConfigured()) {
    throw new MasterCategoryServiceError(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
    );
  }

  const name = input.name.trim();
  if (!name) {
    throw new MasterCategoryServiceError("Category name is required.");
  }

  const body: MasterCategoryCreateInput = { name };
  if (input.image_url !== undefined) {
    body.image_url = input.image_url;
  }
  if (input.display_order != null) {
    body.display_order = input.display_order;
  }
  if (input.is_active != null) {
    body.is_active = input.is_active;
  }

  try {
    return await apiClient.post<MasterCategory>(CATEGORIES_BASE, body, SESSION_FETCH);
  } catch (error) {
    throw mapApiError(error, "Unable to create category.");
  }
}