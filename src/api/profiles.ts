import type { User } from "@supabase/supabase-js";

import { supabase } from "@/api/supabaseClient";
import { getCurrentUser } from "@/api/session";
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

type ProfileBootstrapInput = Pick<
  ProfileRow,
  "id" | "email" | "username" | "full_name" | "nickname" | "avatar_url"
>;

function getProfileSetupError(error: unknown, fallback: string) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : "";

  if (
    /public\.profiles/i.test(message) &&
    /(does not exist|schema cache)/i.test(message)
  ) {
    return new Error(
      "A estrutura do Supabase ainda não foi criada. Execute o script api/supabase_init.sql no SQL Editor do projeto.",
    );
  }

  if (/row-level security policy/i.test(message) && /profiles/i.test(message)) {
    return new Error(
      "A policy de insert/update da tabela profiles não está aplicada. Reexecute o script api/supabase_init.sql para criar as policies do perfil.",
    );
  }

  return error instanceof Error ? error : new Error(fallback);
}

function buildProfileBootstrapInput(user: User): ProfileBootstrapInput {
  const usernameFallback =
    user.user_metadata?.username ??
    user.user_metadata?.user_name ??
    user.user_metadata?.preferred_username ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    `user-${user.id.slice(0, 8)}`;

  return {
    id: user.id,
    email: user.email ?? null,
    username: String(usernameFallback)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9._]/g, "")
      .slice(0, 24),
    full_name:
      typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null,
    nickname:
      typeof user.user_metadata?.nickname === "string"
        ? user.user_metadata.nickname
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : null,
    avatar_url:
      typeof user.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : null,
  };
}

function pruneUndefined<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as T;
}

async function ensureMyProfile(user: User) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(buildProfileBootstrapInput(user), { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw getProfileSetupError(
      error,
      "Não foi possível garantir o perfil do usuário.",
    );
  }

  return data as ProfileRow;
}

export async function getMyProfile() {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw getProfileSetupError(
      error,
      "Não foi possível carregar o perfil do usuário.",
    );
  }

  if (!data) {
    return ensureMyProfile(user);
  }

  return data as ProfileRow;
}

export async function updateMyProfile(input: UpdateProfileInput) {
  const user = await getCurrentUser();
  await ensureMyProfile(user);

  const payload = pruneUndefined(input);

  if (Object.keys(payload).length === 0) {
    return getMyProfile();
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) {
    throw getProfileSetupError(
      error,
      "Não foi possível atualizar o perfil do usuário.",
    );
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
