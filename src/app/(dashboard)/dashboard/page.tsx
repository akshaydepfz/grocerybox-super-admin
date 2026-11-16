"use client";

import { LogOut, Sparkles } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { email, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-forest-975 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-forest-800/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-lime-400/15 ring-1 ring-lime-400/30">
              <span className="text-lg font-bold text-lime-300">GB</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-forest-400">
                GroceryBox
              </p>
              <h1 className="text-2xl font-semibold text-white">Super Admin Dashboard</h1>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void signOut()}
            className="w-full sm:w-auto"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
        </header>

        <section className="rounded-3xl border border-forest-800/80 bg-gradient-to-br from-forest-900/70 to-forest-950/80 p-6 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-200">
            <Sparkles className="size-3.5" aria-hidden />
            Foundation ready
          </div>
          <p className="text-sm text-forest-200 sm:text-base">
            {email ? (
              <>
                Welcome back, <span className="font-medium text-white">{email}</span>.
              </>
            ) : (
              "Welcome back."
            )}{" "}
            This dashboard will host merchants, subscriptions, billing, transactions,
            analytics, and platform configuration modules in upcoming releases.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          {PLACEHOLDER_MODULES.map((module) => (
            <article
              key={module.title}
              className="rounded-2xl border border-dashed border-forest-700/80 bg-forest-900/25 p-5"
            >
              <h2 className="text-sm font-semibold text-white">{module.title}</h2>
              <p className="mt-2 text-sm text-forest-300">{module.description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

const PLACEHOLDER_MODULES = [
  {
    title: "Merchants & approvals",
    description: "Review onboarding, storefront status, and merchant operations.",
  },
  {
    title: "Subscriptions & billing",
    description: "Plan management, renewals, and payment oversight.",
  },
  {
    title: "Orders & activity",
    description: "Platform-wide orders, transactions, and audit visibility.",
  },
  {
    title: "Analytics & settings",
    description: "KPIs, admin users, permissions, and system configuration.",
  },
] as const;