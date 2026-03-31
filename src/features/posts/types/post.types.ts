export interface PostAuthorInfo {
  avatar_url: string | null;
  user_id: string;
  username: string;
}

export interface Post {
  id: string;
  author_id: string;
  author: PostAuthorInfo;
  comments_count: number;
  community_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  media_url: string | null;
  updated_at: string;
  viewer_has_liked: boolean;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
}

export interface PostsResponse {
  items: Post[];
  nextCursor: string | null;
}

export interface CreatePostDto {
  authorId: string;
  communityId: string;
  content: string;
  mediaFile?: File | null;
}

export interface CreatePostFormValues {
  content: string;
  mediaFile: File | null;
}

export interface CreatePostFieldErrors {
  content?: string;
  mediaFile?: string;
}

export interface PostsQueryParams {
  communityId: string;
  cursor?: string | null;
  currentUserId?: string | null;
  limit?: number;
}

export interface DeletePostDto {
  currentUserId: string;
  postId: string;
}

export interface LikePostDto {
  currentUserId: string;
  postId: string;
}

export interface UnlikePostDto extends LikePostDto {}

export interface PostActionResponse {
  likesCount: number;
  postId: string;
  viewerHasLiked: boolean;
}

export interface PostPermissionContext {
  communityOwnerId: string;
  currentUserId: string;
  post: Post;
}

export interface PostRow {
  author_id: string;
  comments_count: number | null;
  community_id: string;
  content: string;
  created_at: string;
  id: string;
  likes_count: number | null;
  media_url: string | null;
  updated_at: string;
}

export interface PostInsert {
  author_id: string;
  comments_count?: number;
  community_id: string;
  content: string;
  created_at?: string;
  id: string;
  likes_count?: number;
  media_url?: string | null;
  updated_at?: string;
}

export interface PostLikeRow {
  post_id: string;
}
