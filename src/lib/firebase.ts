import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "solofraud-my-2030",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Prevent initialization crashes in environments without keys
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

const app = (getApps().length === 0 && isConfigValid) 
  ? initializeApp(firebaseConfig) 
  : getApps()[0] || initializeApp({ ...firebaseConfig, apiKey: "BUILD_NOT_CONFIGURED" });
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
