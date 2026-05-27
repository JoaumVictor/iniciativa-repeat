import { create } from "zustand";

import { clearTokens, loadTokens, saveTokens } from "@/services/tokenStorage";
import { AuthTokens } from "@/types/auth";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,
  hydrate: async () => {
    const tokens = await loadTokens();

    set({
      accessToken: tokens?.accessToken ?? null,
      refreshToken: tokens?.refreshToken ?? null,
      isAuthenticated: Boolean(tokens),
      isHydrated: true,
    });
  },
  signIn: async (tokens) => {
    await saveTokens(tokens);

    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
    });
  },
  signOut: async () => {
    await clearTokens();

    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));
