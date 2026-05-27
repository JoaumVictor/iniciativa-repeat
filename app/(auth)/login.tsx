import { useState } from "react";
import { router } from "expo-router";
import { Image, Text, View } from "react-native";
import { Alert } from "react-native";

import { signInWithGoogle } from "@/api/auth";
import { appLogo } from "@/assets";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { isSupabaseConfigured, supabaseConfigMessage } from "@/config/env";

export default function LoginScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setIsSubmitting(true);

    try {
      const didAuthenticate = await signInWithGoogle();

      if (didAuthenticate) {
        router.replace("/(app)");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao iniciar login.";

      Alert.alert("Erro no login", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen className="justify-center px-6 py-10">
      <View className="mb-8">
        <Image
          source={appLogo}
          className="mb-6 h-16 w-40"
          resizeMode="contain"
        />
        <Text className="text-4xl font-bold text-white">Iniciativa Repeat</Text>
        <Text className="mt-3 text-base leading-6 text-slate-300">
          Entre com Google para conectar seu perfil, suas parties e seu feed de
          treino no Supabase.
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
        {!isSupabaseConfigured ? (
          <View className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <Text className="text-sm leading-6 text-amber-100">
              {supabaseConfigMessage}
            </Text>
          </View>
        ) : null}
        <PrimaryButton
          title={isSubmitting ? "Abrindo login..." : "Continuar com Google"}
          onPress={handleLogin}
          disabled={isSubmitting || !isSupabaseConfigured}
        />
      </Card>
    </Screen>
  );
}
