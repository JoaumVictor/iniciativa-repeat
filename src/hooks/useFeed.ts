import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/api/supabaseClient";
import { listMyFeedPosts, listPartyFeedPosts } from "@/api/feed";
import { isSupabaseConfigured } from "@/config/env";
import { queryKeys } from "@/api/queryKeys";

export function useMyFeedPosts() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.feed.my,
    queryFn: listMyFeedPosts,
    enabled: isSupabaseConfigured,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const channel = supabase
      .channel("feed:my:posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.feed.my });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function usePartyFeedPosts(partyId: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.feed.party(partyId),
    queryFn: () => listPartyFeedPosts(partyId),
    enabled: Boolean(partyId) && isSupabaseConfigured,
  });

  useEffect(() => {
    if (!partyId || !isSupabaseConfigured) {
      return;
    }

    const channel = supabase
      .channel(`feed:party:${partyId}:posts`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `party_id=eq.${partyId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.feed.party(partyId),
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [partyId, queryClient]);

  return query;
}
