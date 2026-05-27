import { useLocalSearchParams, router } from "expo-router";
import { Image, Text, View } from "react-native";

import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { usePartyDetail, usePartyMembers } from "@/hooks/usePartyDetail";
import { usePartyFeedPosts } from "@/hooks/useFeed";
import { useMyProfile } from "@/hooks/useProfile";

function getMemberName(member: {
  user: { nickname: string | null; username: string | null } | null;
  user_id: string;
}) {
  return member.user?.nickname ?? member.user?.username ?? member.user_id;
}

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
  const { data: profile } = useMyProfile();

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
        ) : members.length === 0 ? (
          <Text className="text-sm leading-6 text-slate-300">
            Ainda n\u00e3o h\u00e1 membros ativos vis\u00edveis nessa party.
          </Text>
        ) : (
          <View className="gap-2">
            {members.map((member) => (
              <View
                key={member.id}
                className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3"
              >
                {member.user?.avatar_url ? (
                  <Image
                    source={{ uri: member.user.avatar_url }}
                    className="h-10 w-10 rounded-full border border-white/10"
                  />
                ) : (
                  <View className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-800">
                    <Text className="text-sm font-semibold text-white">
                      {getMemberName(member).slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-white">
                    {getMemberName(member)}
                  </Text>
                  <Text className="text-xs uppercase tracking-[0.15em] text-slate-400">
                    {member.role} · {member.status}
                  </Text>
                </View>
              </View>
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
              <FeedPostCard
                key={post.id}
                post={post}
                currentUserId={profile?.id}
              />
            ))}
          </View>
        ) : (
          <Card className="gap-4 border border-dashed border-white/10 bg-slate-900/60 p-4">
            <Text className="text-lg font-semibold text-white">
              Abra o placar da party
            </Text>
            <Text className="text-sm leading-6 text-slate-300">
              Essa party ainda n\u00e3o tem posts. Publique o primeiro treino,
              PR ou foto para puxar a conversa.
            </Text>
            <PrimaryButton
              title="Publicar primeiro post"
              onPress={() =>
                router.push({
                  pathname: "/(app)/post",
                  params: { partyId: partyId ?? "" },
                })
              }
            />
          </Card>
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
