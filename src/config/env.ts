function trimOrNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Go API base URL (no trailing slash). */
export function getApiBaseUrl(): string | null {
  const raw = trimOrNull(process.env.NEXT_PUBLIC_API_BASE_URL);
  return raw ? raw.replace(/\/+$/, "") : null;
}

export function isApiConfigured(): boolean {
  return Boolean(getApiBaseUrl());
}

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

/** Resolves Firebase client config from public env vars. */
export function getFirebaseWebConfig(): FirebaseWebConfig | null {
  const apiKey = trimOrNull(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  const authDomain = trimOrNull(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  const projectId = trimOrNull(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const storageBucket = trimOrNull(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  const messagingSenderId = trimOrNull(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  );
  const appId = trimOrNull(process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function isFirebaseConfigured(): boolean {
  return Boolean(getFirebaseWebConfig());
}

export function isAuthStackConfigured(): boolean {
  return isApiConfigured() && isFirebaseConfigured();
}