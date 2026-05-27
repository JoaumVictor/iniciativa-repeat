import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useItemQuery } from "@/hooks/useItems";

export default function ItemDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: item, isLoading, isError } = useItemQuery(id ?? "");

  return (
    <Screen className="gap-4 px-6 py-10">
      <Link href="/(app)/items" asChild>
        <PrimaryButton title="Voltar" variant="secondary" />
      </Link>

      {isLoading ? (
        <Card>
          <Text className="text-slate-300">Carregando detalhe...</Text>
        </Card>
      ) : null}

      {isError ? (
        <Card>
          <Text className="text-red-300">Item não encontrado.</Text>
        </Card>
      ) : null}

      {item ? (
        <Card className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-white">{item.title}</Text>
            <Text className="rounded-full bg-accent-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-50">
              {item.status}
            </Text>
          </View>
          <Text className="text-base leading-6 text-slate-300">
            {item.description}
          </Text>
          <Text className="text-sm text-slate-400">
            Atualizado em {item.updatedAtLabel}
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}
