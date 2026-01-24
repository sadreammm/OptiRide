import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_CONFIG, hasFirebaseConfig } from "./config";

let firebaseApp = null;
let firebaseAuth = null;

export function getFirebaseApp() {
  if (!hasFirebaseConfig) {
    console.warn("Firebase configuration is missing. Using mock auth. Please set EXPO_PUBLIC_FIREBASE_* values in .env file.");
    return null;
  }

  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  }

  return firebaseApp;
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  
  if (!app) {
    // Return a mock auth object when Firebase is not configured
    return null;
  }

  if (!firebaseAuth) {
    try {
      // Try to get existing auth instance
      firebaseAuth = getAuth(app);
    } catch (error) {
      // Initialize auth with AsyncStorage persistence for React Native
      firebaseAuth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    }
  }

  return firebaseAuth;
}
