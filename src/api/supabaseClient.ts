import { createClient } from "@supabase/supabase-js";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
  supabaseConfigMessage,
} from "@/config/env";
import { useAuthStore } from "@/store/authStore";

const supabaseUrl = SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  accessToken: async () => getSupabaseAccessToken(),
});

export function getSupabaseAccessToken() {
  return useAuthStore.getState().accessToken;
}

export function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(supabaseConfigMessage);
  }
}
