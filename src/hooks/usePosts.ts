import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createPost, deletePost, getPostById, updatePost } from "@/api/posts";
import { queryKeys } from "@/api/queryKeys";

export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => getPostById(postId),
    enabled: Boolean(postId),
  });
}

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

export function useUpdatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      input,
    }: {
      postId: string;
      input: Parameters<typeof updatePost>[1];
    }) => updatePost(postId, input),
    onSuccess: async (post) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.feed.my });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.feed.party(post.party_id),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(post.id),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.parties.all });
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId }: { postId: string; partyId: string }) =>
      deletePost(postId),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.feed.my });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.feed.party(variables.partyId),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.parties.all });
    },
  });
}
