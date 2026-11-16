import type { PaginationMeta } from "@/types/merchant";

export type MasterProductUnit =
  | "kg"
  | "g"
  | "litre"
  | "ml"
  | "piece"
  | "pack"
  | "dozen"
  | "box";

export type MasterProductImage = {
  id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
};

export type MasterProduct = {
  id: string;
  category_id: string;
  category_name?: string;
  subcategory_id?: string | null;
  subcategory_name?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  selling_price: number;
  mrp?: number | null;
  unit_value: number;
  unit: MasterProductUnit;
  stock_quantity: number;
  sku?: string | null;
  barcode?: string | null;
  brand?: string | null;
  tax_percentage?: number | null;
  min_order_quantity?: number | null;
  max_order_quantity?: number | null;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images?: MasterProductImage[];
  primary_image?: MasterProductImage | null;
};

export type MasterProductListResponse = {
  items: MasterProduct[];
  pagination: PaginationMeta;
};

export type MasterProductListParams = {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  subcategory_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
};

export type MasterProductCreatePayload = {
  name: string;
  categoryId: string;
  subcategoryId?: string;
  description?: string;
  sellingPrice: number;
  mrp?: number;
  unit: MasterProductUnit;
  unitValue: number;
  stockQuantity: number;
  sku?: string;
  barcode?: string;
  brand?: string;
  taxPercentage?: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  isFeatured: boolean;
  displayOrder: number;
  isActive: boolean;
};

export type MasterProductImageAssociateInput = {
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
};

export function masterProductCreateToJson(
  input: MasterProductCreatePayload,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: input.name.trim(),
    category_id: input.categoryId.trim(),
    selling_price: input.sellingPrice,
    unit: input.unit,
    unit_value: input.unitValue,
    stock_quantity: input.stockQuantity,
    display_order: input.displayOrder,
    is_featured: input.isFeatured,
    is_active: input.isActive,
  };

  if (input.subcategoryId?.trim()) {
    body.subcategory_id = input.subcategoryId.trim();
  }
  if (input.description?.trim()) {
    body.description = input.description.trim();
  }
  if (input.mrp != null && Number.isFinite(input.mrp)) {
    body.mrp = input.mrp;
  }
  if (input.sku?.trim()) {
    body.sku = input.sku.trim();
  }
  if (input.barcode?.trim()) {
    body.barcode = input.barcode.trim();
  }
  if (input.brand?.trim()) {
    body.brand = input.brand.trim();
  }
  if (input.taxPercentage != null && Number.isFinite(input.taxPercentage)) {
    body.tax_percentage = input.taxPercentage;
  }
  if (input.minOrderQuantity != null && Number.isFinite(input.minOrderQuantity)) {
    body.min_order_quantity = input.minOrderQuantity;
  }
  if (input.maxOrderQuantity != null && Number.isFinite(input.maxOrderQuantity)) {
    body.max_order_quantity = input.maxOrderQuantity;
  }

  return body;
}

export function masterProductImagesAssociateToJson(
  images: MasterProductImageAssociateInput[],
): Record<string, unknown> {
  return {
    images: images.map((image) => ({
      image_url: image.imageUrl,
      display_order: image.displayOrder,
      is_primary: image.isPrimary,
    })),
  };
}

/** Camel-case view for form prefill (e.g. edit). */
export type MasterProductFormSource = {
  id: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  categoryId: string;
  subcategoryId?: string | null;
  sellingPrice: number;
  mrp?: number | null;
  unit: MasterProductUnit;
  unitValue: number;
  stockQuantity: number;
  sku?: string | null;
  barcode?: string | null;
  taxPercentage?: number | null;
  minOrderQuantity?: number | null;
  maxOrderQuantity?: number | null;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
};

export function masterProductToFormSource(product: MasterProduct): MasterProductFormSource {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    description: product.description,
    categoryId: product.category_id,
    subcategoryId: product.subcategory_id,
    sellingPrice: product.selling_price,
    mrp: product.mrp,
    unit: product.unit,
    unitValue: product.unit_value,
    stockQuantity: product.stock_quantity,
    sku: product.sku,
    barcode: product.barcode,
    taxPercentage: product.tax_percentage,
    minOrderQuantity: product.min_order_quantity,
    maxOrderQuantity: product.max_order_quantity,
    displayOrder: product.display_order,
    isFeatured: product.is_featured,
    isActive: product.is_active,
  };
}