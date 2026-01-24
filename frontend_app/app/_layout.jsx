// template
import { AuthProvider } from "@/contexts/AuthContext";
import { OrdersProvider } from "@/contexts/OrdersContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="zone-change"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen name="zone-navigation" options={{ headerShown: false }} />
      <Stack.Screen
        name="order-notification"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen name="order-pickup" options={{ headerShown: false }} />
      <Stack.Screen name="order-delivery" options={{ headerShown: false }} />
      <Stack.Screen
        name="fatigue-detection"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="fall-detection"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="fall-assistance"
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <OrdersProvider>
            <GestureHandlerRootView>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </OrdersProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
