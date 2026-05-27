import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reactToPost } from "@/api/posts";
import { queryKeys } from "@/api/queryKeys";

export function useReactToPostMutation(partyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      reaction,
    }: {
      postId: string;
      reaction: "like" | "dislike";
    }) => reactToPost(postId, reaction),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.feed.my });
      if (partyId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.feed.party(partyId),
        });
      }
    },
  });
}
