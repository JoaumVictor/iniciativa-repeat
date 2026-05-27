import { useState } from "react";
import { router } from "expo-router";
import { Text, View } from "react-native";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/store/authStore";

export default function LoginScreen() {
  const signIn = useAuthStore((state) => state.signIn);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setIsSubmitting(true);

    try {
      await signIn({
        accessToken: "demo-access-token",
        refreshToken: "demo-refresh-token",
      });
      router.replace("/(app)");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen className="justify-center px-6 py-10">
      <View className="mb-8">
        <Text className="text-4xl font-bold text-white">Base de app</Text>
        <Text className="mt-3 text-base leading-6 text-slate-300">
          Estrutura pronta com Expo Router, NativeWind, React Query e Zustand.
        </Text>
      </View>

      <Card className="gap-4">
        <Text className="text-lg font-semibold text-white">Entrar</Text>
        <Text className="text-sm leading-5 text-slate-300">
          Esta tela usa uma sessão demo local para habilitar o fluxo protegido.
        </Text>
        <PrimaryButton
          title={isSubmitting ? "Entrando..." : "Acessar app"}
          onPress={handleLogin}
          disabled={isSubmitting}
        />
      </Card>
    </Screen>
  );
}
