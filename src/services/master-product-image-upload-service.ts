import { getApiBaseUrl, isApiConfigured } from "@/config/env";
import type { ApiEnvelope } from "@/types/auth";

const UPLOAD_PATH = "/api/super-admin/master-products/images/upload";

export class MasterProductImageUploadError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "MasterProductImageUploadError";
    this.status = status;
  }
}

type UploadData = {
  image_url: string;
};

export async function uploadMasterProductImage(options: {
  file: File;
  onProgress?: (ratio: number) => void;
}): Promise<{ imageUrl: string }> {
  if (!isApiConfigured()) {
    throw new MasterProductImageUploadError(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
      0,
    );
  }

  const base = getApiBaseUrl()!;
  const form = new FormData();
  form.append("image_type", "gallery");
  form.append("image", options.file, options.file.name);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${base}${UPLOAD_PATH}`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (!options.onProgress || !event.lengthComputable) {
        return;
      }
      options.onProgress(event.loaded / event.total);
    };

    xhr.onload = () => {
      let envelope: ApiEnvelope<UploadData> | null = null;
      try {
        envelope = JSON.parse(xhr.responseText) as ApiEnvelope<UploadData>;
      } catch {
        reject(new MasterProductImageUploadError("Invalid upload response.", xhr.status));
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300 || !envelope?.success) {
        reject(
          new MasterProductImageUploadError(
            envelope?.message ?? "Image upload failed.",
            xhr.status,
          ),
        );
        return;
      }
      const imageUrl = envelope.data?.image_url?.trim() ?? "";
      if (!imageUrl) {
        reject(
          new MasterProductImageUploadError("Upload response missing image URL.", xhr.status),
        );
        return;
      }
      resolve({ imageUrl });
    };

    xhr.onerror = () => {
      reject(new MasterProductImageUploadError("Network error during image upload.", 0));
    };

    xhr.send(form);
  });
}

export function friendlyProductImageUploadMessage(error: unknown): string {
  if (error instanceof MasterProductImageUploadError) {
    return error.message || "Unable to upload product image.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to upload product image.";
}