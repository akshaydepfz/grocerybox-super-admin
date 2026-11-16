"use client";

import { X } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createMasterCategory,
  MasterCategoryServiceError,
} from "@/services/master-category-service";
import { cn } from "@/utils/cn";

type AddCategorySlideOverProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function AddCategorySlideOver({ open, onClose, onCreated }: AddCategorySlideOverProps) {
  const titleId = useId();
  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose, submitting]);

  useEffect(() => {
    if (!open) {
      setName("");
      setDisplayOrder("");
      setIsActive(true);
      setError(null);
      setNameError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name is required.");
      return;
    }
    setNameError(null);
    setError(null);
    setSubmitting(true);
    try {
      const order = displayOrder.trim() ? Number(displayOrder) : undefined;
      if (order != null && (!Number.isInteger(order) || order < 0)) {
        setError("Display order must be a whole number of 0 or greater.");
        setSubmitting(false);
        return;
      }
      await createMasterCategory({
        name: trimmed,
        display_order: order,
        is_active: isActive,
      });
      onCreated();
      onClose();
    } catch (err) {
      const message =
        err instanceof MasterCategoryServiceError
          ? err.message
          : "Unable to create category.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[1px]"
        onClick={() => {
          if (!submitting) {
            onClose();
          }
        }}
        aria-label="Close panel"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-2xl shadow-zinc-900/20"
      >
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-zinc-900">
              Add category
            </h2>
            <p className="mt-0.5 text-sm text-zinc-600">
              Create a master catalogue category for merchants to pick from.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>

        <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <Input
              label="Name"
              name="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Fruits & vegetables"
              error={nameError ?? undefined}
              autoFocus
              disabled={submitting}
              maxLength={255}
            />

            <Input
              label="Display order"
              name="display-order"
              type="number"
              min={0}
              step={1}
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
              placeholder="0"
              hint="Lower numbers appear first. Leave blank for default."
              disabled={submitting}
            />

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={submitting}
                className="size-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500/30"
              />
              <span>
                <span className="block text-sm font-medium text-zinc-800">Active</span>
                <span className="block text-xs text-zinc-500">
                  Inactive categories stay in the catalogue but are hidden from selection.
                </span>
              </span>
            </label>

            {error ? (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-zinc-100 px-5 py-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create category
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
}