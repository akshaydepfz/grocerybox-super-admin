"use client";

import type { ReactNode } from "react";

import type { MasterProductUnit } from "@/types/master-product";
import { cn } from "@/utils/cn";

export const UNIT_OPTIONS: { value: MasterProductUnit; label: string }[] = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "litre", label: "Litre" },
  { value: "ml", label: "Millilitre (ml)" },
  { value: "piece", label: "Piece" },
  { value: "pack", label: "Pack" },
  { value: "dozen", label: "Dozen" },
  { value: "box", label: "Box" },
];

export const selectClassName =
  "h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 text-sm text-zinc-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60";

export function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
    </div>
  );
}

export function Field({
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </span>
      {children}
      {hint && !error ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function formatUnitHint(unit: MasterProductUnit | ""): string {
  if (!unit) {
    return "units";
  }
  return UNIT_OPTIONS.find((option) => option.value === unit)?.label ?? unit;
}