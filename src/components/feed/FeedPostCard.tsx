import { Alert, Image, Text, View } from "react-native";
import { router } from "expo-router";

import { PostComments } from "@/components/feed/PostComments";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useDeletePostMutation } from "@/hooks/usePosts";
import { useReactToPostMutation } from "@/hooks/usePostReactions";
import type { FeedPostRow } from "@/api/feed";

type FeedPostCardProps = {
  post: FeedPostRow;
  currentUserId?: string;
};

function getPartyName(post: FeedPostRow) {
  return post.party?.name ?? post.party_id;
}

function getAuthorName(post: FeedPostRow) {
  return post.author?.nickname ?? post.author?.username ?? "Membro da party";
}

export function FeedPostCard({ post, currentUserId }: FeedPostCardProps) {
  const reactToPostMutation = useReactToPostMutation(post.party_id);
  const deletePostMutation = useDeletePostMutation();
  const isOwnPost = currentUserId === post.author_id;

  const handleEdit = () => {
    router.push({
      pathname: "/(app)/post",
      params: {
        partyId: post.party_id,
        postId: post.id,
      },
    });
  };

  const handleDelete = () => {
    Alert.alert("Excluir post", "Esse post vai sair do feed da party.", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          deletePostMutation.mutate({
            postId: post.id,
            partyId: post.party_id,
          });
        },
      },
    ]);
  };

  return (
    <Card className="gap-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-3">
          <View className="flex-row items-center gap-3">
            {post.author?.avatar_url ? (
              <Image
                source={{ uri: post.author.avatar_url }}
                className="h-10 w-10 rounded-full border border-white/10"
              />
            ) : (
              <View className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-800">
                <Text className="text-sm font-semibold text-white">
                  {getAuthorName(post).slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {getAuthorName(post)}
              </Text>
              <Text className="mt-1 text-lg font-semibold text-white">
                {getPartyName(post)}
              </Text>
            </View>
          </View>
        </View>
        <Text className="text-xs text-slate-400">
          {new Date(post.created_at).toLocaleString("pt-BR")}
        </Text>
      </View>
      {post.text_content ? (
        <Text className="text-base leading-6 text-slate-200">
          {post.text_content}
        </Text>
      ) : null}
      {post.image_url ? (
        <View className="overflow-hidden rounded-2xl border border-white/10">
          <Image
            source={{ uri: post.image_url }}
            className="h-56 w-full"
            resizeMode="cover"
          />
        </View>
      ) : null}
      <View className="flex-row gap-4">
        <Text className="text-sm text-slate-300">Likes {post.like_count}</Text>
        <Text className="text-sm text-slate-300">
          Deslikes {post.dislike_count}
        </Text>
        <Text className="text-sm text-slate-300">
          Comentários {post.comment_count}
        </Text>
      </View>
      <View className="flex-row gap-3">
        <PrimaryButton
          title={reactToPostMutation.isPending ? "Curtindo..." : "Like"}
          variant="secondary"
          onPress={() =>
            reactToPostMutation.mutate({ postId: post.id, reaction: "like" })
          }
        />
        <PrimaryButton
          title={reactToPostMutation.isPending ? "Marcando..." : "Deslike"}
          variant="secondary"
          onPress={() =>
            reactToPostMutation.mutate({ postId: post.id, reaction: "dislike" })
          }
        />
        {isOwnPost ? (
          <>
            <PrimaryButton
              title="Editar"
              variant="secondary"
              onPress={handleEdit}
              disabled={deletePostMutation.isPending}
            />
            <PrimaryButton
              title={deletePostMutation.isPending ? "Excluindo..." : "Excluir"}
              variant="secondary"
              onPress={handleDelete}
              disabled={deletePostMutation.isPending}
            />
          </>
        ) : null}
      </View>
      <PostComments
        postId={post.id}
        partyId={post.party_id}
        currentUserId={currentUserId}
      />
    </Card>
  );
}
