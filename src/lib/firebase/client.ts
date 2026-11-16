import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";

import { getFirebaseWebConfig } from "@/config/env";

function getOrInitApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  const config = getFirebaseWebConfig();
  if (!config) {
    throw new Error("Firebase is not configured");
  }
  return initializeApp(config);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getOrInitApp());
}