import { formatDisplayValue, humanizeSnakeCase } from "@/utils/format";

type DetailKeyValueGridProps = {
  data?: Record<string, unknown> | null;
  emptyLabel?: string;
};

export function DetailKeyValueGrid({
  data,
  emptyLabel = "Not provided yet.",
}: DetailKeyValueGridProps) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-sm text-zinc-500">{emptyLabel}</p>;
  }

  const entries = Object.entries(data).filter(([, value]) => value !== undefined);

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-xl border border-zinc-100 bg-zinc-50/50 px-3 py-2.5">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            {humanizeSnakeCase(key)}
          </dt>
          <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-900">
            {formatDisplayValue(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}