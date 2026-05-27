import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useCreateCommentMutation, usePostComments } from "@/hooks/useComments";

function getCommentAuthorName(
  author: { nickname: string | null; username: string | null } | null,
) {
  if (!author) {
    return "Membro da party";
  }

  return author.nickname ?? author.username ?? "Membro da party";
}

type PostCommentsProps = {
  postId: string;
  partyId?: string;
};

export function PostComments({ postId, partyId }: PostCommentsProps) {
  const [draft, setDraft] = useState("");
  const { data: comments = [], isLoading } = usePostComments(postId);
  const createCommentMutation = useCreateCommentMutation(postId, partyId);

  const handleSubmit = async () => {
    if (!draft.trim()) return;

    await createCommentMutation.mutateAsync(draft.trim());
    setDraft("");
  };

  return (
    <View className="gap-3">
      <View className="gap-2">
        <Text className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Comentários
        </Text>
        <View className="gap-2 rounded-2xl border border-white/10 bg-slate-900 px-3 py-3">
          <TextInput
            placeholder="Escreva um comentário..."
            placeholderTextColor="#64748b"
            value={draft}
            onChangeText={setDraft}
            className="min-h-16 text-base text-white"
            multiline
          />
          <PrimaryButton
            title={createCommentMutation.isPending ? "Enviando..." : "Comentar"}
            variant="secondary"
            onPress={handleSubmit}
            disabled={!draft.trim() || createCommentMutation.isPending}
          />
        </View>
      </View>

      {isLoading ? (
        <Card>
          <Text className="text-slate-300">Carregando comentários...</Text>
        </Card>
      ) : comments.length > 0 ? (
        <View className="gap-2">
          {comments.map((comment) => (
            <Card key={comment.id} className="gap-1 p-3">
              <Text className="text-xs uppercase tracking-[0.15em] text-slate-400">
                {getCommentAuthorName(comment.author)}
              </Text>
              <Text className="text-sm leading-5 text-slate-200">
                {comment.content}
              </Text>
            </Card>
          ))}
        </View>
      ) : (
        <Text className="text-sm text-slate-400">Sem comentários ainda.</Text>
      )}
    </View>
  );
}
