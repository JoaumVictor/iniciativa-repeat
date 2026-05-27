import { useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Image, Pressable, Text, TextInput, View } from "react-native";

import {
  getPublicAssetUrl,
  uploadProfileAvatarFromUri,
  uploadProfileBannerFromUri,
} from "@/api/storage";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useMyProfile, useUpdateMyProfileMutation } from "@/hooks/useProfile";
import type { GenderKind, GoalStatus } from "@/types/supabase";

const genderOptions: Array<{ label: string; value: GenderKind }> = [
  { label: "Masculino", value: "male" },
  { label: "Feminino", value: "female" },
  { label: "Não binário", value: "non_binary" },
  { label: "Outro", value: "other" },
  { label: "Prefiro não dizer", value: "prefer_not_to_say" },
];

const goalOptions: Array<{ label: string; value: GoalStatus }> = [
  { label: "Bulking", value: "bulking" },
  { label: "Cutting", value: "cutting" },
  { label: "Manutenção", value: "maintenance" },
  { label: "Recomp", value: "recomp" },
  { label: "Outro", value: "other" },
];

type ProfileFormState = {
  nickname: string;
  username: string;
  bio: string;
  gender: GenderKind | "";
  birth_date: string;
  height_cm: string;
  weight_kg: string;
  biceps_cm: string;
  chest_cm: string;
  waist_cm: string;
  thigh_cm: string;
  neck_cm: string;
  goal_status: GoalStatus | "";
};

function toInputValue(value: number | string | null | undefined) {
  return value == null ? "" : String(value);
}

function toNullableNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export default function ProfileScreen() {
  const { data: profile, isLoading } = useMyProfile();
  const updateProfileMutation = useUpdateMyProfileMutation();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileFormState>({
    nickname: "",
    username: "",
    bio: "",
    gender: "",
    birth_date: "",
    height_cm: "",
    weight_kg: "",
    biceps_cm: "",
    chest_cm: "",
    waist_cm: "",
    thigh_cm: "",
    neck_cm: "",
    goal_status: "",
  });

  useEffect(() => {
    if (!profile) return;

    setForm({
      nickname: profile.nickname ?? "",
      username: profile.username ?? "",
      bio: profile.bio ?? "",
      gender: profile.gender ?? "",
      birth_date: profile.birth_date ?? "",
      height_cm: toInputValue(profile.height_cm),
      weight_kg: toInputValue(profile.weight_kg),
      biceps_cm: toInputValue(profile.biceps_cm),
      chest_cm: toInputValue(profile.chest_cm),
      waist_cm: toInputValue(profile.waist_cm),
      thigh_cm: toInputValue(profile.thigh_cm),
      neck_cm: toInputValue(profile.neck_cm),
      goal_status: profile.goal_status ?? "",
    });
  }, [profile]);

  const bannerSource = useMemo(
    () => bannerUri ?? profile?.banner_url ?? null,
    [bannerUri, profile?.banner_url],
  );

  const avatarSource = useMemo(
    () => avatarUri ?? profile?.avatar_url ?? null,
    [avatarUri, profile?.avatar_url],
  );

  const handlePickImage = async (onSelected: (uri: string) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      onSelected(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    let nextAvatarUrl = profile.avatar_url ?? null;
    let nextBannerUrl = profile.banner_url ?? null;

    if (avatarUri) {
      const avatarPath = `${profile.id}/avatar.jpg`;
      await uploadProfileAvatarFromUri(avatarPath, avatarUri);
      nextAvatarUrl = getPublicAssetUrl("profile-avatars", avatarPath);
    }

    if (bannerUri) {
      const bannerPath = `${profile.id}/banner.jpg`;
      await uploadProfileBannerFromUri(bannerPath, bannerUri);
      nextBannerUrl = getPublicAssetUrl("profile-banners", bannerPath);
    }

    await updateProfileMutation.mutateAsync({
      nickname: form.nickname.trim() || null,
      username: form.username.trim() || null,
      bio: form.bio.trim() || null,
      gender: form.gender || null,
      birth_date: form.birth_date.trim() || null,
      height_cm: toNullableNumber(form.height_cm),
      weight_kg: toNullableNumber(form.weight_kg),
      biceps_cm: toNullableNumber(form.biceps_cm),
      chest_cm: toNullableNumber(form.chest_cm),
      waist_cm: toNullableNumber(form.waist_cm),
      thigh_cm: toNullableNumber(form.thigh_cm),
      neck_cm: toNullableNumber(form.neck_cm),
      goal_status: form.goal_status || null,
      avatar_url: nextAvatarUrl,
      banner_url: nextBannerUrl,
    });

    setAvatarUri(null);
    setBannerUri(null);
  };

  return (
    <Screen className="gap-5 px-4 py-5">
      <View className="px-2 pt-3">
        <Text className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Perfil
        </Text>
        <Text className="mt-3 text-3xl font-bold text-white">Minha conta</Text>
        <Text className="mt-2 text-base leading-6 text-slate-300">
          Dados pessoais, métricas e aparência do perfil.
        </Text>
      </View>

      <Card className="gap-4">
        {isLoading ? (
          <Text className="text-slate-300">Carregando perfil...</Text>
        ) : (
          <View className="gap-4">
            <View className="gap-3 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              {bannerSource ? (
                <Image
                  source={{ uri: bannerSource }}
                  className="h-36 w-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-36 w-full items-center justify-center bg-slate-900">
                  <Text className="text-slate-400">Banner do perfil</Text>
                </View>
              )}
              <View className="-mt-10 px-4 pb-4">
                {avatarSource ? (
                  <Image
                    source={{ uri: avatarSource }}
                    className="h-20 w-20 rounded-full border-4 border-slate-950"
                  />
                ) : (
                  <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-slate-950 bg-slate-800">
                    <Text className="text-lg font-semibold text-white">
                      {(profile?.nickname ?? profile?.username ?? "?")
                        .slice(0, 1)
                        .toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text className="mt-3 text-2xl font-bold text-white">
                  {profile?.nickname ?? profile?.username ?? "Sem nome"}
                </Text>
                <Text className="text-sm text-slate-300">
                  {profile?.email ?? "Email não carregado"}
                </Text>
                <Text className="text-sm text-slate-300">
                  Streak: {profile?.streak_days ?? 0} dias
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <PrimaryButton
                title="Trocar avatar"
                variant="secondary"
                onPress={() => handlePickImage(setAvatarUri)}
              />
              <PrimaryButton
                title="Trocar banner"
                variant="secondary"
                onPress={() => handlePickImage(setBannerUri)}
              />
            </View>

            <View className="gap-3">
              <Text className="text-lg font-semibold text-white">
                Dados básicos
              </Text>
              <TextInput
                value={form.nickname}
                onChangeText={(value) =>
                  setForm((state) => ({ ...state, nickname: value }))
                }
                placeholder="Apelido"
                placeholderTextColor="#64748b"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />
              <TextInput
                value={form.username}
                onChangeText={(value) =>
                  setForm((state) => ({ ...state, username: value }))
                }
                placeholder="Nome de usuário"
                placeholderTextColor="#64748b"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />
              <TextInput
                value={form.bio}
                onChangeText={(value) =>
                  setForm((state) => ({ ...state, bio: value }))
                }
                placeholder="Recado / bio"
                placeholderTextColor="#64748b"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                multiline
              />
              <View className="gap-2">
                <Text className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  Sexo
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {genderOptions.map((option) => {
                    const active = form.gender === option.value;

                    return (
                      <Pressable
                        key={option.value}
                        onPress={() =>
                          setForm((state) => ({
                            ...state,
                            gender: option.value,
                          }))
                        }
                        className={`rounded-full border px-3 py-2 ${
                          active
                            ? "border-emerald-400 bg-emerald-500/20"
                            : "border-white/10 bg-slate-900"
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            active ? "text-emerald-200" : "text-slate-300"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <TextInput
                value={form.birth_date}
                onChangeText={(value) =>
                  setForm((state) => ({ ...state, birth_date: value }))
                }
                placeholder="Aniversário YYYY-MM-DD"
                placeholderTextColor="#64748b"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />
            </View>

            <View className="gap-3">
              <Text className="text-lg font-semibold text-white">Métricas</Text>
              <TextInput
                value={form.height_cm}
                onChangeText={(value) =>
                  setForm((state) => ({ ...state, height_cm: value }))
                }
                placeholder="Altura (cm)"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />
              <TextInput
                value={form.weight_kg}
                onChangeText={(value) =>
                  setForm((state) => ({ ...state, weight_kg: value }))
                }
                placeholder="Peso (kg)"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />
              <TextInput
                value={form.biceps_cm}
                onChangeText={(value) =>
                  setForm((state) => ({ ...state, biceps_cm: value }))
                }
                placeholder="Bíceps (cm)"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />
              <TextInput
                value={form.chest_cm}
                onChangeText={(value) =>
                  setForm((state) => ({ ...state, chest_cm: value }))
                }
                placeholder="Peitoral (cm)"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />
              <TextInput
                value={form.waist_cm}
                onChangeText={(value) =>
                  setForm((state) => ({ ...state, waist_cm: value }))
                }
                placeholder="Cintura (cm)"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />
              <TextInput
                value={form.thigh_cm}
                onChangeText={(value) =>
                  setForm((state) => ({ ...state, thigh_cm: value }))
                }
                placeholder="Coxa (cm)"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />
              <TextInput
                value={form.neck_cm}
                onChangeText={(value) =>
                  setForm((state) => ({ ...state, neck_cm: value }))
                }
                placeholder="Pescoço (cm)"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />
              <View className="gap-2">
                <Text className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  Objetivo
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {goalOptions.map((option) => {
                    const active = form.goal_status === option.value;

                    return (
                      <Pressable
                        key={option.value}
                        onPress={() =>
                          setForm((state) => ({
                            ...state,
                            goal_status: option.value,
                          }))
                        }
                        className={`rounded-full border px-3 py-2 ${
                          active
                            ? "border-cyan-400 bg-cyan-500/20"
                            : "border-white/10 bg-slate-900"
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            active ? "text-cyan-200" : "text-slate-300"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <PrimaryButton
              title={
                updateProfileMutation.isPending
                  ? "Salvando..."
                  : "Salvar perfil"
              }
              onPress={handleSave}
              disabled={updateProfileMutation.isPending}
            />
          </View>
        )}
        <PrimaryButton
          title="Minhas parties"
          variant="secondary"
          onPress={() => router.push("/(app)/party")}
        />
      </Card>

      <Card className="gap-3">
        <Text className="text-lg font-semibold text-white">Dados do corpo</Text>
        <Text className="text-sm leading-6 text-slate-300">
          Aqui vamos editar altura, peso, bíceps, peitoral, cintura, coxa,
          pescoço e status de bulking/cutting.
        </Text>
      </Card>
    </Screen>
  );
}
