"use client";

import { ChevronLeft, ChevronRight, ImageIcon, Plus, RefreshCw, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useReducer, useState } from "react";

import { AddCategorySlideOver } from "@/components/categories/AddCategorySlideOver";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { Button } from "@/components/ui/Button";
import {
  listMasterCategories,
  MasterCategoryServiceError,
} from "@/services/master-category-service";
import type { MasterCategory } from "@/types/master-category";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/utils/cn";

const selectClassName =
  "h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 text-sm text-zinc-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15";

type ListState = {
  items: MasterCategory[];
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
      items: MasterCategory[];
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

function CategoryListAvatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string;
}) {
  const url = imageUrl?.trim();
  if (url) {
    return (
      <div className="relative size-11 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <Image src={url} alt="" fill className="object-cover" sizes="44px" unoptimized />
      </div>
    );
  }
  return (
    <div
      className="flex size-11 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400"
      title={name}
    >
      <ImageIcon className="size-5" aria-hidden />
    </div>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        active ? "bg-emerald-50 text-emerald-800" : "bg-zinc-100 text-zinc-600",
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function CategoriesList() {
  const [listState, dispatch] = useReducer(listReducer, initialListState);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [addOpen, setAddOpen] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");

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
        const data = await listMasterCategories({
          page: listState.page,
          limit: 20,
          search: search || undefined,
          is_active:
            activeFilter === "" ? undefined : activeFilter === "true",
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
          err instanceof MasterCategoryServiceError
            ? err.message
            : "Unable to load categories.";
        dispatch({ type: "load_error", message });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [activeFilter, listState.page, refreshNonce, search]);

  const goToPage = (next: number) => {
    if (next < 1 || (listState.totalPages > 0 && next > listState.totalPages)) {
      return;
    }
    dispatch({ type: "set_page", page: next });
  };

  const { items, page, total, totalPages, loading, error } = listState;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-700">
            Master catalog
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Categories</h2>
          <p className="text-sm text-zinc-600">
            Manage master catalogue categories used across the platform.
          </p>
        </div>
        <Button type="button" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Add category
        </Button>
      </header>

      <WidgetCard
        title="Category list"
        description={loading ? "Loading…" : `${total.toLocaleString()} total categories`}
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
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
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
                  placeholder="Name or slug…"
                  className={cn(selectClassName, "pl-9")}
                />
              </span>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-zinc-600">Status</span>
              <select
                value={activeFilter}
                onChange={(event) => {
                  setActiveFilter(event.target.value as "" | "true" | "false");
                  dispatch({ type: "set_page", page: 1 });
                }}
                className={selectClassName}
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </div>

          {error ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-5 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="hidden px-4 py-3 sm:table-cell">Slug</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    Loading categories…
                  </td>
                </tr>
              ) : null}

              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    No categories match your filters.
                  </td>
                </tr>
              ) : null}

              {items.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-zinc-100 transition-colors hover:bg-zinc-50/70"
                >
                  <td className="px-5 py-4">
                    <CategoryListAvatar name={category.name} imageUrl={category.image_url} />
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-zinc-900">{category.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-zinc-500 sm:hidden">
                      /{category.slug}
                    </p>
                  </td>
                  <td className="hidden px-4 py-4 font-mono text-xs text-zinc-600 sm:table-cell">
                    /{category.slug}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">{category.display_order}</td>
                  <td className="px-4 py-4">
                    <ActiveBadge active={category.is_active} />
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    {formatDateTime(category.created_at)}
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

      <AddCategorySlideOver
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => setRefreshNonce((value) => value + 1)}
      />
    </div>
  );
}