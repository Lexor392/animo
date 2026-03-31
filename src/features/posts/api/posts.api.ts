import { supabaseClient } from '@/core/api/supabaseClient';
import type {
  CreatePostDto,
  DeletePostDto,
  LikePostDto,
  Post,
  PostActionResponse,
  PostAuthorInfo,
  PostInsert,
  PostLikeRow,
  PostRow,
  PostsQueryParams,
  PostsResponse,
  UnlikePostDto,
} from '@/features/posts/types/post.types';

const POSTS_TABLE = 'posts';
const POST_LIKES_TABLE = 'post_likes';
const PROFILES_TABLE = 'profiles';
const COMMUNITIES_TABLE = 'communities';
const COMMUNITY_MEMBERS_TABLE = 'community_members';
const POST_MEDIA_BUCKET = 'post-media';
const DEFAULT_POSTS_LIMIT = 20;
const MAX_POST_MEDIA_BYTES = 5 * 1024 * 1024;

const buildPostsError = (message: string): Error => new Error(message);

const sanitizeFileName = (fileName: string): string => fileName.toLowerCase().replace(/[^a-z0-9.-]/g, '-');

const getAuthorProfiles = async (authorIds: string[]): Promise<Map<string, PostAuthorInfo>> => {
  if (authorIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabaseClient
    .from(PROFILES_TABLE)
    .select('user_id, username, avatar_url')
    .in('user_id', authorIds);

  if (error) {
    throw buildPostsError(error.message || 'Unable to load post authors.');
  }

  const profiles = (data ?? []) as PostAuthorInfo[];

  return new Map(profiles.map((profile) => [profile.user_id, profile]));
};

const getViewerLikedPostIds = async (postIds: string[], currentUserId?: string | null): Promise<Set<string>> => {
  if (!currentUserId || postIds.length === 0) {
    return new Set();
  }

  const { data, error } = await supabaseClient
    .from(POST_LIKES_TABLE)
    .select('post_id')
    .eq('user_id', currentUserId)
    .in('post_id', postIds);

  if (error) {
    throw buildPostsError(error.message || 'Unable to load liked posts.');
  }

  return new Set(((data ?? []) as PostLikeRow[]).map((row) => row.post_id));
};

const hydratePosts = async (rows: PostRow[], currentUserId?: string | null): Promise<Post[]> => {
  const authorIds = Array.from(new Set(rows.map((row) => row.author_id)));
  const postIds = rows.map((row) => row.id);

  const [authorProfiles, likedPostIds] = await Promise.all([
    getAuthorProfiles(authorIds),
    getViewerLikedPostIds(postIds, currentUserId),
  ]);

  return rows.map((row) => ({
    id: row.id,
    author_id: row.author_id,
    author:
      authorProfiles.get(row.author_id) ?? {
        user_id: row.author_id,
        username: 'unknown-user',
        avatar_url: null,
      },
    comments_count: row.comments_count ?? 0,
    community_id: row.community_id,
    content: row.content,
    created_at: row.created_at,
    likes_count: row.likes_count ?? 0,
    media_url: row.media_url,
    updated_at: row.updated_at,
    viewer_has_liked: likedPostIds.has(row.id),
  }));
};

const ensureCanPostInCommunity = async (communityId: string, authorId: string): Promise<void> => {
  const { data: community, error: communityError } = await supabaseClient
    .from(COMMUNITIES_TABLE)
    .select('owner_id')
    .eq('id', communityId)
    .maybeSingle();

  if (communityError && communityError.code !== 'PGRST116') {
    throw buildPostsError(communityError.message || 'Unable to validate community access.');
  }

  if (!community) {
    throw buildPostsError('Community was not found.');
  }

  if (community.owner_id === authorId) {
    return;
  }

  const { data: membership, error: membershipError } = await supabaseClient
    .from(COMMUNITY_MEMBERS_TABLE)
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', authorId)
    .maybeSingle();

  if (membershipError && membershipError.code !== 'PGRST116') {
    throw buildPostsError(membershipError.message || 'Unable to validate community membership.');
  }

  if (!membership) {
    throw buildPostsError('Only community members can create posts.');
  }
};

const uploadPostMedia = async (communityId: string, authorId: string, postId: string, file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw buildPostsError('Only image files are allowed.');
  }

  if (file.size > MAX_POST_MEDIA_BYTES) {
    throw buildPostsError('Post image must be 5MB or smaller.');
  }

  const fileExtension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() ?? 'png' : 'png';
  const fileBaseName = file.name.replace(/\.[^.]+$/, '');
  const filePath = `${authorId}/${communityId}/${postId}/${Date.now()}-${sanitizeFileName(fileBaseName)}.${fileExtension}`;

  const { error } = await supabaseClient.storage.from(POST_MEDIA_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    throw buildPostsError(error.message || 'Unable to upload post media.');
  }

  const {
    data: { publicUrl },
  } = supabaseClient.storage.from(POST_MEDIA_BUCKET).getPublicUrl(filePath);

  return publicUrl;
};

const recalculatePostLikesCount = async (postId: string): Promise<number> => {
  const { count, error: countError } = await supabaseClient
    .from(POST_LIKES_TABLE)
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('post_id', postId);

  if (countError) {
    throw buildPostsError(countError.message || 'Unable to recalculate post likes.');
  }

  const likesCount = count ?? 0;
  const { error: updateError } = await supabaseClient.from(POSTS_TABLE).update({ likes_count: likesCount }).eq('id', postId);

  if (updateError) {
    throw buildPostsError(updateError.message || 'Unable to store the updated likes count.');
  }

  return likesCount;
};

const getPostRowById = async (postId: string): Promise<PostRow | null> => {
  const { data, error } = await supabaseClient
    .from(POSTS_TABLE)
    .select('id, author_id, community_id, content, media_url, created_at, updated_at, likes_count, comments_count')
    .eq('id', postId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw buildPostsError(error.message || 'Unable to load the requested post.');
  }

  return (data as PostRow | null) ?? null;
};

export const createPost = async ({ authorId, communityId, content, mediaFile }: CreatePostDto): Promise<Post> => {
  await ensureCanPostInCommunity(communityId, authorId);

  const postId = crypto.randomUUID();
  let mediaUrl: string | null = null;

  if (mediaFile) {
    mediaUrl = await uploadPostMedia(communityId, authorId, postId, mediaFile);
  }

  const timestamp = new Date().toISOString();
  const payload: PostInsert = {
    id: postId,
    author_id: authorId,
    community_id: communityId,
    content: content.trim(),
    media_url: mediaUrl,
    created_at: timestamp,
    updated_at: timestamp,
    likes_count: 0,
    comments_count: 0,
  };

  const { error } = await supabaseClient.from(POSTS_TABLE).insert(payload);

  if (error) {
    throw buildPostsError(error.message || 'Unable to create the post.');
  }

  const row = await getPostRowById(postId);

  if (!row) {
    throw buildPostsError('Post was created, but could not be loaded afterwards.');
  }

  const [post] = await hydratePosts([row], authorId);
  return post;
};

export const getCommunityPosts = async ({
  communityId,
  cursor = null,
  currentUserId,
  limit = DEFAULT_POSTS_LIMIT,
}: PostsQueryParams): Promise<PostsResponse> => {
  let query = supabaseClient
    .from(POSTS_TABLE)
    .select('id, author_id, community_id, content, media_url, created_at, updated_at, likes_count, comments_count')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) {
    throw buildPostsError(error.message || 'Unable to load community posts.');
  }

  const rows = (data ?? []) as PostRow[];
  const items = await hydratePosts(rows, currentUserId);
  const nextCursor = rows.length === limit ? rows[rows.length - 1]?.created_at ?? null : null;

  return {
    items,
    nextCursor,
  };
};

export const getPostById = async (
  postId: string,
  currentUserId?: string | null,
  communityId?: string,
): Promise<Post | null> => {
  let query = supabaseClient
    .from(POSTS_TABLE)
    .select('id, author_id, community_id, content, media_url, created_at, updated_at, likes_count, comments_count')
    .eq('id', postId);

  if (communityId) {
    query = query.eq('community_id', communityId);
  }

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw buildPostsError(error.message || 'Unable to load the post.');
  }

  if (!data) {
    return null;
  }

  const [post] = await hydratePosts([data as PostRow], currentUserId);
  return post;
};

export const deletePost = async ({ currentUserId, postId }: DeletePostDto): Promise<void> => {
  const post = await getPostRowById(postId);

  if (!post) {
    throw buildPostsError('Post was not found.');
  }

  const { data: community, error: communityError } = await supabaseClient
    .from(COMMUNITIES_TABLE)
    .select('owner_id')
    .eq('id', post.community_id)
    .maybeSingle();

  if (communityError && communityError.code !== 'PGRST116') {
    throw buildPostsError(communityError.message || 'Unable to verify post permissions.');
  }

  const isAuthor = post.author_id === currentUserId;
  const isCommunityOwner = community?.owner_id === currentUserId;

  if (!isAuthor && !isCommunityOwner) {
    throw buildPostsError('Only the author or community owner can delete this post.');
  }

  const { error } = await supabaseClient.from(POSTS_TABLE).delete().eq('id', postId);

  if (error) {
    throw buildPostsError(error.message || 'Unable to delete the post.');
  }
};

export const likePost = async ({ currentUserId, postId }: LikePostDto): Promise<PostActionResponse> => {
  const { data: existingLike, error: existingLikeError } = await supabaseClient
    .from(POST_LIKES_TABLE)
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', currentUserId)
    .maybeSingle();

  if (existingLikeError && existingLikeError.code !== 'PGRST116') {
    throw buildPostsError(existingLikeError.message || 'Unable to validate current like state.');
  }

  if (existingLike) {
    throw buildPostsError('You have already liked this post.');
  }

  const { error } = await supabaseClient.from(POST_LIKES_TABLE).insert({
    id: crypto.randomUUID(),
    post_id: postId,
    user_id: currentUserId,
  });

  if (error) {
    throw buildPostsError(error.message || 'Unable to like the post.');
  }

  const likesCount = await recalculatePostLikesCount(postId);

  return {
    postId,
    likesCount,
    viewerHasLiked: true,
  };
};

export const unlikePost = async ({ currentUserId, postId }: UnlikePostDto): Promise<PostActionResponse> => {
  const { error } = await supabaseClient
    .from(POST_LIKES_TABLE)
    .delete()
    .eq('post_id', postId)
    .eq('user_id', currentUserId);

  if (error) {
    throw buildPostsError(error.message || 'Unable to remove the post like.');
  }

  const likesCount = await recalculatePostLikesCount(postId);

  return {
    postId,
    likesCount,
    viewerHasLiked: false,
  };
};
