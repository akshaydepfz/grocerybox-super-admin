"use client";

import { ChevronLeft, ChevronRight, Eye, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useReducer, useState } from "react";

import { WidgetCard } from "@/components/dashboard/WidgetCard";
import {
  accountStatusTone,
  MerchantStatusBadge,
  onboardingStatusTone,
} from "@/components/merchants/MerchantStatusBadge";
import { Button } from "@/components/ui/Button";
import {
  listSuperAdminMerchants,
  MerchantServiceError,
} from "@/services/merchant-service";
import type { SuperAdminMerchantListItem } from "@/types/merchant";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/utils/cn";

const ONBOARDING_FILTERS = [
  "account_registered",
  "business_completed",
  "store_completed",
  "branding_completed",
  "location_completed",
  "config_completed",
  "plan_selected",
  "published",
] as const;

const selectClassName =
  "h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 text-sm text-zinc-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15";

type ListState = {
  items: SuperAdminMerchantListItem[];
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
  error: string | null;
};

type ListAction =
  | { type: "load_start" }
  | {
      type: "load_success";
      items: SuperAdminMerchantListItem[];
      total: number;
      totalPages: number;
    }
  | { type: "load_error"; message: string }
  | { type: "set_page"; page: number };

const initialListState: ListState = {
  items: [],
  page: 1,
  totalPages: 0,
  total: 0,
  loading: true,
  error: null,
};

function listReducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case "load_start":
      return { ...state, loading: true, error: null };
    case "load_success":
      return {
        ...state,
        loading: false,
        items: action.items,
        total: action.total,
        totalPages: action.totalPages,
      };
    case "load_error":
      return { ...state, loading: false, error: action.message, items: [] };
    case "set_page":
      return { ...state, page: action.page };
    default:
      return state;
  }
}

export function MerchantsList() {
  const [listState, dispatch] = useReducer(listReducer, initialListState);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [accountStatus, setAccountStatus] = useState<"" | "active" | "disabled">("");
  const [onboardingStatus, setOnboardingStatus] = useState("");
  const [storePublished, setStorePublished] = useState<"" | "true" | "false">("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      dispatch({ type: "set_page", page: 1 });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      dispatch({ type: "load_start" });
      try {
        const data = await listSuperAdminMerchants({
          page: listState.page,
          limit: 20,
          search: search || undefined,
          account_status: accountStatus || undefined,
          onboarding_status: onboardingStatus || undefined,
          store_published:
            storePublished === "" ? undefined : storePublished === "true",
        });
        if (cancelled) {
          return;
        }
        dispatch({
          type: "load_success",
          items: data.items,
          total: data.pagination.total,
          totalPages: data.pagination.total_pages,
        });
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message =
          err instanceof MerchantServiceError
            ? err.message
            : "Unable to load merchants.";
        dispatch({ type: "load_error", message });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    accountStatus,
    listState.page,
    onboardingStatus,
    refreshNonce,
    search,
    storePublished,
  ]);

  const goToPage = (next: number) => {
    if (next < 1 || (listState.totalPages > 0 && next > listState.totalPages)) {
      return;
    }
    dispatch({ type: "set_page", page: next });
  };

  const { items, page, total, totalPages, loading, error } = listState;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-700">Merchants</p>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">All merchants</h2>
        <p className="text-sm text-zinc-600">
          Search, filter, and open a merchant to review their full onboarding profile.
        </p>
      </header>

      <WidgetCard
        title="Merchant directory"
        description={loading ? "Loading…" : `${total.toLocaleString()} total merchants`}
        action={
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
        }
        padding="none"
      >
        <div className="space-y-4 border-b border-zinc-100 p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-zinc-600">Search</span>
              <span className="relative flex">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Name, email, phone, store, subdomain…"
                  className={cn(selectClassName, "pl-9")}
                />
              </span>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-zinc-600">Account status</span>
              <select
                value={accountStatus}
                onChange={(event) => {
                  setAccountStatus(event.target.value as "" | "active" | "disabled");
                  dispatch({ type: "set_page", page: 1 });
                }}
                className={selectClassName}
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-zinc-600">Onboarding</span>
              <select
                value={onboardingStatus}
                onChange={(event) => {
                  setOnboardingStatus(event.target.value);
                  dispatch({ type: "set_page", page: 1 });
                }}
                className={selectClassName}
              >
                <option value="">All stages</option>
                {ONBOARDING_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-zinc-600">Store published</span>
              <select
                value={storePublished}
                onChange={(event) => {
                  setStorePublished(event.target.value as "" | "true" | "false");
                  dispatch({ type: "set_page", page: 1 });
                }}
                className={selectClassName}
              >
                <option value="">Any</option>
                <option value="true">Published</option>
                <option value="false">Not published</option>
              </select>
            </label>
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-5 py-3">Merchant</th>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Onboarding</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    Loading merchants…
                  </td>
                </tr>
              ) : null}

              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    No merchants match your filters.
                  </td>
                </tr>
              ) : null}

              {items.map((merchant) => (
                <tr
                  key={merchant.merchant_id}
                  className="border-b border-zinc-100 transition-colors hover:bg-zinc-50/70"
                >
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      <p className="font-medium text-zinc-900">{merchant.full_name}</p>
                      <p className="text-xs text-zinc-500">{merchant.email || "No email"}</p>
                      {merchant.phone ? (
                        <p className="text-xs text-zinc-500">{merchant.phone}</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {merchant.store_name ? (
                      <div className="space-y-0.5">
                        <p className="font-medium text-zinc-800">{merchant.store_name}</p>
                        {merchant.subdomain ? (
                          <p className="text-xs text-zinc-500">{merchant.subdomain}</p>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <MerchantStatusBadge
                        label={merchant.account_status}
                        tone={accountStatusTone(merchant.account_status)}
                      />
                      {merchant.store_published ? (
                        <MerchantStatusBadge label="published" tone="success" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <MerchantStatusBadge
                      label={merchant.onboarding_status}
                      tone={onboardingStatusTone(merchant.onboarding_status)}
                    />
                  </td>
                  <td className="px-4 py-4 text-zinc-600">{formatDateTime(merchant.created_at)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/merchants/${merchant.merchant_id}`}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                    >
                      <Eye className="size-4" aria-hidden />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600">
            Page {page}
            {totalPages > 0 ? ` of ${totalPages}` : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={loading || page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={loading || (totalPages > 0 && page >= totalPages)}
              onClick={() => goToPage(page + 1)}
            >
              Next
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </WidgetCard>
    </div>
  );
}