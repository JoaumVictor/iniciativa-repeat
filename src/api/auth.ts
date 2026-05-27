import { ensureSupabaseConfigured, supabase } from "@/api/supabaseClient";
import {
  SUPABASE_GOOGLE_WEB_CLIENT_ID,
  isSupabaseConfigured,
} from "@/config/env";
import { saveTokens, clearTokens } from "@/services/tokenStorage";
import { useAuthStore } from "@/store/authStore";

export async function signInWithGoogle() {
  ensureSupabaseConfigured();

  const result = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      ...(SUPABASE_GOOGLE_WEB_CLIENT_ID
        ? {
            scopes: "email profile",
          }
        : {}),
    },
  });

  return result;
}

export { isSupabaseConfigured };

export async function hydrateSessionFromAuthTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  await saveTokens(tokens);

  useAuthStore.setState({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    isAuthenticated: true,
    isHydrated: true,
  });
}

export async function signOutFromSupabase() {
  await clearTokens();
  await supabase.auth.signOut();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });
}
