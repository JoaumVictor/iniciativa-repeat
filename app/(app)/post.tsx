import { useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Text, TextInput, View } from "react-native";

import { getPublicAssetUrl, uploadPostMediaFromUri } from "@/api/storage";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import {
  useCreatePostMutation,
  usePostDetail,
  useUpdatePostMutation,
} from "@/hooks/usePosts";

export default function PostScreen() {
  const [content, setContent] = useState("");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const params = useLocalSearchParams<{ partyId?: string; postId?: string }>();
  const partyId = useMemo(
    () => (Array.isArray(params.partyId) ? params.partyId[0] : params.partyId),
    [params.partyId],
  );
  const postId = useMemo(
    () => (Array.isArray(params.postId) ? params.postId[0] : params.postId),
    [params.postId],
  );
  const isEditing = Boolean(postId);
  const createPostMutation = useCreatePostMutation();
  const updatePostMutation = useUpdatePostMutation();
  const { data: post, isLoading: isPostLoading } = usePostDetail(postId ?? "");

  useEffect(() => {
    if (!postId || !post) {
      return;
    }

    setContent(post.text_content ?? "");
    setExistingImageUrl(post.image_url ?? null);
    setSelectedImageUri(null);
  }, [post, postId]);

  const previewImageUri = selectedImageUri ?? existingImageUrl;

  const handlePickImage = async () => {
    setIsPickingImage(true);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } finally {
      setIsPickingImage(false);
    }
  };

  const handlePublish = async () => {
    if (!partyId || !content.trim()) return;

    let imageUrl: string | undefined = existingImageUrl ?? undefined;

    if (selectedImageUri) {
      const fileName = `${partyId}/${Date.now().toString(36)}.jpg`;
      await uploadPostMediaFromUri(fileName, selectedImageUri);
      imageUrl = getPublicAssetUrl("post-media", fileName);
    }

    if (isEditing && postId) {
      await updatePostMutation.mutateAsync({
        postId,
        input: {
          party_id: partyId,
          text_content: content.trim(),
          image_url: imageUrl,
        },
      });
    } else {
      await createPostMutation.mutateAsync({
        party_id: partyId,
        text_content: content.trim(),
        image_url: imageUrl,
      });
    }

    setContent("");
    setSelectedImageUri(null);
    setExistingImageUrl(null);
    router.back();
  };

  const isSaving = createPostMutation.isPending || updatePostMutation.isPending;

  return (
    <Screen className="justify-center px-4 py-5">
      <View className="mb-5 px-2">
        <Text className="text-sm uppercase tracking-[0.3em] text-slate-400">
          {isEditing ? "Editar post" : "Novo post"}
        </Text>
        <Text className="mt-3 text-3xl font-bold text-white">
          {isEditing ? "Ajustar publicação" : "Enviar para a party"}
        </Text>
        <Text className="mt-2 text-base leading-6 text-slate-300">
          {isEditing
            ? "Edite o texto e troque a imagem quando precisar."
            : "Depois vamos ligar esse formulário ao upload de imagem e ao backend."}
        </Text>
      </View>

      <Card className="gap-4">
        {isEditing && isPostLoading ? (
          <Text className="text-slate-300">Carregando post...</Text>
        ) : null}
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
          editable={!isPostLoading}
        />
        {previewImageUri ? (
          <View className="overflow-hidden rounded-2xl border border-white/10">
            <Image
              source={{ uri: previewImageUri }}
              style={{ width: "100%", height: 220 }}
              resizeMode="cover"
            />
          </View>
        ) : null}
        <PrimaryButton
          title={isPickingImage ? "Abrindo galeria..." : "Adicionar foto"}
          variant="secondary"
          onPress={handlePickImage}
          disabled={isPickingImage || isSaving || isPostLoading}
        />
        <PrimaryButton
          title={
            isSaving
              ? isEditing
                ? "Salvando..."
                : "Publicando..."
              : isEditing
                ? "Salvar alterações"
                : "Publicar"
          }
          onPress={handlePublish}
          disabled={!partyId || !content.trim() || isSaving || isPostLoading}
        />
      </Card>
    </Screen>
  );
}
