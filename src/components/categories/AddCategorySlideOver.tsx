"use client";

import { X } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";

import {
  CategoryImageUpload,
  emptyCategoryImageField,
  type CategoryImageFieldValue,
} from "@/components/categories/CategoryImageUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  friendlyCategoryImageUploadMessage,
  uploadMasterCategoryImage,
} from "@/services/master-category-image-upload-service";
import {
  createMasterCategory,
  MasterCategoryServiceError,
} from "@/services/master-category-service";
import { revokeCategoryPreview } from "@/utils/category-image-validator";

type AddCategorySlideOverProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function AddCategorySlideOver({ open, onClose, onCreated }: AddCategorySlideOverProps) {
  const titleId = useId();
  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [imageField, setImageField] = useState<CategoryImageFieldValue>(emptyCategoryImageField);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const busy = submitting || uploadProgress != null;

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
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
  }, [busy, onClose, open]);

  useEffect(() => {
    if (!open) {
      setName("");
      setDisplayOrder("0");
      setIsActive(true);
      revokeCategoryPreview(imageField.previewUrl);
      setImageField(emptyCategoryImageField());
      setImageError(null);
      setUploadProgress(null);
      setError(null);
      setNameError(null);
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when panel closes
  }, [open]);

  useEffect(() => {
    return () => {
      revokeCategoryPreview(imageField.previewUrl);
    };
  }, [imageField.previewUrl]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) {
      return;
    }

    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Category name is required.");
      return;
    }
    setNameError(null);

    const order = Number.parseInt(displayOrder, 10);
    if (Number.isNaN(order) || order < 0) {
      setError("Display order must be zero or greater.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setImageError(null);
    setUploadProgress(null);

    let imageUrl: string | null = null;
    if (imageField.pendingFile) {
      try {
        const uploaded = await uploadMasterCategoryImage({
          file: imageField.pendingFile,
          onProgress: setUploadProgress,
        });
        imageUrl = uploaded.imageUrl;
      } catch (uploadErr) {
        setImageError(friendlyCategoryImageUploadMessage(uploadErr));
        setSubmitting(false);
        setUploadProgress(null);
        return;
      }
    }

    try {
      await createMasterCategory({
        name: trimmed,
        display_order: order,
        is_active: isActive,
        image_url: imageUrl,
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
      setUploadProgress(null);
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
          if (!busy) {
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
              Categories group products on storefronts across the platform.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>

        <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <Input
              label="Category name"
              name="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Fruits & Vegetables"
              error={nameError ?? undefined}
              autoFocus
              disabled={busy}
              maxLength={255}
            />

            <CategoryImageUpload
              value={imageField}
              onChange={(next) => {
                setImageError(null);
                setImageField(next);
              }}
              uploadProgress={uploadProgress}
              error={imageError}
              disabled={busy}
              onValidationError={(message) => setImageError(message)}
            />

            <Input
              label="Display order"
              name="display-order"
              type="number"
              min={0}
              step={1}
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
              hint="Lower numbers appear first."
              disabled={busy}
            />

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-zinc-900">Active</p>
                <p className="text-xs text-zinc-500">
                  Inactive categories are hidden from storefront selection.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={busy}
                className="size-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500/30"
                aria-label="Category is active"
              />
            </div>

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
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {uploadProgress != null ? "Uploading…" : "Create category"}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
}