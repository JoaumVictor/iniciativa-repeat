import { useState } from "react";
import { Text, View } from "react-native";

import { signInWithGoogle } from "@/api/auth";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";

export default function LoginScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setIsSubmitting(true);

    try {
      await signInWithGoogle();
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
        <Text className="text-lg font-semibold text-white">
          Entrar com Google
        </Text>
        <Text className="text-sm leading-5 text-slate-300">
          O login será vinculado ao perfil do Supabase assim que as chaves forem
          configuradas.
        </Text>
        <PrimaryButton
          title={isSubmitting ? "Abrindo login..." : "Continuar com Google"}
          onPress={handleLogin}
          disabled={isSubmitting}
        />
      </Card>
    </Screen>
  );
}
