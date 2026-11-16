"use client";

import { Plus, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useReducer, useState } from "react";

import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { Button } from "@/components/ui/Button";
import { listMasterProducts, MasterProductServiceError } from "@/services/master-product-service";
import type { MasterProduct } from "@/types/master-product";
import { cn } from "@/utils/cn";

const selectClassName =
  "h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 text-sm text-zinc-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15";

type ListState = {
  items: MasterProduct[];
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
  error: string | null;
};

type ListAction =
  | { type: "load_start" }
  | { type: "load_success"; items: MasterProduct[]; total: number; totalPages: number }
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
      return { ...state, loading: false, items: action.items, total: action.total, totalPages: action.totalPages };
    case "load_error":
      return { ...state, loading: false, error: action.message, items: [] };
    case "set_page":
      return { ...state, page: action.page };
    default:
      return state;
  }
}

export function ProductsList() {
  const [listState, dispatch] = useReducer(listReducer, initialListState);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

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
        const data = await listMasterProducts({ page: listState.page, limit: 20, search: search || undefined });
        if (cancelled) return;
        dispatch({
          type: "load_success",
          items: data.items,
          total: data.pagination.total,
          totalPages: data.pagination.total_pages,
        });
      } catch (err) {
        if (cancelled) return;
        dispatch({
          type: "load_error",
          message: err instanceof MasterProductServiceError ? err.message : "Unable to load products.",
        });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [listState.page, refreshNonce, search]);

  const { items, page, total, totalPages, loading, error } = listState;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-700">Master catalog</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Products</h2>
          <p className="text-sm text-zinc-600">Master catalogue products for the platform.</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button type="button">
            <Plus className="size-4" aria-hidden />
            Add product
          </Button>
        </Link>
      </header>

      <WidgetCard
        title="Product list"
        description={loading ? "Loading…" : `${total.toLocaleString()} total products`}
        action={
          <Button type="button" variant="secondary" size="sm" onClick={() => setRefreshNonce((v) => v + 1)} loading={loading}>
            <RefreshCw className="size-3.5" aria-hidden />
            Refresh
          </Button>
        }
        padding="none"
      >
        <div className="border-b border-zinc-100 p-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-600">Search</span>
            <span className="relative flex">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" aria-hidden />
              <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Name, SKU, brand…" className={cn(selectClassName, "pl-9")} />
            </span>
          </label>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-zinc-500">Loading products…</td></tr>
              ) : null}
              {!loading && items.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-zinc-500">No products found.</td></tr>
              ) : null}
              {items.map((product) => (
                <tr key={product.id} className="border-b border-zinc-100 hover:bg-zinc-50/70">
                  <td className="px-5 py-4 font-medium text-zinc-900">{product.name}</td>
                  <td className="px-4 py-4 text-zinc-600">{product.category_name ?? "—"}</td>
                  <td className="px-4 py-4 text-zinc-600">₹{product.selling_price}</td>
                  <td className="px-4 py-4 text-zinc-600">{product.stock_quantity}</td>
                  <td className="px-4 py-4">{product.is_active ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-zinc-100 px-5 py-4 text-sm text-zinc-600">
          Page {page}
          {totalPages > 0 ? ` of ${totalPages}` : ""}
        </div>
      </WidgetCard>
    </div>
  );
}