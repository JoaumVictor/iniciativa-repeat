import { useQuery } from "@tanstack/react-query";

import { listMyFeedPosts, listPartyFeedPosts } from "@/api/feed";
import { queryKeys } from "@/api/queryKeys";

export function useMyFeedPosts() {
  return useQuery({
    queryKey: queryKeys.feed.my,
    queryFn: listMyFeedPosts,
  });
}

export function usePartyFeedPosts(partyId: string) {
  return useQuery({
    queryKey: queryKeys.feed.party(partyId),
    queryFn: () => listPartyFeedPosts(partyId),
    enabled: Boolean(partyId),
  });
}
