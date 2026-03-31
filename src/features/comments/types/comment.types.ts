export interface CommentAuthorInfo {
  avatar_url: string | null;
  user_id: string;
  username: string;
}

export interface Comment {
  author: CommentAuthorInfo;
  author_id: string;
  content: string;
  created_at: string;
  id: string;
  likes_count: number;
  post_id: string;
  updated_at: string;
  viewer_has_liked: boolean;
}

export interface CommentRow {
  author_id: string;
  content: string;
  created_at: string;
  id: string;
  likes_count: number | null;
  post_id: string;
  updated_at: string;
}

export interface CommentsResponse {
  items: Comment[];
  nextCursor: string | null;
}

export interface CommentsQueryParams {
  cursor?: string | null;
  currentUserId?: string | null;
  limit?: number;
  postId: string;
}

export interface CreateCommentDto {
  authorId: string;
  content: string;
  postId: string;
}

export interface CreateCommentFormValues {
  content: string;
}

export interface CreateCommentFieldErrors {
  content?: string;
}

export interface CreateCommentResponse {
  comment: Comment;
  commentsCount: number;
  postId: string;
}

export interface DeleteCommentDto {
  commentId: string;
  currentUserId: string;
  postId: string;
}

export interface DeleteCommentResponse {
  commentId: string;
  commentsCount: number;
  postId: string;
}
