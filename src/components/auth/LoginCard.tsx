import type { ReactNode } from "react";

export function LoginCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full max-w-[440px]">
      <div className="pointer-events-none absolute -inset-px rounded-[1.25rem] bg-gradient-to-b from-brand-400/40 via-brand-500/10 to-transparent opacity-80" />
      <div className="relative overflow-hidden rounded-[1.2rem] border border-white/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04),0_24px_64px_rgba(15,23,42,0.08)] ring-1 ring-zinc-900/5">
        <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-brand-600 to-brand-700" aria-hidden />
        <div className="px-8 py-8 sm:px-10 sm:py-9">{children}</div>
      </div>
    </div>
  );
}