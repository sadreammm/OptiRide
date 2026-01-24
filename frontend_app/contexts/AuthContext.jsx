import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase";
import { fetchCurrentUser } from "@/services/auth";

const STORAGE_KEY = "authToken";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedToken) {
        setToken(storedToken);
        const profile = await fetchCurrentUser(storedToken);
        setUser(profile);
      }
    } catch (err) {
      console.error("Failed to restore auth session", err);
      setError("Session expired. Please sign in again.");
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    
    try {
      const auth = getFirebaseAuth();
      
      if (!auth) {
        throw new Error("Firebase is not properly configured. Please check your .env file and ensure all EXPO_PUBLIC_FIREBASE_* values are set correctly.");
      }
      
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credentials.user.getIdToken();

      await AsyncStorage.setItem(STORAGE_KEY, idToken);
      setToken(idToken);

      const profile = await fetchCurrentUser(idToken);
      setUser(profile);

      return profile;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const auth = getFirebaseAuth();
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn("Firebase signOut warning", err);
    } finally {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    isLoading,
    error,
    login,
    logout,
    refresh: restoreSession,
  };
});
