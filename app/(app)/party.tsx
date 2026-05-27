import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Text, TextInput, View } from "react-native";

import { PartyCard } from "@/components/party/PartyCard";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import {
  useCreatePartyMutation,
  useFavoritePartyMutation,
  useJoinPartyMutation,
  useMyParties,
  useUnfavoritePartyMutation,
} from "@/hooks/useParties";
import { useMyFavoritePartyIds } from "@/hooks/usePartyFavorites";
import { getErrorMessage } from "@/utils/errors";

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

export default function PartyScreen() {
  const [partyName, setPartyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const { data: parties = [], isLoading } = useMyParties();
  const { data: favoritePartyIds = [] } = useMyFavoritePartyIds();
  const createPartyMutation = useCreatePartyMutation();
  const joinPartyMutation = useJoinPartyMutation();
  const favoritePartyMutation = useFavoritePartyMutation();
  const unfavoritePartyMutation = useUnfavoritePartyMutation();
  const favoritePartyIdSet = useMemo(
    () => new Set(favoritePartyIds),
    [favoritePartyIds],
  );

  const handleCreateParty = async () => {
    if (!partyName.trim()) return;

    setFeedback(null);

    try {
      await createPartyMutation.mutateAsync({
        name: partyName.trim(),
        is_private: true,
        invite_code: `repeat-${Date.now().toString(36)}`,
      });
      setPartyName("");
      setFeedback({
        type: "success",
        message:
          "Party criada. Agora você já pode começar a postar e convidar a galera.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Não foi possível criar a party."),
      });
    }
  };

  const handleJoinParty = async () => {
    if (!inviteCode.trim()) return;

    setFeedback(null);

    try {
      await joinPartyMutation.mutateAsync(inviteCode.trim());
      setInviteCode("");
      setFeedback({
        type: "success",
        message: "Entrada confirmada. A party já deve aparecer na sua lista.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Não foi possível entrar na party."),
      });
    }
  };

  return (
    <Screen className="gap-5 px-4 py-5">
      <View className="px-2 pt-3">
        <Text className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Parties
        </Text>
        <Text className="mt-3 text-3xl font-bold text-white">
          Sua rede de treino
        </Text>
        <Text className="mt-2 text-base leading-6 text-slate-300">
          Crie uma party, entre por código ou favorite suas comunidades.
        </Text>
        {feedback ? (
          <View
            className={`mt-4 rounded-2xl border px-4 py-3 ${
              feedback.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-rose-500/30 bg-rose-500/10"
            }`}
          >
            <Text
              className={`text-sm leading-6 ${
                feedback.type === "success"
                  ? "text-emerald-200"
                  : "text-rose-200"
              }`}
            >
              {feedback.message}
            </Text>
          </View>
        ) : null}
      </View>

      <Card className="gap-4">
        <Text className="text-lg font-semibold text-white">Criar party</Text>
        <TextInput
          placeholder="Nome da party"
          placeholderTextColor="#64748b"
          value={partyName}
          onChangeText={setPartyName}
          className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-base text-white"
        />
        <PrimaryButton
          title={createPartyMutation.isPending ? "Criando..." : "Criar party"}
          onPress={handleCreateParty}
        />
      </Card>

      <Card className="gap-4">
        <Text className="text-lg font-semibold text-white">
          Entrar por código
        </Text>
        <TextInput
          placeholder="Código da party"
          placeholderTextColor="#64748b"
          value={inviteCode}
          onChangeText={setInviteCode}
          className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-base text-white"
        />
        <PrimaryButton
          title={joinPartyMutation.isPending ? "Entrando..." : "Entrar"}
          onPress={handleJoinParty}
          variant="secondary"
        />
      </Card>

      <View className="flex-row items-center justify-between px-2">
        <Text className="text-lg font-semibold text-white">Minhas parties</Text>
        <PrimaryButton
          title="Voltar"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>

      {isLoading ? (
        <Card>
          <Text className="text-slate-300">Carregando parties...</Text>
        </Card>
      ) : parties.length > 0 ? (
        <View className="gap-3">
          {parties.map((party) => (
            <PartyCard
              key={party.id}
              party={party}
              isFavorite={favoritePartyIdSet.has(party.id)}
              onFavorite={(partyId) => favoritePartyMutation.mutate(partyId)}
              onUnfavorite={(partyId) =>
                unfavoritePartyMutation.mutate(partyId)
              }
            />
          ))}
        </View>
      ) : (
        <Card className="gap-4">
          <Text className="text-lg font-semibold text-white">
            Nenhuma party por aqui ainda
          </Text>
          <Text className="text-sm leading-6 text-slate-300">
            Crie uma party com seu grupo de treino ou entre usando um
            c\u00f3digo de convite para destravar o feed.
          </Text>
          <View className="flex-row gap-3">
            <PrimaryButton
              title="Criar agora"
              onPress={handleCreateParty}
              disabled={!partyName.trim() || createPartyMutation.isPending}
            />
            <PrimaryButton
              title="Entrar com c\u00f3digo"
              variant="secondary"
              onPress={handleJoinParty}
              disabled={!inviteCode.trim() || joinPartyMutation.isPending}
            />
          </View>
        </Card>
      )}
    </Screen>
  );
}
