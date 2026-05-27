import { useQuery } from "@tanstack/react-query";

import { listMyFavoritePartyIds } from "@/api/parties";
import { isSupabaseConfigured } from "@/config/env";
import { queryKeys } from "@/api/queryKeys";

export function useMyFavoritePartyIds() {
  return useQuery({
    queryKey: queryKeys.parties.favorites,
    queryFn: listMyFavoritePartyIds,
    enabled: isSupabaseConfigured,
  });
}
