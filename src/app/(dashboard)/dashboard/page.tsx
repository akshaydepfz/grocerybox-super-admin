"use client";

import { LogOut } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { email, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">GroceryBox</p>
            <h1 className="mt-0.5 text-xl font-semibold text-zinc-900">Dashboard</h1>
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

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-600">
            {email ? (
              <>
                Signed in as <span className="font-medium text-zinc-900">{email}</span>.
              </>
            ) : (
              "Signed in."
            )}
          </p>
          <p className="mt-2 text-sm text-zinc-500">Admin modules coming soon.</p>
        </section>
      </div>
    </div>
  );
}