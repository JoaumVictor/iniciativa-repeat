import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  usePostComments,
  useUpdateCommentMutation,
} from "@/hooks/useComments";
import { getErrorMessage } from "@/utils/errors";

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

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
  currentUserId?: string;
};

export function PostComments({
  postId,
  partyId,
  currentUserId,
}: PostCommentsProps) {
  const [draft, setDraft] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const { data: comments = [], isLoading } = usePostComments(postId);
  const createCommentMutation = useCreateCommentMutation(postId, partyId);
  const updateCommentMutation = useUpdateCommentMutation(postId, partyId);
  const deleteCommentMutation = useDeleteCommentMutation(postId, partyId);

  const handleSubmit = async () => {
    if (!draft.trim()) return;

    setFeedback(null);

    try {
      await createCommentMutation.mutateAsync(draft.trim());
      setDraft("");
      setFeedback({
        type: "success",
        message: "Comentário enviado.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Não foi possível comentar."),
      });
    }
  };

  const handleStartEditing = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditingDraft(content);
  };

  const handleCancelEditing = () => {
    setEditingCommentId(null);
    setEditingDraft("");
  };

  const handleSaveEditing = async () => {
    if (!editingCommentId || !editingDraft.trim()) {
      return;
    }

    setFeedback(null);

    try {
      await updateCommentMutation.mutateAsync({
        commentId: editingCommentId,
        content: editingDraft.trim(),
      });
      handleCancelEditing();
      setFeedback({
        type: "success",
        message: "Comentário atualizado.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          error,
          "Não foi possível editar o comentário.",
        ),
      });
    }
  };

  const handleDelete = (commentId: string) => {
    Alert.alert("Excluir comentário", "Esse comentário vai sair do post.", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          void (async () => {
            setFeedback(null);

            try {
              await deleteCommentMutation.mutateAsync(commentId);
              setFeedback({
                type: "success",
                message: "Comentário excluído.",
              });
            } catch (error) {
              setFeedback({
                type: "error",
                message: getErrorMessage(
                  error,
                  "Não foi possível excluir o comentário.",
                ),
              });
            }
          })();
        },
      },
    ]);
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
            autoCapitalize="sentences"
            autoCorrect
            spellCheck
          />
          <PrimaryButton
            title={createCommentMutation.isPending ? "Enviando..." : "Comentar"}
            variant="secondary"
            onPress={handleSubmit}
            disabled={!draft.trim() || createCommentMutation.isPending}
          />
          {feedback ? (
            <Text
              className={`text-sm ${
                feedback.type === "success"
                  ? "text-emerald-300"
                  : "text-rose-300"
              }`}
            >
              {feedback.message}
            </Text>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <Card>
          <Text className="text-slate-300">Carregando comentários...</Text>
        </Card>
      ) : comments.length > 0 ? (
        <View className="gap-2">
          {comments.map((comment) => (
            <Card key={comment.id} className="gap-2 p-3">
              <Text className="text-xs uppercase tracking-[0.15em] text-slate-400">
                {getCommentAuthorName(comment.author)}
              </Text>
              {editingCommentId === comment.id ? (
                <View className="gap-2">
                  <TextInput
                    value={editingDraft}
                    onChangeText={setEditingDraft}
                    placeholder="Edite seu comentário"
                    placeholderTextColor="#64748b"
                    className="min-h-16 rounded-2xl border border-white/10 bg-slate-900 px-3 py-3 text-white"
                    multiline
                    autoCapitalize="sentences"
                    autoCorrect
                    spellCheck
                  />
                  <View className="flex-row gap-2">
                    <PrimaryButton
                      title={
                        updateCommentMutation.isPending
                          ? "Salvando..."
                          : "Salvar"
                      }
                      variant="secondary"
                      onPress={handleSaveEditing}
                      disabled={
                        updateCommentMutation.isPending || !editingDraft.trim()
                      }
                    />
                    <PrimaryButton
                      title="Cancelar"
                      variant="secondary"
                      onPress={handleCancelEditing}
                      disabled={updateCommentMutation.isPending}
                    />
                  </View>
                </View>
              ) : (
                <>
                  <Text className="text-sm leading-5 text-slate-200">
                    {comment.content}
                  </Text>
                  {currentUserId === comment.author_id ? (
                    <View className="flex-row gap-2">
                      <PrimaryButton
                        title="Editar"
                        variant="secondary"
                        onPress={() =>
                          handleStartEditing(comment.id, comment.content)
                        }
                        disabled={deleteCommentMutation.isPending}
                      />
                      <PrimaryButton
                        title={
                          deleteCommentMutation.isPending
                            ? "Excluindo..."
                            : "Excluir"
                        }
                        variant="secondary"
                        onPress={() => handleDelete(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                      />
                    </View>
                  ) : null}
                </>
              )}
            </Card>
          ))}
        </View>
      ) : (
        <Text className="text-sm text-slate-400">Sem comentários ainda.</Text>
      )}
    </View>
  );
}
