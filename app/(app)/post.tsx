import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";

export default function PostScreen() {
  const [content, setContent] = useState("");

  return (
    <Screen className="justify-center px-4 py-5">
      <View className="mb-5 px-2">
        <Text className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Novo post
        </Text>
        <Text className="mt-3 text-3xl font-bold text-white">
          Enviar para a party
        </Text>
        <Text className="mt-2 text-base leading-6 text-slate-300">
          Depois vamos ligar esse formulário ao upload de imagem e ao backend.
        </Text>
      </View>

      <Card className="gap-4">
        <TextInput
          multiline
          placeholder="Escreva sua postagem..."
          placeholderTextColor="#64748b"
          value={content}
          onChangeText={setContent}
          className="min-h-40 rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-base text-white"
          textAlignVertical="top"
        />
        <PrimaryButton title="Publicar (em breve)" disabled />
      </Card>
    </Screen>
  );
}
