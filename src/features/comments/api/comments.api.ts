import { supabaseClient } from '@/core/api/supabaseClient';
import type {
  Comment,
  CommentAuthorInfo,
  CommentsQueryParams,
  CommentsResponse,
  CommentRow,
  CreateCommentDto,
  CreateCommentResponse,
  DeleteCommentDto,
  DeleteCommentResponse,
} from '@/features/comments/types/comment.types';

const COMMENTS_TABLE = 'comments';
const COMMENT_LIKES_TABLE = 'comment_likes';
const PROFILES_TABLE = 'profiles';
const DEFAULT_COMMENTS_LIMIT = 10;

const buildCommentsError = (message: string): Error => new Error(message);

const getCommentAuthors = async (authorIds: string[]): Promise<Map<string, CommentAuthorInfo>> => {
  if (authorIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabaseClient.from(PROFILES_TABLE).select('user_id, username, avatar_url').in('user_id', authorIds);

  if (error) {
    throw buildCommentsError(error.message || 'Unable to load comment authors.');
  }

  const profiles = (data ?? []) as CommentAuthorInfo[];
  return new Map(profiles.map((profile) => [profile.user_id, profile]));
};

const getViewerLikedCommentIds = async (commentIds: string[], currentUserId?: string | null): Promise<Set<string>> => {
  if (!currentUserId || commentIds.length === 0) {
    return new Set();
  }

  const { data, error } = await supabaseClient.from(COMMENT_LIKES_TABLE).select('comment_id').eq('user_id', currentUserId).in('comment_id', commentIds);

  if (error) {
    throw buildCommentsError(error.message || 'Unable to load liked comments.');
  }

  return new Set(((data ?? []) as Array<{ comment_id: string }>).map((row) => row.comment_id));
};

const hydrateComments = async (rows: CommentRow[], currentUserId?: string | null): Promise<Comment[]> => {
  const authorIds = Array.from(new Set(rows.map((row) => row.author_id)));
  const commentIds = rows.map((row) => row.id);
  const [authorProfiles, likedCommentIds] = await Promise.all([getCommentAuthors(authorIds), getViewerLikedCommentIds(commentIds, currentUserId)]);

  return rows.map((row) => ({
    id: row.id,
    author_id: row.author_id,
    author:
      authorProfiles.get(row.author_id) ?? {
        user_id: row.author_id,
        username: 'unknown-user',
        avatar_url: null,
    },
    content: row.content,
    created_at: row.created_at,
    likes_count: row.likes_count ?? 0,
    post_id: row.post_id,
    updated_at: row.updated_at,
    viewer_has_liked: likedCommentIds.has(row.id),
  }));
};

const getCommentRowById = async (commentId: string): Promise<CommentRow | null> => {
  const { data, error } = await supabaseClient
    .from(COMMENTS_TABLE)
    .select('id, post_id, author_id, content, created_at, updated_at, likes_count')
    .eq('id', commentId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw buildCommentsError(error.message || 'Unable to load the requested comment.');
  }

  return (data as CommentRow | null) ?? null;
};

const getPostCommentsCount = async (postId: string): Promise<number> => {
  const { count, error } = await supabaseClient
    .from(COMMENTS_TABLE)
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('post_id', postId);

  if (error) {
    throw buildCommentsError(error.message || 'Unable to load the updated comments count.');
  }

  return count ?? 0;
};

export const getCommentsByPost = async ({
  cursor = null,
  limit = DEFAULT_COMMENTS_LIMIT,
  postId,
  currentUserId,
}: CommentsQueryParams): Promise<CommentsResponse> => {
  let query = supabaseClient
    .from(COMMENTS_TABLE)
    .select('id, post_id, author_id, content, created_at, updated_at, likes_count')
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) {
    throw buildCommentsError(error.message || 'Unable to load comments for this post.');
  }

  const rows = (data ?? []) as CommentRow[];
  const items = await hydrateComments(rows, currentUserId);

  return {
    items,
    nextCursor: rows.length === limit ? rows[rows.length - 1]?.created_at ?? null : null,
  };
};

export const createComment = async ({ authorId, content, postId }: CreateCommentDto): Promise<CreateCommentResponse> => {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw buildCommentsError('Write a comment before sending it.');
  }

  if (trimmedContent.length > 1000) {
    throw buildCommentsError('Comment must be 1000 characters or fewer.');
  }

  const commentId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const { error } = await supabaseClient.from(COMMENTS_TABLE).insert({
    id: commentId,
    post_id: postId,
    author_id: authorId,
    content: trimmedContent,
    created_at: timestamp,
    updated_at: timestamp,
  });

  if (error) {
    throw buildCommentsError(error.message || 'Unable to create the comment.');
  }

  const row = await getCommentRowById(commentId);

  if (!row) {
    throw buildCommentsError('Comment was created, but could not be loaded afterwards.');
  }

  const [comment] = await hydrateComments([row], authorId);
  const commentsCount = await getPostCommentsCount(postId);

  return {
    comment,
    commentsCount,
    postId,
  };
};

export const deleteComment = async ({ commentId, currentUserId, postId }: DeleteCommentDto): Promise<DeleteCommentResponse> => {
  const comment = await getCommentRowById(commentId);

  if (!comment) {
    throw buildCommentsError('Comment was not found.');
  }

  if (comment.author_id !== currentUserId) {
    throw buildCommentsError('Only the comment author can delete this comment.');
  }

  const { error } = await supabaseClient.from(COMMENTS_TABLE).delete().eq('id', commentId);

  if (error) {
    throw buildCommentsError(error.message || 'Unable to delete the comment.');
  }

  const commentsCount = await getPostCommentsCount(postId);

  return {
    commentId,
    commentsCount,
    postId,
  };
};
