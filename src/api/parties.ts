import { supabase } from "@/api/supabaseClient";
import { getCurrentUserId } from "@/api/session";
import type {
  PartyFavoriteRow,
  PartyJoinRequestRow,
  PartyMemberRow,
  PartyRow,
} from "@/types/supabase";

export type CreatePartyInput = {
  name: string;
  description?: string;
  avatar_url?: string;
  banner_url?: string;
  theme_background_color?: string;
  post_card_color?: string;
  is_private?: boolean;
  invite_code?: string;
};

export async function createParty(input: CreatePartyInput) {
  const ownerId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("parties")
    .insert({ ...input, owner_id: ownerId })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as PartyRow;
}

export async function listMyParties() {
  const { data, error } = await supabase
    .from("parties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as PartyRow[];
}

export async function getPartyById(partyId: string) {
  const { data, error } = await supabase
    .from("parties")
    .select("*")
    .eq("id", partyId)
    .single();

  if (error) {
    throw error;
  }

  return data as PartyRow;
}

export async function listPartyMembers(partyId: string) {
  const { data, error } = await supabase
    .from("party_members")
    .select("*")
    .eq("party_id", partyId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data as PartyMemberRow[];
}

export async function joinPartyByCode(inviteCode: string) {
  const { data, error } = await supabase.rpc("join_party_by_code", {
    party_invite_code: inviteCode,
  });

  if (error) {
    throw error;
  }

  return data as PartyJoinRequestRow | PartyMemberRow | null;
}

export async function favoriteParty(partyId: string) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("party_favorites")
    .insert({ party_id: partyId, user_id: userId })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as PartyFavoriteRow;
}

export async function unfavoriteParty(partyId: string) {
  const { error } = await supabase
    .from("party_favorites")
    .delete()
    .eq("party_id", partyId);

  if (error) {
    throw error;
  }
}
