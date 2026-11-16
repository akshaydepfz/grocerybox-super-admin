"use client";

import { Loader2, X } from "lucide-react";
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
  getMasterCategory,
  MasterCategoryServiceError,
  updateMasterCategory,
} from "@/services/master-category-service";
import type { MasterCategory } from "@/types/master-category";
import { revokeCategoryPreview } from "@/utils/category-image-validator";

type CategoryFormSlideOverProps = {
  open: boolean;
  mode: "create" | "edit";
  categoryId?: string | null;
  onClose: () => void;
  onSaved: () => void;
};

export function CategoryFormSlideOver({
  open,
  mode,
  categoryId,
  onClose,
  onSaved,
}: CategoryFormSlideOverProps) {
  const titleId = useId();
  const [existing, setExisting] = useState<MasterCategory | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [imageField, setImageField] = useState<CategoryImageFieldValue>(emptyCategoryImageField);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const busy = submitting || uploadProgress != null || loadingDetail;
  const existingImageUrl = existing?.image_url?.trim() || null;

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
      setExisting(null);
      setLoadingDetail(false);
      setLoadError(null);
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
    if (!open || mode !== "edit" || !categoryId) {
      return;
    }

    let cancelled = false;
    setLoadingDetail(true);
    setLoadError(null);
    setExisting(null);

    void getMasterCategory(categoryId)
      .then((category) => {
        if (cancelled) {
          return;
        }
        setExisting(category);
        setName(category.name);
        setDisplayOrder(String(category.display_order));
        setIsActive(category.is_active);
        setImageField(emptyCategoryImageField());
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        const message =
          err instanceof MasterCategoryServiceError
            ? err.message
            : "Unable to load category.";
        setLoadError(message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, mode, open]);

  useEffect(() => {
    return () => {
      revokeCategoryPreview(imageField.previewUrl);
    };
  }, [imageField.previewUrl]);

  const resolveImagePatch = async (): Promise<{
    imageUrl?: string | null;
    touchImageUrl?: boolean;
  }> => {
    if (imageField.pendingFile) {
      const uploaded = await uploadMasterCategoryImage({
        file: imageField.pendingFile,
        categoryId: mode === "edit" ? (categoryId ?? undefined) : undefined,
        onProgress: setUploadProgress,
      });
      return {
        imageUrl: uploaded.imageUrl,
        touchImageUrl: mode === "edit",
      };
    }

    if (mode === "edit" && imageField.removed && existingImageUrl) {
      return {
        imageUrl: null,
        touchImageUrl: true,
      };
    }

    return {};
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || (mode === "edit" && !categoryId)) {
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

    let imagePatch: Awaited<ReturnType<typeof resolveImagePatch>> = {};
    try {
      imagePatch = await resolveImagePatch();
    } catch (uploadErr) {
      setImageError(friendlyCategoryImageUploadMessage(uploadErr));
      setSubmitting(false);
      setUploadProgress(null);
      return;
    }

    try {
      if (mode === "create") {
        await createMasterCategory({
          name: trimmed,
          display_order: order,
          is_active: isActive,
          image_url: imagePatch.imageUrl ?? null,
        });
      } else {
        await updateMasterCategory(categoryId!, {
          name: trimmed,
          display_order: order,
          is_active: isActive,
          touch_image_url: imagePatch.touchImageUrl,
          image_url: imagePatch.touchImageUrl ? (imagePatch.imageUrl ?? null) : undefined,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      const message =
        err instanceof MasterCategoryServiceError
          ? err.message
          : mode === "create"
            ? "Unable to create category."
            : "Unable to update category.";
      setError(message);
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  if (!open) {
    return null;
  }

  const title = mode === "create" ? "Add category" : "Edit category";
  const submitLabel =
    uploadProgress != null
      ? "Uploading…"
      : mode === "create"
        ? "Create category"
        : "Save changes";

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
              {title}
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

        {loadingDetail ? (
          <div className="flex flex-1 items-center justify-center gap-2 py-16 text-sm text-zinc-600">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading category…
          </div>
        ) : loadError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-16 text-center">
            <p className="text-sm text-red-700" role="alert">
              {loadError}
            </p>
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
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
                existingUrl={existingImageUrl}
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

              {mode === "edit" && existing?.slug ? (
                <p className="text-xs text-zinc-500">
                  Slug: <span className="font-mono">/{existing.slug}</span> (generated by backend)
                </p>
              ) : null}

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
                {submitLabel}
              </Button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}