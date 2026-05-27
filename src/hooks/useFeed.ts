import { useQuery } from "@tanstack/react-query";

import { listMyFeedPosts } from "@/api/feed";
import { queryKeys } from "@/api/queryKeys";

export function useMyFeedPosts() {
  return useQuery({
    queryKey: queryKeys.feed.my,
    queryFn: listMyFeedPosts,
  });
}
