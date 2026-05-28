import { useMemo } from "react";
import { router } from "expo-router";
import { Image, Text, View } from "react-native";

import { appLogo, appSplash } from "@/assets";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { isSupabaseConfigured, supabaseConfigMessage } from "@/config/env";
import { useMyFeedPosts } from "@/hooks/useFeed";
import { useMyProfile } from "@/hooks/useProfile";

export default function HomeScreen() {
  const { data: posts = [], isLoading } = useMyFeedPosts();
  const { data: profile } = useMyProfile();
  const stats = useMemo(() => {
    const uniquePartyCount = new Set(posts.map((post) => post.party_id)).size;
    const latestPostDate = posts[0]?.created_at
      ? new Date(posts[0].created_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        })
      : "sem posts";

    return {
      uniquePartyCount,
      latestPostDate,
    };
  }, [posts]);

  return (
    <Screen className="gap-5 px-4 py-5">
      <View className="px-2 pt-3">
        <Text className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Iniciativa Repeat
        </Text>
      </View>

      <View className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950">
        <Image
          source={appSplash}
          className="absolute inset-0 h-full w-full opacity-20"
          resizeMode="cover"
        />
        <View className="absolute -right-10 -top-8 h-40 w-40 rounded-full bg-emerald-500/20" />
        <View className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-cyan-500/20" />
        <View className="gap-5 p-6">
          <View className="gap-2">
            <Image
              source={appLogo}
              className="mb-3 h-10 w-32"
              resizeMode="contain"
            />
            <Text className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Feed da turma
            </Text>
            <Text className="text-4xl font-bold text-white">
              {profile?.nickname ?? profile?.username ?? "Atleta"}, sua crew já
              treinou hoje?
            </Text>
            <Text className="max-w-[320px] text-base leading-6 text-slate-300">
              Acompanhe posts das suas parties, puxe conversa no comentário e
              mantenha o ritmo da semana visível para todo mundo.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-28 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <Text className="text-xs uppercase tracking-[0.15em] text-slate-400">
                Posts no radar
              </Text>
              <Text className="mt-2 text-2xl font-bold text-white">
                {posts.length}
              </Text>
            </View>
            <View className="min-w-28 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <Text className="text-xs uppercase tracking-[0.15em] text-slate-400">
                Parties ativas
              </Text>
              <Text className="mt-2 text-2xl font-bold text-white">
                {stats.uniquePartyCount}
              </Text>
            </View>
            <View className="min-w-28 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <Text className="text-xs uppercase tracking-[0.15em] text-slate-400">
                Último movimento
              </Text>
              <Text className="mt-2 text-2xl font-bold text-white">
                {stats.latestPostDate}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <PrimaryButton
              title="Ver parties"
              onPress={() => router.push("/(app)/party")}
            />
            <PrimaryButton
              title="Perfil"
              variant="secondary"
              onPress={() => router.push("/(app)/profile")}
            />
          </View>
        </View>
      </View>

      {!isSupabaseConfigured ? (
        <Card className="gap-4">
          <Text className="text-lg font-semibold text-white">
            Backend aguardando configuração
          </Text>
          <Text className="text-sm leading-6 text-slate-300">
            {supabaseConfigMessage}
          </Text>
        </Card>
      ) : isLoading ? (
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
            Seu feed ainda está vazio
          </Text>
          <Text className="text-sm leading-6 text-slate-300">
            Entre em uma party ou crie a sua primeira comunidade para começar a
            postar e acompanhar a turma.
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
