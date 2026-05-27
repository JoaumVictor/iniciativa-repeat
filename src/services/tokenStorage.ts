import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

import { AuthTokens } from "@/types/auth";

const STORAGE_KEYS = {
  accessToken: "dilla-gym.access-token",
  refreshToken: "dilla-gym.refresh-token",
} as const;

function canUseWebStorage() {
  return (
    Platform.OS === "web" && typeof globalThis.localStorage !== "undefined"
  );
}

async function setWebItem(key: string, value: string | null) {
  if (!canUseWebStorage()) {
    return;
  }

  if (value === null) {
    globalThis.localStorage.removeItem(key);
    return;
  }

  globalThis.localStorage.setItem(key, value);
}

async function getWebItem(key: string) {
  if (!canUseWebStorage()) {
    return null;
  }

  return globalThis.localStorage.getItem(key);
}

export async function loadTokens(): Promise<AuthTokens | null> {
  if (canUseWebStorage()) {
    const accessToken = await getWebItem(STORAGE_KEYS.accessToken);
    const refreshToken = await getWebItem(STORAGE_KEYS.refreshToken);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  }

  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
    SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
  ]);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

export async function saveTokens(tokens: AuthTokens) {
  if (canUseWebStorage()) {
    await Promise.all([
      setWebItem(STORAGE_KEYS.accessToken, tokens.accessToken),
      setWebItem(STORAGE_KEYS.refreshToken, tokens.refreshToken),
    ]);
    return;
  }

  await Promise.all([
    SecureStore.setItemAsync(STORAGE_KEYS.accessToken, tokens.accessToken),
    SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, tokens.refreshToken),
  ]);
}

export async function clearTokens() {
  if (canUseWebStorage()) {
    await Promise.all([
      setWebItem(STORAGE_KEYS.accessToken, null),
      setWebItem(STORAGE_KEYS.refreshToken, null),
    ]);
    return;
  }

  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken),
    SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken),
  ]);
}

export async function getAccessToken() {
  return (await loadTokens())?.accessToken ?? null;
}

export async function getRefreshToken() {
  return (await loadTokens())?.refreshToken ?? null;
}
