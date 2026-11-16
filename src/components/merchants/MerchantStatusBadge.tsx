import { cn } from "@/utils/cn";
import { humanizeSnakeCase } from "@/utils/format";

type MerchantStatusBadgeProps = {
  label: string;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
};

const toneClasses: Record<NonNullable<MerchantStatusBadgeProps["tone"]>, string> = {
  neutral: "bg-zinc-100 text-zinc-700",
  brand: "bg-brand-50 text-brand-800",
  success: "bg-emerald-50 text-emerald-800",
  warning: "bg-amber-50 text-amber-900",
  danger: "bg-red-50 text-red-700",
};

export function MerchantStatusBadge({ label, tone = "neutral" }: MerchantStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        toneClasses[tone],
      )}
    >
      {humanizeSnakeCase(label)}
    </span>
  );
}

export function accountStatusTone(status: string): MerchantStatusBadgeProps["tone"] {
  return status === "active" ? "success" : "danger";
}

export function onboardingStatusTone(status: string): MerchantStatusBadgeProps["tone"] {
  if (status === "published") {
    return "success";
  }
  if (status === "account_registered") {
    return "neutral";
  }
  return "brand";
}