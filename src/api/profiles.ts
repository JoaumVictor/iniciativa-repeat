import { supabase } from "@/api/supabaseClient";
import { getCurrentUserId } from "@/api/session";
import type { ProfileRow } from "@/types/supabase";

export type UpdateProfileInput = Partial<
  Pick<
    ProfileRow,
    | "username"
    | "full_name"
    | "nickname"
    | "bio"
    | "avatar_url"
    | "banner_url"
    | "gender"
    | "birth_date"
    | "height_cm"
    | "weight_kg"
    | "biceps_cm"
    | "chest_cm"
    | "waist_cm"
    | "thigh_cm"
    | "neck_cm"
    | "goal_status"
  >
>;

export async function getMyProfile() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data as ProfileRow;
}

export async function updateMyProfile(input: UpdateProfileInput) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as ProfileRow;
}

export async function getProfileById(profileId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (error) {
    throw error;
  }

  return data as ProfileRow;
}
