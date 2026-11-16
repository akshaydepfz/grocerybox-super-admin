"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useReducer, useState } from "react";

import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { DetailKeyValueGrid } from "@/components/merchants/DetailKeyValueGrid";
import {
  accountStatusTone,
  MerchantStatusBadge,
  onboardingStatusTone,
} from "@/components/merchants/MerchantStatusBadge";
import { Button } from "@/components/ui/Button";
import {
  getSuperAdminMerchant,
  MerchantServiceError,
} from "@/services/merchant-service";
import type { MerchantDetailResponse } from "@/types/merchant";
import { formatDateTime } from "@/utils/format";

type MerchantDetailProps = {
  merchantId: string;
};

type DetailState = {
  merchant: MerchantDetailResponse | null;
  loading: boolean;
  error: string | null;
};

type DetailAction =
  | { type: "load_start" }
  | { type: "load_success"; merchant: MerchantDetailResponse }
  | { type: "load_error"; message: string };

const initialDetailState: DetailState = {
  merchant: null,
  loading: true,
  error: null,
};

function detailReducer(state: DetailState, action: DetailAction): DetailState {
  switch (action.type) {
    case "load_start":
      return { ...state, loading: true, error: null };
    case "load_success":
      return { merchant: action.merchant, loading: false, error: null };
    case "load_error":
      return { merchant: null, loading: false, error: action.message };
    default:
      return state;
  }
}

export function MerchantDetail({ merchantId }: MerchantDetailProps) {
  const [state, dispatch] = useReducer(detailReducer, initialDetailState);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      dispatch({ type: "load_start" });
      try {
        const data = await getSuperAdminMerchant(merchantId);
        if (cancelled) {
          return;
        }
        dispatch({ type: "load_success", merchant: data });
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message =
          err instanceof MerchantServiceError
            ? err.message
            : "Unable to load merchant details.";
        dispatch({ type: "load_error", message });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [merchantId, refreshNonce]);

  const { merchant, loading, error } = state;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/merchants"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to merchants
        </Link>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setRefreshNonce((value) => value + 1)}
          loading={loading}
        >
          <RefreshCw className="size-3.5" aria-hidden />
          Refresh
        </Button>
      </div>

      {loading && !merchant ? (
        <p className="text-sm text-zinc-500">Loading merchant details…</p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {merchant ? (
        <>
          <MerchantDetailHeader merchant={merchant} />

          <div className="grid gap-6 xl:grid-cols-2">
            <WidgetCard title="Account" description="Firebase-linked merchant account">
              <DetailKeyValueGrid
                data={{
                  merchant_id: merchant.account.merchant_id,
                  firebase_uid: merchant.account.firebase_uid,
                  email: merchant.account.email,
                  full_name: merchant.account.full_name,
                  phone: merchant.account.phone,
                  email_verified: merchant.account.email_verified,
                  account_status: merchant.account.account_status,
                  onboarding_status: merchant.account.onboarding_status,
                  profile_image_url: merchant.account.profile_image_url,
                  created_at: formatDateTime(merchant.account.created_at),
                  updated_at: formatDateTime(merchant.account.updated_at),
                }}
              />
            </WidgetCard>

            <WidgetCard title="Platform snapshot" description="Store publication and subscription">
              <DetailKeyValueGrid
                data={{
                  store_published: merchant.store_published,
                  published_at: formatDateTime(merchant.published_at),
                  store_id: merchant.store_id,
                  business_id: merchant.business_id,
                  onboarding_status: merchant.onboarding_status,
                }}
              />
            </WidgetCard>

            <WidgetCard title="Business">
              <DetailKeyValueGrid data={merchant.business} />
            </WidgetCard>

            <WidgetCard title="Store identity">
              <DetailKeyValueGrid data={merchant.store} />
            </WidgetCard>

            <WidgetCard title="Branding">
              <DetailKeyValueGrid data={merchant.branding} />
            </WidgetCard>

            <WidgetCard title="Location">
              <DetailKeyValueGrid data={merchant.location} />
            </WidgetCard>

            <WidgetCard title="Configuration">
              <DetailKeyValueGrid data={merchant.config} />
            </WidgetCard>

            <WidgetCard title="Subscription">
              <DetailKeyValueGrid data={merchant.subscription} />
            </WidgetCard>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MerchantDetailHeader({ merchant }: { merchant: MerchantDetailResponse }) {
  const name = merchant.account.full_name || "Merchant";
  const subtitle =
    merchant.store && typeof merchant.store === "object" && "store_name" in merchant.store
      ? String(merchant.store.store_name ?? "")
      : "";

  return (
    <header className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-700">Merchant detail</p>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">{name}</h2>
      {subtitle ? <p className="text-sm text-zinc-600">{subtitle}</p> : null}
      <div className="flex flex-wrap gap-2">
        <MerchantStatusBadge
          label={merchant.account.account_status}
          tone={accountStatusTone(merchant.account.account_status)}
        />
        <MerchantStatusBadge
          label={merchant.onboarding_status}
          tone={onboardingStatusTone(merchant.onboarding_status)}
        />
        {merchant.store_published ? (
          <MerchantStatusBadge label="store published" tone="success" />
        ) : (
          <MerchantStatusBadge label="store not published" tone="warning" />
        )}
      </div>
    </header>
  );
}