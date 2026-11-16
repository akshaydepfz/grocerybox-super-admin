import type { LucideIcon } from "lucide-react";

import { cn } from "@/utils/cn";

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  trend?: { direction: "up" | "down" | "neutral"; label: string };
  accent?: "brand" | "sky" | "amber" | "violet";
};

const accentStyles = {
  brand: "from-brand-500/15 to-brand-600/5 text-brand-700",
  sky: "from-sky-500/15 to-sky-600/5 text-sky-700",
  amber: "from-amber-500/15 to-amber-600/5 text-amber-800",
  violet: "from-violet-500/15 to-violet-600/5 text-violet-700",
};

const trendStyles = {
  up: "text-emerald-700 bg-emerald-50 border-emerald-100",
  down: "text-rose-700 bg-rose-50 border-rose-100",
  neutral: "text-zinc-600 bg-zinc-50 border-zinc-100",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  accent = "brand",
}: StatCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm shadow-zinc-900/5 transition-shadow hover:shadow-md hover:shadow-zinc-900/8">
      <div
        className={cn(
          "absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br opacity-80 blur-2xl transition-opacity group-hover:opacity-100",
          accentStyles[accent],
        )}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br",
            accentStyles[accent],
          )}
        >
          <Icon className="size-5" strokeWidth={2} aria-hidden />
        </div>
        {trend ? (
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              trendStyles[trend.direction],
            )}
          >
            {trend.label}
          </span>
        ) : null}
      </div>
      <p className="relative mt-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="relative mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
      <p className="relative mt-1 text-xs text-zinc-500">{hint}</p>
    </article>
  );
}