import { CreditCard, LayoutDashboard, ShieldCheck, Store } from "lucide-react";
export function LoginBrandingPanel() {
  return (
    <div className="relative hidden min-h-full flex-col justify-between overflow-hidden bg-forest-950 p-10 text-white lg:flex lg:w-[48%] xl:w-[52%]">
      <DecorativeBackdrop />

      <div className="relative z-10 space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-lime-400/15 ring-1 ring-lime-400/30">
            <span className="text-lg font-bold text-lime-300">GB</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-lime-300">
              GroceryBox
            </p>
            <p className="text-xs text-forest-300">Control Center</p>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Manage your entire grocery commerce ecosystem.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-forest-200/90 xl:text-base">
            Centralized administration for merchants, subscription plans, payments,
            approvals, and platform operations — built for scale and clarity.
          </p>
        </div>

        <ul className="grid max-w-md gap-3 text-sm text-forest-100/90">
          <FeatureItem icon={Store} label="Merchants & storefront lifecycle" />
          <FeatureItem icon={CreditCard} label="Subscriptions, billing & payouts" />
          <FeatureItem icon={LayoutDashboard} label="Orders, analytics & configuration" />
          <FeatureItem icon={ShieldCheck} label="Approvals, roles & platform security" />
        </ul>
      </div>

      <p className="relative z-10 text-xs text-forest-400">
        GroceryBox Platform Administration
      </p>
    </div>
  );
}

function FeatureItem({
  icon: Icon,
  label,
}: {
  icon: typeof Store;
  label: string;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-forest-800/80 bg-forest-900/30 px-4 py-3 backdrop-blur-sm">
      <Icon className="size-4 shrink-0 text-lime-300" aria-hidden />
      <span>{label}</span>
    </li>
  );
}

function DecorativeBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-lime-400/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 size-80 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-8 rounded-[2rem] border border-forest-800/60 bg-gradient-to-br from-forest-900/40 via-transparent to-forest-950/20"
        aria-hidden
      />
    </>
  );
}

export function MobileBrandHeader() {
  return (
    <div className="mb-8 flex items-center gap-3 lg:hidden">
      <div className="flex size-10 items-center justify-center rounded-xl bg-lime-400/15 ring-1 ring-lime-400/30">
        <span className="font-bold text-lime-300">GB</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">GroceryBox Control Center</p>
        <p className="text-xs text-forest-400">Super Admin</p>
      </div>
    </div>
  );
}