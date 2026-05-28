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
import { getErrorMessage } from "@/utils/errors";

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

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

function toBirthDateInputValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}

function toMaskedMeasureValue(value: number | string | null | undefined) {
  if (value == null || value === "") {
    return "";
  }

  return String(value).replace(".", ",");
}

function normalizeNickname(value: string) {
  return value.replace(/\s{2,}/g, " ").slice(0, 40);
}

function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._]/g, "")
    .slice(0, 24);
}

function normalizeBio(value: string) {
  return value.slice(0, 180);
}

function formatBirthDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function toIsoBirthDate(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 8) {
    return null;
  }

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return `${year}-${month}-${day}`;
}

function formatMeasureInput(value: string, maxIntegerDigits = 3) {
  const sanitized = value.replace(/[^\d,.]/g, "").replace(/\./g, ",");
  const hasSeparator = sanitized.includes(",");
  const [integerPart = "", ...decimalParts] = sanitized.split(",");
  const integer = integerPart.slice(0, maxIntegerDigits);
  const decimal = decimalParts.join("").slice(0, 1);

  if (hasSeparator && integer) {
    return `${integer},${decimal}`;
  }

  return integer;
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
  const {
    data: profile,
    isLoading,
    error: profileError,
    refetch,
  } = useMyProfile();
  const updateProfileMutation = useUpdateMyProfileMutation();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
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
      birth_date: toBirthDateInputValue(profile.birth_date),
      height_cm: toMaskedMeasureValue(profile.height_cm),
      weight_kg: toMaskedMeasureValue(profile.weight_kg),
      biceps_cm: toMaskedMeasureValue(profile.biceps_cm),
      chest_cm: toMaskedMeasureValue(profile.chest_cm),
      waist_cm: toMaskedMeasureValue(profile.waist_cm),
      thigh_cm: toMaskedMeasureValue(profile.thigh_cm),
      neck_cm: toMaskedMeasureValue(profile.neck_cm),
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
    setFeedback(null);

    try {
      const savedProfile = await updateProfileMutation.mutateAsync({
        nickname: form.nickname.trim() || null,
        username: form.username.trim() || null,
        bio: form.bio.trim() || null,
        gender: form.gender || null,
        birth_date: toIsoBirthDate(form.birth_date),
        height_cm: toNullableNumber(form.height_cm),
        weight_kg: toNullableNumber(form.weight_kg),
        biceps_cm: toNullableNumber(form.biceps_cm),
        chest_cm: toNullableNumber(form.chest_cm),
        waist_cm: toNullableNumber(form.waist_cm),
        thigh_cm: toNullableNumber(form.thigh_cm),
        neck_cm: toNullableNumber(form.neck_cm),
        goal_status: form.goal_status || null,
      });

      const assetUpdates: {
        avatar_url?: string | null;
        banner_url?: string | null;
      } = {};

      if (avatarUri) {
        const avatarPath = `${savedProfile.id}/avatar.jpg`;
        await uploadProfileAvatarFromUri(avatarPath, avatarUri);
        assetUpdates.avatar_url = getPublicAssetUrl(
          "profile-avatars",
          avatarPath,
        );
      }

      if (bannerUri) {
        const bannerPath = `${savedProfile.id}/banner.jpg`;
        await uploadProfileBannerFromUri(bannerPath, bannerUri);
        assetUpdates.banner_url = getPublicAssetUrl(
          "profile-banners",
          bannerPath,
        );
      }

      if (Object.keys(assetUpdates).length > 0) {
        await updateProfileMutation.mutateAsync(assetUpdates);
      }

      setAvatarUri(null);
      setBannerUri(null);
      setFeedback({
        type: "success",
        message: "Perfil salvo com sucesso.",
      });
      await refetch();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          error,
          "Não foi possível salvar o perfil. Verifique a configuração do Supabase.",
        ),
      });
    }
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
        {feedback ? (
          <View
            className={`mt-4 rounded-2xl border px-4 py-3 ${
              feedback.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-rose-500/30 bg-rose-500/10"
            }`}
          >
            <Text
              className={`text-sm leading-6 ${
                feedback.type === "success"
                  ? "text-emerald-200"
                  : "text-rose-200"
              }`}
            >
              {feedback.message}
            </Text>
          </View>
        ) : null}
        {!feedback && profileError ? (
          <View className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <Text className="text-sm leading-6 text-amber-100">
              {getErrorMessage(
                profileError,
                "Não foi possível carregar o perfil.",
              )}
            </Text>
          </View>
        ) : null}
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
                  setForm((state) => ({
                    ...state,
                    nickname: normalizeNickname(value),
                  }))
                }
                placeholder="Apelido"
                placeholderTextColor="#64748b"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                autoCapitalize="words"
                autoCorrect
                spellCheck
                maxLength={40}
              />
              <TextInput
                value={form.username}
                onChangeText={(value) =>
                  setForm((state) => ({
                    ...state,
                    username: normalizeUsername(value),
                  }))
                }
                placeholder="Nome de usuário"
                placeholderTextColor="#64748b"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                maxLength={24}
              />
              <TextInput
                value={form.bio}
                onChangeText={(value) =>
                  setForm((state) => ({
                    ...state,
                    bio: normalizeBio(value),
                  }))
                }
                placeholder="Recado / bio"
                placeholderTextColor="#64748b"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                multiline
                autoCapitalize="sentences"
                autoCorrect
                spellCheck
                maxLength={180}
                textAlignVertical="top"
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
                  setForm((state) => ({
                    ...state,
                    birth_date: formatBirthDateInput(value),
                  }))
                }
                placeholder="Nascimento DD/MM/AAAA"
                placeholderTextColor="#64748b"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>

            <View className="gap-3">
              <Text className="text-lg font-semibold text-white">Métricas</Text>
              <TextInput
                value={form.height_cm}
                onChangeText={(value) =>
                  setForm((state) => ({
                    ...state,
                    height_cm: formatMeasureInput(value),
                  }))
                }
                placeholder="Altura (cm)"
                placeholderTextColor="#64748b"
                keyboardType="decimal-pad"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                maxLength={5}
              />
              <TextInput
                value={form.weight_kg}
                onChangeText={(value) =>
                  setForm((state) => ({
                    ...state,
                    weight_kg: formatMeasureInput(value),
                  }))
                }
                placeholder="Peso (kg)"
                placeholderTextColor="#64748b"
                keyboardType="decimal-pad"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                maxLength={5}
              />
              <TextInput
                value={form.biceps_cm}
                onChangeText={(value) =>
                  setForm((state) => ({
                    ...state,
                    biceps_cm: formatMeasureInput(value),
                  }))
                }
                placeholder="Bíceps (cm)"
                placeholderTextColor="#64748b"
                keyboardType="decimal-pad"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                maxLength={5}
              />
              <TextInput
                value={form.chest_cm}
                onChangeText={(value) =>
                  setForm((state) => ({
                    ...state,
                    chest_cm: formatMeasureInput(value),
                  }))
                }
                placeholder="Peitoral (cm)"
                placeholderTextColor="#64748b"
                keyboardType="decimal-pad"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                maxLength={5}
              />
              <TextInput
                value={form.waist_cm}
                onChangeText={(value) =>
                  setForm((state) => ({
                    ...state,
                    waist_cm: formatMeasureInput(value),
                  }))
                }
                placeholder="Cintura (cm)"
                placeholderTextColor="#64748b"
                keyboardType="decimal-pad"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                maxLength={5}
              />
              <TextInput
                value={form.thigh_cm}
                onChangeText={(value) =>
                  setForm((state) => ({
                    ...state,
                    thigh_cm: formatMeasureInput(value),
                  }))
                }
                placeholder="Coxa (cm)"
                placeholderTextColor="#64748b"
                keyboardType="decimal-pad"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                maxLength={5}
              />
              <TextInput
                value={form.neck_cm}
                onChangeText={(value) =>
                  setForm((state) => ({
                    ...state,
                    neck_cm: formatMeasureInput(value),
                  }))
                }
                placeholder="Pescoço (cm)"
                placeholderTextColor="#64748b"
                keyboardType="decimal-pad"
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                maxLength={5}
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
              disabled={updateProfileMutation.isPending || isLoading}
            />
            {profileError ? (
              <PrimaryButton
                title="Tentar carregar novamente"
                variant="secondary"
                onPress={() => {
                  setFeedback(null);
                  void refetch();
                }}
                disabled={updateProfileMutation.isPending}
              />
            ) : null}
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
