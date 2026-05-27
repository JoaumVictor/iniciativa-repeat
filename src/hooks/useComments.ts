import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createComment, listCommentsByPost } from "@/api/posts";
import { queryKeys } from "@/api/queryKeys";

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: queryKeys.comments.byPost(postId),
    queryFn: () => listCommentsByPost(postId),
    enabled: Boolean(postId),
  });
}

export function useCreateCommentMutation(postId: string, partyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      createComment({ post_id: postId, content }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byPost(postId),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.feed.my });
      if (partyId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.feed.party(partyId),
        });
      }
    },
  });
}
