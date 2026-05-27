import { Link } from "expo-router";
import { Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Item } from "@/types/item";

type ItemCardProps = {
  item: Item;
};

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/(app)/items/${item.id}`} asChild>
      <Card className="gap-2">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-lg font-semibold text-white">
            {item.title}
          </Text>
          <Text className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200">
            {item.status}
          </Text>
        </View>
        <Text className="text-sm leading-5 text-slate-300">
          {item.description}
        </Text>
        <Text className="text-xs text-slate-400">
          Atualizado em {item.updatedAtLabel}
        </Text>
      </Card>
    </Link>
  );
}
