import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createParty,
  favoriteParty,
  joinPartyByCode,
  listMyParties,
  unfavoriteParty,
} from "@/api/parties";
import { queryKeys } from "@/api/queryKeys";

export function useMyParties() {
  return useQuery({
    queryKey: queryKeys.parties.all,
    queryFn: listMyParties,
  });
}

export function useCreatePartyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createParty,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.parties.all });
    },
  });
}

export function useJoinPartyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinPartyByCode,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.parties.all });
    },
  });
}

export function useFavoritePartyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: favoriteParty,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.parties.favorites,
      });
    },
  });
}

export function useUnfavoritePartyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfavoriteParty,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.parties.favorites,
      });
    },
  });
}
