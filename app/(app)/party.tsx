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

export default function PartyScreen() {
  const [partyName, setPartyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const { data: parties = [], isLoading } = useMyParties();
  const createPartyMutation = useCreatePartyMutation();
  const joinPartyMutation = useJoinPartyMutation();
  const favoritePartyMutation = useFavoritePartyMutation();
  const unfavoritePartyMutation = useUnfavoritePartyMutation();

  const favoritePartyIds = useMemo(() => new Set<string>(), []);

  const handleCreateParty = async () => {
    if (!partyName.trim()) return;

    await createPartyMutation.mutateAsync({
      name: partyName.trim(),
      is_private: true,
      invite_code: `repeat-${Date.now().toString(36)}`,
    });
    setPartyName("");
  };

  const handleJoinParty = async () => {
    if (!inviteCode.trim()) return;

    await joinPartyMutation.mutateAsync(inviteCode.trim());
    setInviteCode("");
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
      ) : null}

      <View className="gap-3">
        {parties.map((party) => (
          <PartyCard
            key={party.id}
            party={party}
            isFavorite={favoritePartyIds.has(party.id)}
            onFavorite={(partyId) => favoritePartyMutation.mutate(partyId)}
            onUnfavorite={(partyId) => unfavoritePartyMutation.mutate(partyId)}
          />
        ))}
      </View>
    </Screen>
  );
}
