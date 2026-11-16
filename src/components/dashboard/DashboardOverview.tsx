"use client";

import {
  ArrowUpRight,
  CircleCheck,
  Package,
  ShoppingBag,
  Store,
  TrendingUp,
  Zap,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { Button } from "@/components/ui/Button";

const weeklyBars = [42, 58, 45, 72, 68, 81, 76];

const recentActivity = [
  { title: "New merchant registered", meta: "Spice Route Mart · 2h ago", tone: "brand" as const },
  { title: "Subscription upgraded", meta: "Green Valley · Growth plan · 5h ago", tone: "sky" as const },
  { title: "Store published", meta: "Daily Fresh · Mumbai · Yesterday", tone: "brand" as const },
  { title: "Payout review queued", meta: "3 merchants · Yesterday", tone: "amber" as const },
];

const quickActions = [
  { label: "Review onboarding", detail: "4 pending", icon: Store },
  { label: "Master catalog", detail: "Manage products", icon: Package },
  { label: "Platform health", detail: "All green", icon: CircleCheck },
  { label: "Growth insights", detail: "Weekly report", icon: TrendingUp },
];

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-brand-200/60 bg-gradient-to-br from-brand-50 via-white to-zinc-50 p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-2">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-800">
              <Zap className="size-3.5" aria-hidden />
              Platform pulse
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Your control center for GroceryBox
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              Monitor merchants, subscriptions, and catalog health. Figures below are sample
              previews—live metrics will connect as modules ship.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" className="shadow-md shadow-brand-600/15">
              Export summary
            </Button>
            <Button type="button" variant="secondary" size="sm">
              View release notes
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active merchants"
          value="128"
          hint="+6 new this week"
          icon={Store}
          accent="brand"
          trend={{ direction: "up", label: "+4.8%" }}
        />
        <StatCard
          label="Orders today"
          value="1,842"
          hint="Across all storefronts"
          icon={ShoppingBag}
          accent="sky"
          trend={{ direction: "up", label: "+12%" }}
        />
        <StatCard
          label="MRR"
          value="₹4.2L"
          hint="Subscription revenue"
          icon={TrendingUp}
          accent="violet"
          trend={{ direction: "neutral", label: "Stable" }}
        />
        <StatCard
          label="Pending reviews"
          value="7"
          hint="Onboarding & payouts"
          icon={Package}
          accent="amber"
          trend={{ direction: "down", label: "-2" }}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <WidgetCard
          title="Order volume"
          description="Last 7 days · sample data"
          className="lg:col-span-2"
          action={
            <span className="text-xs font-medium text-brand-700">+18% vs prior week</span>
          }
        >
          <div className="flex h-44 items-end gap-2 sm:gap-3">
            {weeklyBars.map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 shadow-sm shadow-brand-600/20 transition-transform hover:scale-y-105"
                  style={{ height: `${height}%` }}
                  role="presentation"
                />
                <span className="text-[10px] font-medium text-zinc-400">
                  {["M", "T", "W", "T", "F", "S", "S"][index]}
                </span>
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="System status" description="Infrastructure snapshot">
          <ul className="space-y-3">
            {[
              { label: "API", status: "Operational" },
              { label: "Database", status: "Operational" },
              { label: "Payments", status: "Operational" },
              { label: "Notifications", status: "Degraded" },
            ].map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5 text-sm"
              >
                <span className="font-medium text-zinc-700">{row.label}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                  <span
                    className={`size-2 rounded-full ${
                      row.status === "Operational" ? "bg-emerald-500" : "bg-amber-400"
                    }`}
                    aria-hidden
                  />
                  {row.status}
                </span>
              </li>
            ))}
          </ul>
        </WidgetCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <WidgetCard title="Recent activity" className="lg:col-span-3">
          <ul className="divide-y divide-zinc-100">
            {recentActivity.map((item) => (
              <li key={item.title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    item.tone === "brand"
                      ? "bg-brand-500"
                      : item.tone === "sky"
                        ? "bg-sky-500"
                        : "bg-amber-400"
                  }`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900">{item.title}</p>
                  <p className="text-xs text-zinc-500">{item.meta}</p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-zinc-300" aria-hidden />
              </li>
            ))}
          </ul>
        </WidgetCard>

        <WidgetCard title="Quick actions" className="lg:col-span-2">
          <QuickActionGrid />
        </WidgetCard>
      </section>
    </div>
  );
}

function QuickActionGrid() {
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <li key={action.label}>
            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-colors hover:border-zinc-200 hover:bg-zinc-50"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-700">
                <Icon className="size-[1.125rem]" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-zinc-900">{action.label}</span>
                <span className="block text-xs text-zinc-500">{action.detail}</span>
              </span>
              <ArrowUpRight
                className="size-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600"
                aria-hidden
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}