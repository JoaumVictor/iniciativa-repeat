import { Text, View } from "react-native";

import { ItemCard } from "@/components/items/ItemCard";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { useItemsQuery } from "@/hooks/useItems";

export default function ItemsScreen() {
  const { data: items = [], isLoading, isError } = useItemsQuery();

  return (
    <Screen className="gap-4 px-6 py-10">
      <View>
        <Text className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Módulo exemplo
        </Text>
        <Text className="mt-3 text-3xl font-bold text-white">Itens</Text>
        <Text className="mt-2 text-base leading-6 text-slate-300">
          Listagem com detalhe, feita para demonstrar a arquitetura replicável.
        </Text>
      </View>

      {isLoading ? (
        <Card>
          <Text className="text-slate-300">Carregando itens...</Text>
        </Card>
      ) : null}

      {isError ? (
        <Card>
          <Text className="text-red-300">
            Não foi possível carregar os itens.
          </Text>
        </Card>
      ) : null}

      <View className="gap-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </View>
    </Screen>
  );
}
