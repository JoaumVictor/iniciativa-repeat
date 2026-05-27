import { supabase } from "@/api/supabaseClient";
import type { PostRow } from "@/types/supabase";

export async function listMyFeedPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as PostRow[];
}

export async function listPartyFeedPosts(partyId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("party_id", partyId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as PostRow[];
}
