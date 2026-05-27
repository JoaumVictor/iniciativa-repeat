import { supabase } from "@/api/supabaseClient";
import type { PartyRow, PostRow, ProfileRow } from "@/types/supabase";

export type FeedPostRow = PostRow & {
  party: Pick<PartyRow, "name" | "avatar_url"> | null;
  author: Pick<ProfileRow, "nickname" | "username" | "avatar_url"> | null;
};

export async function listMyFeedPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, party:parties(name, avatar_url), author:profiles(nickname, username, avatar_url)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as FeedPostRow[];
}

export async function listPartyFeedPosts(partyId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, party:parties(name, avatar_url), author:profiles(nickname, username, avatar_url)",
    )
    .eq("party_id", partyId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as FeedPostRow[];
}
