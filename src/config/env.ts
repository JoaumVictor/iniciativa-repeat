export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_SUPABASE_GOOGLE_WEB_CLIENT_ID ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabaseConfigMessage =
  "Preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env para ativar o backend.";
