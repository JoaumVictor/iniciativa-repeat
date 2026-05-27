import { router } from "expo-router";
import { Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";

export default function HomeScreen() {
  const signOut = useAuthStore((state) => state.signOut);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <Screen className="gap-5 px-6 py-10">
      <View>
        <Text className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Área logada
        </Text>
        <Text className="mt-3 text-3xl font-bold text-white">
          Estrutura base ativa
        </Text>
        <Text className="mt-2 text-base leading-6 text-slate-300">
          Navegação, estado global e hooks já estão separados para escalar por
          módulos.
        </Text>
      </View>

      <Card className="gap-3">
        <Text className="text-lg font-semibold text-white">Sessão</Text>
        <Text className="text-sm text-slate-300">
          Autenticado: {isAuthenticated ? "sim" : "não"}
        </Text>
        <PrimaryButton
          title="Ir para itens"
          onPress={() => router.push("/(app)/items")}
        />
        <PrimaryButton
          title="Sair"
          onPress={handleLogout}
          variant="secondary"
        />
      </Card>
    </Screen>
  );
}
