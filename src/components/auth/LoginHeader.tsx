import { Leaf } from "lucide-react";

export function LoginHeader() {
  return (
    <div className="mb-7 flex flex-col items-center text-center sm:mb-8">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/25">
        <Leaf className="size-6" strokeWidth={2.25} aria-hidden />
      </div>
      <p className="text-xl font-semibold tracking-tight text-zinc-900">GroceryBox</p>
      <span className="mt-2 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800">
        Super Admin
      </span>
    </div>
  );
}