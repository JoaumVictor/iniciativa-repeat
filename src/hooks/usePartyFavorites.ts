import { useQuery } from "@tanstack/react-query";

import { listMyFavoritePartyIds } from "@/api/parties";
import { queryKeys } from "@/api/queryKeys";

export function useMyFavoritePartyIds() {
  return useQuery({
    queryKey: queryKeys.parties.favorites,
    queryFn: listMyFavoritePartyIds,
  });
}
