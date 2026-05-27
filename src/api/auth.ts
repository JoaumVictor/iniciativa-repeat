import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { ensureSupabaseConfigured, supabaseAuth } from "@/api/supabaseClient";
import {
  SUPABASE_GOOGLE_WEB_CLIENT_ID,
  isSupabaseConfigured,
} from "@/config/env";
import { saveTokens, clearTokens } from "@/services/tokenStorage";
import { useAuthStore } from "@/store/authStore";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  ensureSupabaseConfigured();

  const redirectTo = Linking.createURL("auth/callback");

  const result = await supabaseAuth.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
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

  if (result.error) {
    throw result.error;
  }

  const authUrl = result.data?.url;

  if (!authUrl) {
    throw new Error("Não foi possível iniciar o login com Google.");
  }

  const authResult = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);

  if (authResult.type !== "success") {
    return false;
  }

  const sessionTokens = await resolveSessionTokens(authResult.url);

  await hydrateSessionFromAuthTokens(sessionTokens);
  return true;
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
  await supabaseAuth.auth.signOut();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });
}

async function resolveSessionTokens(callbackUrl: string) {
  const parsedUrl = new URL(callbackUrl);
  const authCode = parsedUrl.searchParams.get("code");

  if (authCode) {
    const { data, error } =
      await supabaseAuth.auth.exchangeCodeForSession(authCode);

    if (error) {
      throw error;
    }

    const accessToken = data.session?.access_token;
    const refreshToken = data.session?.refresh_token;

    if (!accessToken || !refreshToken) {
      throw new Error("O Google retornou sem tokens de sessão.");
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  const hashParams = new URLSearchParams(callbackUrl.split("#")[1] ?? "");
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");

  if (!accessToken || !refreshToken) {
    throw new Error(
      "O retorno do Google não trouxe tokens. Verifique Redirect URLs no Supabase.",
    );
  }

  return {
    accessToken,
    refreshToken,
  };
}
