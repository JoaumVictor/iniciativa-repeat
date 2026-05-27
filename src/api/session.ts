import { supabase } from "@/api/supabaseClient";

export async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  const userId = data.user?.id;

  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  return userId;
}
