import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createComment,
  deleteComment,
  listCommentsByPost,
  updateComment,
} from "@/api/posts";
import { queryKeys } from "@/api/queryKeys";
import { supabase } from "@/api/supabaseClient";

export function usePostComments(postId: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.comments.byPost(postId),
    queryFn: () => listCommentsByPost(postId),
    enabled: Boolean(postId),
  });

  useEffect(() => {
    if (!postId) {
      return;
    }

    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.comments.byPost(postId),
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  return query;
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

export function useUpdateCommentMutation(postId: string, partyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => updateComment(commentId, content),
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

export function useDeleteCommentMutation(postId: string, partyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
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
