import { getSupabaseAccessToken, supabaseAuth } from "@/api/supabaseClient";

export async function getCurrentUserId() {
  const accessToken = getSupabaseAccessToken();

  if (!accessToken) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabaseAuth.auth.getUser(accessToken);

  if (error) {
    throw error;
  }

  const userId = data.user?.id;

  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  return userId;
}
