import { getApiBaseUrl, isApiConfigured } from "@/config/env";
import type { ApiEnvelope } from "@/types/auth";

const UPLOAD_PATH = "/api/super-admin/master-categories/images/upload";

export class MasterCategoryImageUploadError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "MasterCategoryImageUploadError";
    this.status = status;
  }
}

type UploadData = {
  image_url: string;
};

export async function uploadMasterCategoryImage(options: {
  file: File;
  onProgress?: (ratio: number) => void;
}): Promise<{ imageUrl: string }> {
  if (!isApiConfigured()) {
    throw new MasterCategoryImageUploadError(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
      0,
    );
  }

  const base = getApiBaseUrl()!;
  const form = new FormData();
  form.append("image_type", "category");
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
        reject(new MasterCategoryImageUploadError("Invalid upload response.", xhr.status));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300 || !envelope?.success) {
        reject(
          new MasterCategoryImageUploadError(
            envelope?.message ?? "Image upload failed.",
            xhr.status,
          ),
        );
        return;
      }

      const imageUrl = envelope.data?.image_url?.trim() ?? "";
      if (!imageUrl) {
        reject(
          new MasterCategoryImageUploadError("Upload response missing image URL.", xhr.status),
        );
        return;
      }

      resolve({ imageUrl });
    };

    xhr.onerror = () => {
      reject(new MasterCategoryImageUploadError("Network error during image upload.", 0));
    };

    xhr.send(form);
  });
}

export function friendlyCategoryImageUploadMessage(error: unknown): string {
  if (error instanceof MasterCategoryImageUploadError) {
    if (error.status === 0) {
      return "Network error during image upload.";
    }
    if (error.status === 413 || error.status === 400) {
      return error.message || "Uploaded image is too large or unsupported.";
    }
    return error.message || "Unable to upload category image.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to upload category image.";
}