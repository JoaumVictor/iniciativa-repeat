import { router } from "expo-router";
import { Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useMyProfile } from "@/hooks/useProfile";

export default function ProfileScreen() {
  const { data: profile, isLoading } = useMyProfile();

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
          <View className="gap-2">
            <Text className="text-2xl font-bold text-white">
              {profile?.nickname ?? profile?.username ?? "Sem nome"}
            </Text>
            <Text className="text-sm text-slate-300">
              {profile?.email ?? "Email não carregado"}
            </Text>
            <Text className="text-sm text-slate-300">
              Streak: {profile?.streak_days ?? 0} dias
            </Text>
          </View>
        )}
        <PrimaryButton title="Editar perfil (em breve)" disabled />
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
