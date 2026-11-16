import { isApiConfigured } from "@/config/env";
import { apiClient, ApiClientError } from "@/lib/api-client";
import {
  masterProductCreateToJson,
  masterProductImagesAssociateToJson,
  type MasterProduct,
  type MasterProductCreatePayload,
  type MasterProductImageAssociateInput,
  type MasterProductListParams,
  type MasterProductListResponse,
} from "@/types/master-product";

const PRODUCTS_BASE = "/api/super-admin/master-products";
const SESSION_FETCH = { credentials: "include" as const };

export class MasterProductServiceError extends Error {
  readonly status?: number;

  constructor(message: string, options?: { status?: number }) {
    super(message);
    this.name = "MasterProductServiceError";
    this.status = options?.status;
  }
}

function mapApiError(error: unknown, fallback: string): MasterProductServiceError {
  if (error instanceof ApiClientError) {
    return new MasterProductServiceError(error.message || fallback, { status: error.status });
  }
  if (error instanceof Error) {
    return new MasterProductServiceError(error.message || fallback);
  }
  return new MasterProductServiceError(fallback);
}

function toQuery(params: MasterProductListParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.search?.trim()) search.set("search", params.search.trim());
  if (params.category_id?.trim()) search.set("category_id", params.category_id.trim());
  if (params.subcategory_id?.trim()) {
    search.set("subcategory_id", params.subcategory_id.trim());
  }
  if (params.is_active != null) search.set("is_active", params.is_active ? "true" : "false");
  if (params.is_featured != null) {
    search.set("is_featured", params.is_featured ? "true" : "false");
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function listMasterProducts(
  params: MasterProductListParams = {},
): Promise<MasterProductListResponse> {
  if (!isApiConfigured()) {
    throw new MasterProductServiceError(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
    );
  }
  try {
    return await apiClient.get<MasterProductListResponse>(
      `${PRODUCTS_BASE}${toQuery(params)}`,
      SESSION_FETCH,
    );
  } catch (error) {
    throw mapApiError(error, "Unable to load products.");
  }
}

export async function createMasterProduct(
  input: MasterProductCreatePayload,
): Promise<MasterProduct> {
  if (!isApiConfigured()) {
    throw new MasterProductServiceError(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
    );
  }
  try {
    return await apiClient.post<MasterProduct>(
      PRODUCTS_BASE,
      masterProductCreateToJson(input),
      SESSION_FETCH,
    );
  } catch (error) {
    throw mapApiError(error, "Unable to create product.");
  }
}

export async function associateMasterProductImages(
  productId: string,
  images: MasterProductImageAssociateInput[],
): Promise<void> {
  if (!isApiConfigured()) {
    throw new MasterProductServiceError(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
    );
  }
  const id = productId.trim();
  if (!id) {
    throw new MasterProductServiceError("Product id is required.");
  }
  try {
    await apiClient.post(
      `${PRODUCTS_BASE}/${encodeURIComponent(id)}/images`,
      masterProductImagesAssociateToJson(images),
      SESSION_FETCH,
    );
  } catch (error) {
    throw mapApiError(error, "Unable to attach product images.");
  }
}