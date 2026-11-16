"use client";

import { CloudUpload, ImageIcon, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

import { Button } from "@/components/ui/Button";
import {
  revokeCategoryPreview,
  validateCategoryImageUpload,
} from "@/utils/category-image-validator";
import { cn } from "@/utils/cn";

const ACCEPT = "image/jpeg,image/png,image/webp";

export type CategoryImageFieldValue = {
  pendingFile: File | null;
  previewUrl: string | null;
  removed: boolean;
};

export const emptyCategoryImageField = (): CategoryImageFieldValue => ({
  pendingFile: null,
  previewUrl: null,
  removed: false,
});

type CategoryImageUploadProps = {
  existingUrl?: string | null;
  value: CategoryImageFieldValue;
  onChange: (next: CategoryImageFieldValue) => void;
  uploadProgress: number | null;
  error?: string | null;
  disabled?: boolean;
  onValidationError?: (message: string) => void;
};

export function CategoryImageUpload({
  existingUrl,
  value,
  onChange,
  uploadProgress,
  error,
  disabled,
  onValidationError,
}: CategoryImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const displaySrc = value.previewUrl
    ? value.previewUrl
    : value.removed
      ? null
      : existingUrl?.trim() || null;

  const applyFile = (file: File): string | null => {
    const validation = validateCategoryImageUpload(file.size, file.type, file.name);
    if (validation) {
      return validation;
    }

    revokeCategoryPreview(value.previewUrl);
    const previewUrl = URL.createObjectURL(file);
    onChange({
      pendingFile: file,
      previewUrl,
      removed: false,
    });
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || disabled) {
      return;
    }
    const validationMessage = applyFile(file);
    if (validationMessage) {
      onValidationError?.(validationMessage);
    }
  };

  const clearImage = () => {
    revokeCategoryPreview(value.previewUrl);
    onChange({
      pendingFile: null,
      previewUrl: null,
      removed: true,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="block text-sm font-medium text-zinc-700">Category image (optional)</span>
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-6 text-center",
          error ? "border-red-200 bg-red-50/50" : "border-zinc-200 bg-zinc-50/50",
        )}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!disabled) {
            handleFiles(event.dataTransfer.files);
          }
        }}
      >
        {displaySrc ? (
          <div className="relative size-28 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <Image
              src={displaySrc}
              alt=""
              fill
              className="object-cover"
              sizes="112px"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex size-28 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400">
            <ImageIcon className="size-9" aria-hidden />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" aria-hidden />
            {displaySrc ? "Replace image" : "Choose image"}
          </Button>
          {displaySrc ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              className="text-red-600 hover:text-red-700"
              onClick={clearImage}
            >
              <Trash2 className="size-3.5" aria-hidden />
              Remove
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              <CloudUpload className="size-3.5" aria-hidden />
              Drag &amp; drop here
            </Button>
          )}
        </div>

        <p className="text-xs text-zinc-500">
          JPEG, PNG, or WebP · max 15 MB · optimized on upload (target ~200 KB)
        </p>

        {uploadProgress != null && uploadProgress > 0 ? (
          <div className="w-full max-w-xs">
            <p className="mb-1 text-xs font-medium text-zinc-600">
              Uploading… {Math.round(uploadProgress * 100)}%
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-brand-600 transition-[width] duration-200"
                style={{ width: `${Math.min(100, uploadProgress * 100)}%` }}
              />
            </div>
          </div>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}