"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { cn } from "@/utils/cn";

const SIDEBAR_COLLAPSE_KEY = "gb-super-admin-sidebar-collapsed";

type DashboardShellProps = {
  children: ReactNode;
};

function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readSidebarCollapsed);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [mobileOpen]);

  return (
    <div className="dashboard-shell flex min-h-screen bg-zinc-50/90 text-zinc-900">
      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar
          onOpenMenu={() => setMobileOpen(true)}
          menuOpen={mobileOpen}
          sidebarCollapsed={collapsed}
        />
        <main
          className={cn(
            "flex-1 px-4 py-6 sm:px-6 sm:py-8",
            "max-w-[1600px] w-full mx-auto",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}