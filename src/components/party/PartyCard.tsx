import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { PartyRow } from "@/types/supabase";

type PartyCardProps = {
  party: PartyRow;
  isFavorite?: boolean;
  onFavorite?: (partyId: string) => void;
  onUnfavorite?: (partyId: string) => void;
};

export function PartyCard({
  party,
  isFavorite = false,
  onFavorite,
  onUnfavorite,
}: PartyCardProps) {
  return (
    <Card className="gap-4">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Party
          </Text>
          <Text className="mt-1 text-xl font-bold text-white">
          <View className="flex-row gap-3">
            <Link href={`/(app)/party/${party.id}`} asChild>
              <PrimaryButton title="Abrir" variant="secondary" />
            </Link>
            <PrimaryButton
              title={isFavorite ? "Favoritada" : "Favoritar"}
              variant={isFavorite ? "secondary" : "primary"}
              onPress={() => (isFavorite ? onUnfavorite?.(party.id) : onFavorite?.(party.id))}
            />
          </View>
        </View>
        <View className="rounded-full bg-white/10 p-2">
          <MaterialCommunityIcons
            name={isFavorite ? "star" : "star-outline"}
            size={18}
            color="#fbbf24"
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        <PrimaryButton
          title={isFavorite ? "Favoritada" : "Favoritar"}
          variant={isFavorite ? "secondary" : "primary"}
          onPress={() =>
            isFavorite ? onUnfavorite?.(party.id) : onFavorite?.(party.id)
          }
        />
      </View>
    </Card>
  );
}
