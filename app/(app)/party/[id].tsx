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

function getSafeColor(value: string | null | undefined, fallback: string) {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value ?? "")
    ? (value as string)
    : fallback;
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
  const themeBackgroundColor = getSafeColor(
    party?.theme_background_color,
    "#0f172a",
  );
  const postCardColor = getSafeColor(party?.post_card_color, "#1e293b");

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

      <View className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950">
        {party?.banner_url ? (
          <Image
            source={{ uri: party.banner_url }}
            className="h-44 w-full"
            resizeMode="cover"
          />
        ) : (
          <View
            className="h-44 w-full"
            style={{ backgroundColor: themeBackgroundColor }}
          />
        )}
        <View className="absolute inset-0 bg-slate-950/30" />
        <View className="absolute inset-x-0 bottom-0 gap-4 p-5">
          <View className="flex-row items-end justify-between gap-4">
            <View className="flex-1 flex-row items-end gap-4">
              {party?.avatar_url ? (
                <Image
                  source={{ uri: party.avatar_url }}
                  className="h-20 w-20 rounded-[28px] border-2 border-white/20"
                />
              ) : (
                <View
                  className="h-20 w-20 items-center justify-center rounded-[28px] border-2 border-white/20"
                  style={{ backgroundColor: postCardColor }}
                >
                  <Text className="text-2xl font-bold text-white">
                    {(party?.name ?? "P").slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="flex-1 gap-1">
                <Text className="text-xs uppercase tracking-[0.25em] text-slate-200">
                  Party ativa
                </Text>
                <Text className="text-3xl font-bold text-white">
                  {party?.name ?? "Detalhe da party"}
                </Text>
                <Text className="text-sm leading-5 text-slate-200">
                  {party?.description ?? "Sem descrição cadastrada."}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <View className="rounded-full border border-white/10 bg-black/20 px-3 py-2">
              <Text className="text-xs uppercase tracking-[0.15em] text-slate-100">
                {members.length} membros
              </Text>
            </View>
            <View className="rounded-full border border-white/10 bg-black/20 px-3 py-2">
              <Text className="text-xs uppercase tracking-[0.15em] text-slate-100">
                {posts.length} posts
              </Text>
            </View>
            <View className="rounded-full border border-white/10 bg-black/20 px-3 py-2">
              <Text className="text-xs uppercase tracking-[0.15em] text-slate-100">
                Código {party?.invite_code ?? "-"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Card className="gap-3">
        {isPartyLoading ? (
          <Text className="text-slate-300">Carregando party...</Text>
        ) : (
          <>
            <Text className="text-lg font-semibold text-white">
              Identidade da party
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <View className="min-w-32 flex-1 rounded-2xl border border-white/10 px-4 py-3">
                <Text className="text-xs uppercase tracking-[0.15em] text-slate-400">
                  Fundo
                </Text>
                <View className="mt-3 flex-row items-center gap-3">
                  <View
                    className="h-5 w-5 rounded-full border border-white/20"
                    style={{ backgroundColor: themeBackgroundColor }}
                  />
                  <Text className="text-sm text-slate-200">
                    {party?.theme_background_color ?? themeBackgroundColor}
                  </Text>
                </View>
              </View>
              <View className="min-w-32 flex-1 rounded-2xl border border-white/10 px-4 py-3">
                <Text className="text-xs uppercase tracking-[0.15em] text-slate-400">
                  Card dos posts
                </Text>
                <View className="mt-3 flex-row items-center gap-3">
                  <View
                    className="h-5 w-5 rounded-full border border-white/20"
                    style={{ backgroundColor: postCardColor }}
                  />
                  <Text className="text-sm text-slate-200">
                    {party?.post_card_color ?? postCardColor}
                  </Text>
                </View>
              </View>
            </View>
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
