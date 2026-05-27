import { supabase } from "@/api/supabaseClient";
import { getCurrentUserId } from "@/api/session";
import type {
  CommentRow,
  PostReactionRow,
  PostRow,
  ProfileRow,
} from "@/types/supabase";

export type CreatePostInput = {
  party_id: string;
  text_content?: string;
  image_url?: string | null;
};

export type CreateCommentInput = {
  post_id: string;
  content: string;
  parent_comment_id?: string | null;
};

export type CommentWithAuthorRow = CommentRow & {
  author: ProfileRow | null;
};

export async function createPost(input: CreatePostInput) {
  const authorId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("posts")
    .insert({ ...input, author_id: authorId })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as PostRow;
}

export async function getPostById(postId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error) {
    throw error;
  }

  return data as PostRow;
}

export async function updatePost(
  postId: string,
  input: Partial<CreatePostInput>,
) {
  const { data, error } = await supabase
    .from("posts")
    .update(input)
    .eq("id", postId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as PostRow;
}

export async function deletePost(postId: string) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    throw error;
  }
}

export async function reactToPost(
  postId: string,
  reaction: "like" | "dislike",
) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("post_reactions")
    .upsert(
      { post_id: postId, user_id: userId, reaction },
      { onConflict: "post_id,user_id" },
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as PostReactionRow;
}

export async function removeReactionFromPost(postId: string) {
  const { error } = await supabase
    .from("post_reactions")
    .delete()
    .eq("post_id", postId);

  if (error) {
    throw error;
  }
}

export async function createComment(input: CreateCommentInput) {
  const authorId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("comments")
    .insert({ ...input, author_id: authorId })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as CommentRow;
}

export async function updateComment(commentId: string, content: string) {
  const { data, error } = await supabase
    .from("comments")
    .update({ content })
    .eq("id", commentId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as CommentRow;
}

export async function listCommentsByPost(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("*, author:profiles(*)")
    .eq("post_id", postId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data as CommentWithAuthorRow[];
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    throw error;
  }
}
