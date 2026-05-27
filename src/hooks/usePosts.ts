import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPost } from "@/api/posts";
import { queryKeys } from "@/api/queryKeys";

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: async (post) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.feed.my });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.feed.party(post.party_id),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.parties.all });
    },
  });
}
