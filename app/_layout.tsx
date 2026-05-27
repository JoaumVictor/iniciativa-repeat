import "react-native-gesture-handler";
import "../global.css";

import { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
  );

  useAuthBootstrap();

  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#0b1120" },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface-950 px-6">
      <ActivityIndicator color="#60a5fa" />
      <Text className="mt-4 text-sm text-slate-300">Carregando app...</Text>
    </View>
  );
}
