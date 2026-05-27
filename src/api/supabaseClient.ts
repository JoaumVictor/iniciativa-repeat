import { createClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config/env";
import { useAuthStore } from "@/store/authStore";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
