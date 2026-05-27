import { Redirect } from "expo-router";

import { LoadingScreen } from "./_layout";
import { useAuthStore } from "@/store/authStore";

export default function Index() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return <Redirect href={isAuthenticated ? "/(app)" : "/(auth)/login"} />;
}
