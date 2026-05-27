import { useLocalSearchParams, router } from "expo-router";
import { Text, View } from "react-native";

import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { usePartyDetail, usePartyMembers } from "@/hooks/usePartyDetail";
import { usePartyFeedPosts } from "@/hooks/useFeed";

export default function PartyDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const partyId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: party, isLoading: isPartyLoading } = usePartyDetail(
    partyId ?? "",
  );
  const { data: members = [], isLoading: isMembersLoading } = usePartyMembers(
    partyId ?? "",
  );
  const { data: posts = [], isLoading: isPostsLoading } = usePartyFeedPosts(
    partyId ?? "",
  );

  return (
    <Screen className="gap-5 px-4 py-5">
      <View className="flex-row items-center justify-between px-2 pt-3">
        <View className="flex-1">
          <Text className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Party
          </Text>
          <Text className="mt-3 text-3xl font-bold text-white">
            {party?.name ?? "Detalhe da party"}
          </Text>
        </View>
        <PrimaryButton
          title="Voltar"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>

      <Card className="gap-3">
        {isPartyLoading ? (
          <Text className="text-slate-300">Carregando party...</Text>
        ) : (
          <>
            <Text className="text-lg font-semibold text-white">
              Informações
            </Text>
            <Text className="text-sm leading-6 text-slate-300">
              {party?.description ?? "Sem descrição cadastrada."}
            </Text>
            <Text className="text-sm text-slate-300">
              Código: {party?.invite_code ?? "-"}
            </Text>
            <Text className="text-sm text-slate-300">
              Fundo: {party?.theme_background_color ?? "-"}
            </Text>
            <Text className="text-sm text-slate-300">
              Cards: {party?.post_card_color ?? "-"}
            </Text>
          </>
        )}
      </Card>

      <Card className="gap-3">
        <Text className="text-lg font-semibold text-white">Membros</Text>
        {isMembersLoading ? (
          <Text className="text-slate-300">Carregando membros...</Text>
        ) : (
          <View className="gap-2">
            {members.map((member) => (
              <Text key={member.id} className="text-sm text-slate-300">
                {member.user_id} · {member.role} · {member.status}
              </Text>
            ))}
          </View>
        )}
      </Card>

      <Card className="gap-3">
        <Text className="text-lg font-semibold text-white">Feed da party</Text>
        {isPostsLoading ? (
          <Text className="text-slate-300">Carregando posts da party...</Text>
        ) : posts.length > 0 ? (
          <View className="gap-3">
            {posts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </View>
        ) : (
          <Text className="text-sm leading-6 text-slate-300">
            Ainda não há postagens nesta party.
          </Text>
        )}
        <PrimaryButton
          title="Novo post nessa party"
          onPress={() =>
            router.push({
              pathname: "/(app)/post",
              params: { partyId: partyId ?? "" },
            })
          }
        />
      </Card>
    </Screen>
  );
}
