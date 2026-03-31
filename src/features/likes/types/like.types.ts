export interface Like {
  created_at: string;
  id: string;
  user_id: string;
}

export interface PostLike extends Like {
  post_id: string;
}

export interface CommentLike extends Like {
  comment_id: string;
}

export interface ToggleLikeResponse {
  likesCount: number;
  targetId: string;
  viewerHasLiked: boolean;
}

export interface TogglePostLikeDto {
  postId: string;
  userId: string;
}

export interface ToggleCommentLikeDto {
  commentId: string;
  userId: string;
}
