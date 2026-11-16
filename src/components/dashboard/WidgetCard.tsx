import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

type WidgetCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: "default" | "none";
};

export function WidgetCard({
  title,
  description,
  action,
  children,
  className,
  padding = "default",
}: WidgetCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-900/5",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className={padding === "default" ? "p-5" : undefined}>{children}</div>
    </section>
  );
}