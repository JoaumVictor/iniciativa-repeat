import { useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, TextInput, View } from "react-native";

import { createPost } from "@/api/posts";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useCreatePostMutation } from "@/hooks/usePosts";

export default function PostScreen() {
  const [content, setContent] = useState("");
  const params = useLocalSearchParams<{ partyId?: string }>();
  const partyId = useMemo(
    () => (Array.isArray(params.partyId) ? params.partyId[0] : params.partyId),
    [params.partyId],
  );
  const createPostMutation = useCreatePostMutation();

  const handlePublish = async () => {
    if (!partyId || !content.trim()) return;

    await createPostMutation.mutateAsync({
      party_id: partyId,
      text_content: content.trim(),
    });
    setContent("");
    router.back();
  };

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
        <Text className="text-xs uppercase tracking-[0.2em] text-slate-400">
          {partyId ? `Party ${partyId}` : "Selecione uma party"}
        </Text>
        <TextInput
          multiline
          placeholder="Escreva sua postagem..."
          placeholderTextColor="#64748b"
          value={content}
          onChangeText={setContent}
          className="min-h-40 rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-base text-white"
          textAlignVertical="top"
        />
        <PrimaryButton
          title={createPostMutation.isPending ? "Publicando..." : "Publicar"}
          onPress={handlePublish}
          disabled={!partyId || !content.trim() || createPostMutation.isPending}
        />
      </Card>
    </Screen>
  );
}
