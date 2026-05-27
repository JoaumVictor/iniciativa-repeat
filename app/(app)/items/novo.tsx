import { Text } from "react-native";

import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";

export default function NewItemScreen() {
  return (
    <Screen className="gap-4 px-6 py-10">
      <Text className="text-sm uppercase tracking-[0.3em] text-slate-400">
        Fluxo complementar
      </Text>
      <Text className="text-3xl font-bold text-white">Novo item</Text>
      <Card>
        <Text className="leading-6 text-slate-300">
          Esta rota existe como exemplo de fluxo paralelo dentro do mesmo
          módulo.
        </Text>
      </Card>
    </Screen>
  );
}
