"use client";

import { Bell, Menu, Search } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

type TopBarProps = {
  onOpenMenu: () => void;
  menuOpen: boolean;
  sidebarCollapsed: boolean;
};

export function TopBar({ onOpenMenu, menuOpen, sidebarCollapsed }: TopBarProps) {
  const { admin, email } = useAuth();
  const greeting = admin?.name?.split(/\s+/)[0] ?? "there";

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onOpenMenu}
          aria-controls="dashboard-sidebar"
          aria-expanded={menuOpen}
        >
          <Menu className="size-5" aria-hidden />
          <span className="sr-only">Open menu</span>
        </Button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-zinc-500">Welcome back</p>
          <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
            {greeting === "there" ? "Dashboard" : `Hi, ${greeting}`}
          </h1>
        </div>

        <DashboardSearchInput className="hidden max-w-xs flex-1 md:flex" />

        <button
          type="button"
          className="relative rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-500 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-800"
          aria-label="Notifications"
        >
          <Bell className="size-[1.125rem]" aria-hidden />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>

        <div
          className={cn(
            "hidden items-center gap-2 rounded-xl border border-zinc-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm sm:flex",
            sidebarCollapsed && "lg:hidden xl:flex",
          )}
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-xs font-semibold text-brand-800">
            {(admin?.name?.[0] ?? email?.[0] ?? "A").toUpperCase()}
          </div>
          <TopBarUserMeta email={email} role={admin?.role} />
        </div>
      </div>

      <DashboardSearchInput className="mt-3 md:hidden" />
    </header>
  );
}

function DashboardSearchInput({ className }: { className?: string }) {
  return (
    <label className={cn("relative block", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
        aria-hidden
      />
      <input
        type="search"
        placeholder="Search merchants, orders…"
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15"
      />
    </label>
  );
}

function TopBarUserMeta({ email, role }: { email: string | null; role?: string }) {
  return (
    <div className="hidden min-w-0 sm:block">
      <p className="truncate text-xs font-medium text-zinc-900">{email}</p>
      <p className="truncate text-[10px] uppercase tracking-wide text-zinc-500">
        {role?.replace(/_/g, " ") ?? "super admin"}
      </p>
    </div>
  );
}