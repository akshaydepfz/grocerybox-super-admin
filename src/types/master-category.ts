import type { PaginationMeta } from "@/types/merchant";

export type MasterCategory = {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MasterCategoryListResponse = {
  items: MasterCategory[];
  pagination: PaginationMeta;
};

export type MasterCategoryListParams = {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
};

export type MasterCategoryCreateInput = {
  name: string;
  image_url?: string | null;
  display_order?: number;
  is_active?: boolean;
};