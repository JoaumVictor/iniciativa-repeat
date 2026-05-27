import { router } from "expo-router";
import { Text, View } from "react-native";

import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useMyFeedPosts } from "@/hooks/useFeed";
import { useMyProfile } from "@/hooks/useProfile";

export default function HomeScreen() {
  const { data: posts = [], isLoading } = useMyFeedPosts();
  const { data: profile } = useMyProfile();

  return (
    <Screen className="gap-5 px-4 py-5">
      <View className="px-2 pt-3">
        <Text className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Iniciativa Repeat
        </Text>
        <Text className="mt-3 text-3xl font-bold text-white">
          Feed da turma
        </Text>
        <Text className="mt-2 text-base leading-6 text-slate-300">
          Postagens das parties que você participa, com likes, deslikes e
          comentários.
        </Text>
        <View className="mt-4 flex-row gap-3">
          <PrimaryButton
            title="Ver parties"
            variant="secondary"
            onPress={() => router.push("/(app)/party")}
          />
        </View>
      </View>

      {isLoading ? (
        <Card>
          <Text className="text-slate-300">Carregando feed...</Text>
        </Card>
      ) : posts.length > 0 ? (
        <View className="gap-3">
          {posts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              currentUserId={profile?.id}
            />
          ))}
        </View>
      ) : (
        <Card className="gap-4">
          <Text className="text-lg font-semibold text-white">
            Seu feed ainda est\u00e1 vazio
          </Text>
          <Text className="text-sm leading-6 text-slate-300">
            Entre em uma party ou crie a sua primeira comunidade para come\u00e7ar
            a postar e acompanhar a turma.
          </Text>
          <View className="flex-row gap-3">
            <PrimaryButton
              title="Ir para parties"
              onPress={() => router.push("/(app)/party")}
            />
          </View>
        </Card>
      )}
    </Screen>
  );
}
