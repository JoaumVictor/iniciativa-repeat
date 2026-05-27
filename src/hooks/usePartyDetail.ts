import { useQuery } from "@tanstack/react-query";

import { getPartyById, listPartyMembers } from "@/api/parties";
import { queryKeys } from "@/api/queryKeys";

export function usePartyDetail(partyId: string) {
  return useQuery({
    queryKey: [...queryKeys.parties.all, partyId] as const,
    queryFn: () => getPartyById(partyId),
    enabled: Boolean(partyId),
  });
}

export function usePartyMembers(partyId: string) {
  return useQuery({
    queryKey: [...queryKeys.parties.all, partyId, "members"] as const,
    queryFn: () => listPartyMembers(partyId),
    enabled: Boolean(partyId),
  });
}
