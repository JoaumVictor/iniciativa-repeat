import * as QueryParams from "expo-auth-session/build/QueryParams";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

import { ensureSupabaseConfigured, supabaseAuth } from "@/api/supabaseClient";
import {
  SUPABASE_GOOGLE_WEB_CLIENT_ID,
  isSupabaseConfigured,
} from "@/config/env";
import { saveTokens, clearTokens } from "@/services/tokenStorage";
import { useAuthStore } from "@/store/authStore";

WebBrowser.maybeCompleteAuthSession();

const AUTH_CALLBACK_PATH = "auth/callback";
const APP_SCHEME = "iniciativarepeat";

function getGoogleRedirectUrl() {
  return makeRedirectUri({
    path: AUTH_CALLBACK_PATH,
    scheme: APP_SCHEME,
  });
}

export async function signInWithGoogle() {
  ensureSupabaseConfigured();

  const redirectTo = getGoogleRedirectUrl();

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
  const { params, errorCode } = QueryParams.getQueryParams(callbackUrl);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const authCode =
    typeof params.code === "string" && params.code.length > 0
      ? params.code
      : null;

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

  const accessToken =
    typeof params.access_token === "string" ? params.access_token : null;
  const refreshToken =
    typeof params.refresh_token === "string" ? params.refresh_token : null;

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
