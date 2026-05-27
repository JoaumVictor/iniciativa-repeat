import { supabase } from "@/api/supabaseClient";

export async function uploadProfileAvatar(filePath: string, file: File) {
  const { data, error } = await supabase.storage
    .from("profile-avatars")
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function uploadProfileBanner(filePath: string, file: File) {
  const { data, error } = await supabase.storage
    .from("profile-banners")
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function uploadPartyAvatar(filePath: string, file: File) {
  const { data, error } = await supabase.storage
    .from("party-avatars")
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function uploadPartyBanner(filePath: string, file: File) {
  const { data, error } = await supabase.storage
    .from("party-banners")
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function uploadPostMedia(filePath: string, file: File) {
  const { data, error } = await supabase.storage
    .from("post-media")
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return data;
}

export function getPublicAssetUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
