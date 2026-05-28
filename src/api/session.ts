import type { User } from "@supabase/supabase-js";

import { getSupabaseAccessToken, supabaseAuth } from "@/api/supabaseClient";

export async function getCurrentUser(): Promise<User> {
  const accessToken = getSupabaseAccessToken();

  if (!accessToken) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabaseAuth.auth.getUser(accessToken);

  if (error) {
    throw error;
  }

  const user = data.user;

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  return user;
}

export async function getCurrentUserId() {
  const user = await getCurrentUser();
  const userId = user.id;

  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  return userId;
}
