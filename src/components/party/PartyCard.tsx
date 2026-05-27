import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Image, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { PartyRow } from "@/types/supabase";

type PartyCardProps = {
  party: PartyRow;
  isFavorite?: boolean;
  favoriteBusy?: boolean;
  onFavorite?: (partyId: string) => void;
  onUnfavorite?: (partyId: string) => void;
};

function getSafeColor(value: string | null | undefined, fallback: string) {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value ?? "")
    ? (value as string)
    : fallback;
}

export function PartyCard({
  party,
  isFavorite = false,
  favoriteBusy = false,
  onFavorite,
  onUnfavorite,
}: PartyCardProps) {
  const backgroundColor = getSafeColor(party.theme_background_color, "#0f172a");
  const postCardColor = getSafeColor(party.post_card_color, "#1e293b");

  return (
    <Card className="gap-4">
      <View className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950">
        {party.banner_url ? (
          <Image
            source={{ uri: party.banner_url }}
            className="h-32 w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-32 w-full" style={{ backgroundColor }} />
        )}
        <View className="absolute inset-0 bg-slate-950/25" />
        <View className="absolute inset-x-0 top-0 flex-row items-start justify-between p-4">
          <View className="rounded-full border border-white/10 bg-black/20 px-3 py-2">
            <Text className="text-xs uppercase tracking-[0.15em] text-slate-100">
              {party.is_private ? "Privada" : "Aberta"}
            </Text>
          </View>
          <View className="rounded-full border border-white/10 bg-black/20 p-2">
            <MaterialCommunityIcons
              name={isFavorite ? "star" : "star-outline"}
              size={18}
              color="#fbbf24"
            />
          </View>
        </View>

        <View className="absolute inset-x-0 bottom-0 flex-row items-end gap-4 p-4">
          {party.avatar_url ? (
            <Image
              source={{ uri: party.avatar_url }}
              className="h-18 w-18 rounded-[24px] border-2 border-white/20"
            />
          ) : (
            <View
              className="h-18 w-18 items-center justify-center rounded-[24px] border-2 border-white/20"
              style={{ backgroundColor: postCardColor }}
            >
              <Text className="text-2xl font-bold text-white">
                {party.name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="flex-1 gap-1">
            <Text className="text-xs uppercase tracking-[0.2em] text-slate-200">
              Party
            </Text>
            <Text className="text-2xl font-bold text-white">{party.name}</Text>
          </View>
        </View>
      </View>

      <View className="gap-3 px-1">
        <Text className="text-sm leading-6 text-slate-300">
          {party.description ??
            "Sem descrição ainda. Use essa party para reunir a turma e registrar evolução."}
        </Text>

        <View className="flex-row flex-wrap gap-2">
          <View className="rounded-full border border-white/10 bg-slate-900 px-3 py-2">
            <Text className="text-xs uppercase tracking-[0.15em] text-slate-300">
              Código {party.invite_code}
            </Text>
          </View>
          <View className="rounded-full border border-white/10 bg-slate-900 px-3 py-2">
            <Text className="text-xs uppercase tracking-[0.15em] text-slate-300">
              Fundo {party.theme_background_color}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <Link href={`/(app)/party/${party.id}`} asChild>
            <PrimaryButton title="Abrir" variant="secondary" />
          </Link>
          <PrimaryButton
            title={
              favoriteBusy
                ? "Salvando..."
                : isFavorite
                  ? "Favoritada"
                  : "Favoritar"
            }
            variant={isFavorite ? "secondary" : "primary"}
            onPress={() =>
              isFavorite ? onUnfavorite?.(party.id) : onFavorite?.(party.id)
            }
            disabled={favoriteBusy}
          />
        </View>
      </View>
    </Card>
  );
}
