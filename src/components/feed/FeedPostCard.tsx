import { Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PostRow } from "@/types/supabase";

type FeedPostCardProps = {
  post: PostRow;
};

export function FeedPostCard({ post }: FeedPostCardProps) {
  return (
    <Card className="gap-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Party
          </Text>
          <Text className="mt-1 text-lg font-semibold text-white">
            {post.party_id}
          </Text>
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
      <View className="flex-row gap-4">
        <Text className="text-sm text-slate-300">Likes {post.like_count}</Text>
        <Text className="text-sm text-slate-300">
          Deslikes {post.dislike_count}
        </Text>
        <Text className="text-sm text-slate-300">
          Comentários {post.comment_count}
        </Text>
      </View>
    </Card>
  );
}
