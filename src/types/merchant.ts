export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export type SuperAdminMerchantListItem = {
  merchant_id: string;
  email?: string;
  full_name: string;
  phone?: string;
  account_status: string;
  onboarding_status: string;
  store_id?: string;
  store_name?: string;
  subdomain?: string;
  store_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
};

export type SuperAdminMerchantListResponse = {
  items: SuperAdminMerchantListItem[];
  pagination: PaginationMeta;
};

export type MerchantAccountProfile = {
  merchant_id: string;
  firebase_uid: string;
  email?: string;
  full_name: string;
  profile_image_url?: string;
  email_verified: boolean;
  phone?: string;
  account_status: string;
  onboarding_status: string;
  created_at: string;
  updated_at: string;
};

export type MerchantDetailResponse = {
  merchant_id: string;
  business_id?: string;
  store_id?: string;
  onboarding_status: string;
  store_published: boolean;
  published_at?: string;
  account: MerchantAccountProfile;
  business?: Record<string, unknown>;
  store?: Record<string, unknown>;
  branding?: Record<string, unknown>;
  location?: Record<string, unknown>;
  config?: Record<string, unknown>;
  subscription?: Record<string, unknown>;
};

export type SuperAdminMerchantListParams = {
  page?: number;
  limit?: number;
  search?: string;
  account_status?: "active" | "disabled";
  onboarding_status?: string;
  store_published?: boolean;
};