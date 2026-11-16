"use client";

import { Leaf, PanelLeftClose, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/Button";
import { dashboardNavItems } from "@/components/dashboard/nav-config";
import { cn } from "@/utils/cn";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

function initials(name: string | undefined, email: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email?.[0] ?? "?").toUpperCase();
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { admin, email, signOut } = useAuth();
  const displayName = admin?.name ?? "Super Admin";

  return (
    <>
      <h2 id="dashboard-sidebar-title" className="sr-only">
        Main navigation
      </h2>
      <SidebarBackdrop open={open} onClose={onClose} />

      <aside
        id="dashboard-sidebar"
        aria-labelledby="dashboard-sidebar-title"
        className={cn(
          "dashboard-sidebar fixed inset-y-0 left-0 z-40 flex w-[min(100vw-3rem,17.5rem)] flex-col border-r border-zinc-200/80 bg-white/95 shadow-xl shadow-zinc-900/10 backdrop-blur-md transition-[transform,width] duration-300 ease-out lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-auto lg:translate-x-0 lg:border-zinc-200/80",
          collapsed ? "lg:w-[4.5rem]" : "lg:w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center gap-3 border-b border-zinc-100 px-4",
            collapsed && "lg:justify-center lg:px-2",
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/20">
            <Leaf className="size-[18px]" strokeWidth={2.25} aria-hidden />
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">GroceryBox</p>
              <p className="text-[11px] font-medium text-brand-700">Super Admin</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 lg:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeftClose
              className={cn("size-5 transition-transform", collapsed && "rotate-180")}
            />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
          <ul className="space-y-1">
            {dashboardNavItems.map((item) => {
              const active =
                !item.disabled &&
                (item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`));
              const Icon = item.icon;

              if (item.disabled) {
                return (
                  <li key={item.label}>
                    <span
                      className={cn(
                        "flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400",
                        collapsed && "lg:justify-center lg:px-2",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="size-[1.125rem] shrink-0 opacity-60" aria-hidden />
                      {!collapsed ? (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge ? (
                            <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-50 text-brand-800 shadow-sm shadow-brand-600/5"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                      collapsed && "lg:justify-center lg:px-2",
                    )}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon
                      className={cn("size-[1.125rem] shrink-0", active && "text-brand-700")}
                      aria-hidden
                    />
                    {!collapsed ? <span>{item.label}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={cn(
            "border-t border-zinc-100 p-3",
            collapsed && "lg:flex lg:flex-col lg:items-center",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2.5",
              collapsed && "lg:justify-center lg:px-2",
            )}
          >
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs font-semibold text-white"
              aria-hidden
            >
              {initials(admin?.name, email)}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900">{displayName}</p>
                <p className="truncate text-xs text-zinc-500">{email}</p>
              </div>
            ) : null}
          </div>
          {!collapsed ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start text-zinc-600"
              onClick={() => void signOut()}
            >
              Sign out
            </Button>
          ) : null}
        </div>
      </aside>
    </>
  );
}

function SidebarBackdrop({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) {
    return null;
  }
  return (
    <button
      type="button"
      className="fixed inset-0 z-30 bg-zinc-900/40 backdrop-blur-[1px] transition-opacity lg:hidden"
      onClick={onClose}
      aria-label="Close navigation"
    />
  );
}