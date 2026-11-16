"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { ProductCreateImagesField, revokeProductImagePreviews, type ProductCreateImageItem } from "@/components/products/ProductCreateImagesField";
import { Field, SectionTitle, UNIT_OPTIONS, formatUnitHint, selectClassName } from "@/components/products/product-form-parts";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { listMasterCategories } from "@/services/master-category-service";
import { friendlyProductImageUploadMessage, uploadMasterProductImage } from "@/services/master-product-image-upload-service";
import { associateMasterProductImages, createMasterProduct, MasterProductServiceError } from "@/services/master-product-service";
import { listMasterSubcategories, type MasterSubcategoryListItem } from "@/services/master-subcategory-service";
import type { MasterCategory } from "@/types/master-category";
import type { MasterProductCreatePayload, MasterProductUnit } from "@/types/master-product";
import { defaultProductCreateForm, validateProductCreateForm, type ProductCreateFieldErrors, type ProductCreateFormValues } from "@/validators/product-create-validator";

const CATEGORY_LIMIT = 100;

export function ProductCreateScreen() {
  const router = useRouter();
  const [form, setForm] = useState<ProductCreateFormValues>(defaultProductCreateForm);
  const [fieldErrors, setFieldErrors] = useState<ProductCreateFieldErrors>({});
  const [images, setImages] = useState<ProductCreateImageItem[]>([]);
  const [primaryClientId, setPrimaryClientId] = useState<string | null>(null);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [subcategories, setSubcategories] = useState<MasterSubcategoryListItem[]>([]);

  useEffect(() => {
    void listMasterCategories({ page: 1, limit: CATEGORY_LIMIT, is_active: true }).then((data) =>
      setCategories(data.items),
    );
  }, []);

  useEffect(() => {
    if (!form.categoryId) {
      setSubcategories([]);
      return;
    }
    void listMasterSubcategories(form.categoryId, { page: 1, limit: CATEGORY_LIMIT }).then((data) =>
      setSubcategories(data.items.filter((item) => item.is_active)),
    );
  }, [form.categoryId]);

  useEffect(() => () => revokeProductImagePreviews(images), [images]);

  const patchForm = (patch: Partial<ProductCreateFormValues>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (patch.categoryId != null && patch.categoryId !== prev.categoryId) next.subcategoryId = "";
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const { errors, payload } = validateProductCreateForm(form);
    setFieldErrors(errors);
    setImagesError(null);
    setFormError(null);
    if (!payload || Object.keys(errors).length > 0) {
      setFormError("Fix the highlighted fields and try again.");
      return;
    }

    setSubmitting(true);
    const uploaded = [...images];
    try {
      for (let i = 0; i < uploaded.length; i++) {
        if (uploaded[i].uploadedUrl) continue;
        const result = await uploadMasterProductImage({
          file: uploaded[i].file,
          onProgress: (ratio) => {
            uploaded[i] = { ...uploaded[i], uploadProgress: ratio };
            setImages([...uploaded]);
          },
        });
        uploaded[i] = { ...uploaded[i], uploadProgress: 1, uploadedUrl: result.imageUrl };
        setImages([...uploaded]);
      }

      const createPayload: MasterProductCreatePayload = { ...payload, unit: payload.unit };
      const product = await createMasterProduct(createPayload);
      const primaryId = primaryClientId ?? uploaded[0]?.clientId ?? null;
      const assoc = uploaded
        .map((item, index) =>
          item.uploadedUrl
            ? {
                imageUrl: item.uploadedUrl,
                displayOrder: index,
                isPrimary: item.clientId === primaryId,
              }
            : null,
        )
        .filter((item): item is NonNullable<typeof item> => item != null);
      if (assoc.length > 0) await associateMasterProductImages(product.id, assoc);
      router.push("/dashboard/products");
    } catch (err) {
      setFormError(
        err instanceof MasterProductServiceError
          ? err.message
          : friendlyProductImageUploadMessage(err) || "Unable to create product.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const unitLabel = formatUnitHint(form.unit);

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 pb-10">
      <div>
        <Link href="/dashboard/products" className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-brand-700">
          <ArrowLeft className="size-4" aria-hidden />
          Back to products
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">Add product</h1>
        <p className="mt-1 text-sm text-zinc-600">Same fields as merchant add product, for the master catalog.</p>
      </div>

      {formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-6">
        <WidgetCard title="" className="[&_header]:hidden">
          <SectionTitle title="Basic information" description="Name, category, and optional description." />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Product name" required error={fieldErrors.name} className="sm:col-span-2">
              <input className={selectClassName} value={form.name} disabled={submitting} onChange={(e) => patchForm({ name: e.target.value })} />
            </Field>
            <Field label="Brand" error={fieldErrors.brand}>
              <input className={selectClassName} value={form.brand} disabled={submitting} onChange={(e) => patchForm({ brand: e.target.value })} placeholder="Optional" />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea className="min-h-[88px] w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm" value={form.description} disabled={submitting} onChange={(e) => patchForm({ description: e.target.value })} placeholder="Optional" rows={3} />
            </Field>
            <Field label="Category" required error={fieldErrors.categoryId}>
              <select className={selectClassName} value={form.categoryId} disabled={submitting} onChange={(e) => patchForm({ categoryId: e.target.value })}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Subcategory" error={fieldErrors.subcategoryId}>
              <select className={selectClassName} value={form.subcategoryId} disabled={submitting || !form.categoryId} onChange={(e) => patchForm({ subcategoryId: e.target.value })}>
                <option value="">{form.categoryId ? "No subcategory" : "Select category first"}</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
          </div>
        </WidgetCard>

        <WidgetCard title="" className="[&_header]:hidden">
          <ProductCreateImagesField items={images} primaryClientId={primaryClientId} disabled={submitting} error={imagesError} onChange={setImages} onPrimaryChange={setPrimaryClientId} />
        </WidgetCard>

        <WidgetCard title="" className="[&_header]:hidden">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Selling price (₹)" value={form.sellingPrice} disabled={submitting} error={fieldErrors.sellingPrice} onChange={(e) => patchForm({ sellingPrice: e.target.value })} />
            <Input label="MRP (₹)" value={form.mrp} disabled={submitting} error={fieldErrors.mrp} onChange={(e) => patchForm({ mrp: e.target.value })} />
            <Field label="Unit" required error={fieldErrors.unit}>
              <select className={selectClassName} value={form.unit} disabled={submitting} onChange={(e) => patchForm({ unit: e.target.value as MasterProductUnit | "" })}>
                <option value="">Select unit</option>
                {UNIT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Input label="Unit value" value={form.unitValue} disabled={submitting} hint={unitLabel} error={fieldErrors.unitValue} onChange={(e) => patchForm({ unitValue: e.target.value })} />
            <Input label="Stock quantity" value={form.stockQuantity} disabled={submitting} error={fieldErrors.stockQuantity} onChange={(e) => patchForm({ stockQuantity: e.target.value })} />
            <Input label="Display order" value={form.displayOrder} disabled={submitting} error={fieldErrors.displayOrder} onChange={(e) => patchForm({ displayOrder: e.target.value })} />
          </div>
          <label className="mt-4 flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3">
            <span className="text-sm font-medium text-zinc-900">Active product</span>
            <input type="checkbox" checked={form.isActive} disabled={submitting} onChange={(e) => patchForm({ isActive: e.target.checked })} />
          </label>
        </WidgetCard>

        <div className="flex justify-end gap-2">
          <Link href="/dashboard/products">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting} loading={submitting}>
            {!submitting ? <Save className="size-4" aria-hidden /> : null}
            Save product
          </Button>
        </div>
      </form>
    </div>
  );
}