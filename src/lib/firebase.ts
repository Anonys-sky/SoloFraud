import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

/**
 * ScamShield Firebase Infrastructure
 * Dual-mode initialization for Client and Server environments.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "BUILD_NOT_CONFIGURED",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vcutmhack'}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "vcutmhack",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vcutmhack'}.firebasestorage.app`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Singleton pattern to ensure only one app is initialized
let app: FirebaseApp;
if (getApps().length === 0) {
  console.log(`[Firebase] 🔥 Initializing with Project ID: ${firebaseConfig.projectId}`);
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export default app;

/** True when public web config is present (needed for server-side client-SDK writes). */
export function isFirestoreClientConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const pid =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  return !!(
    key &&
    key !== "BUILD_NOT_CONFIGURED" &&
    pid &&
    appId
  );
}

/** After NOT_FOUND on writes, stop spamming the same failing RPC for this process. */
let firestoreReportWritesSuppressed = false;

export function isFirestoreReportWriteSuppressed(): boolean {
  return firestoreReportWritesSuppressed;
}

export function suppressFirestoreReportWrites(): void {
  firestoreReportWritesSuppressed = true;
}
