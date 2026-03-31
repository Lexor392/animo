import { supabaseClient } from '@/core/api/supabaseClient';
import type { ToggleCommentLikeDto, ToggleLikeResponse, TogglePostLikeDto } from '@/features/likes/types/like.types';

const POST_LIKES_TABLE = 'post_likes';
const COMMENT_LIKES_TABLE = 'comment_likes';

const buildLikesError = (message: string): Error => new Error(message);

const getLikesCount = async (tableName: string, foreignKey: 'post_id' | 'comment_id', targetId: string): Promise<number> => {
  const { count, error } = await supabaseClient
    .from(tableName)
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq(foreignKey, targetId);

  if (error) {
    throw buildLikesError(error.message || 'Unable to load the updated likes count.');
  }

  return count ?? 0;
};

export const getPostLikes = async (postId: string): Promise<number> => getLikesCount(POST_LIKES_TABLE, 'post_id', postId);

export const getCommentLikes = async (commentId: string): Promise<number> => getLikesCount(COMMENT_LIKES_TABLE, 'comment_id', commentId);

export const togglePostLike = async ({ postId, userId }: TogglePostLikeDto): Promise<ToggleLikeResponse> => {
  const { data: existingLike, error: existingLikeError } = await supabaseClient
    .from(POST_LIKES_TABLE)
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingLikeError && existingLikeError.code !== 'PGRST116') {
    throw buildLikesError(existingLikeError.message || 'Unable to validate the current post like state.');
  }

  const viewerHasLiked = !existingLike;

  if (existingLike) {
    const { error } = await supabaseClient.from(POST_LIKES_TABLE).delete().eq('post_id', postId).eq('user_id', userId);

    if (error) {
      throw buildLikesError(error.message || 'Unable to remove the post like.');
    }
  } else {
    const { error } = await supabaseClient.from(POST_LIKES_TABLE).insert({
      id: crypto.randomUUID(),
      post_id: postId,
      user_id: userId,
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw buildLikesError(error.message || 'Unable to add the post like.');
    }
  }

  const likesCount = await getPostLikes(postId);

  return {
    likesCount,
    targetId: postId,
    viewerHasLiked,
  };
};

export const toggleCommentLike = async ({ commentId, userId }: ToggleCommentLikeDto): Promise<ToggleLikeResponse> => {
  const { data: existingLike, error: existingLikeError } = await supabaseClient
    .from(COMMENT_LIKES_TABLE)
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingLikeError && existingLikeError.code !== 'PGRST116') {
    throw buildLikesError(existingLikeError.message || 'Unable to validate the current comment like state.');
  }

  const viewerHasLiked = !existingLike;

  if (existingLike) {
    const { error } = await supabaseClient.from(COMMENT_LIKES_TABLE).delete().eq('comment_id', commentId).eq('user_id', userId);

    if (error) {
      throw buildLikesError(error.message || 'Unable to remove the comment like.');
    }
  } else {
    const { error } = await supabaseClient.from(COMMENT_LIKES_TABLE).insert({
      id: crypto.randomUUID(),
      comment_id: commentId,
      user_id: userId,
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw buildLikesError(error.message || 'Unable to add the comment like.');
    }
  }

  const likesCount = await getCommentLikes(commentId);

  return {
    likesCount,
    targetId: commentId,
    viewerHasLiked,
  };
};
