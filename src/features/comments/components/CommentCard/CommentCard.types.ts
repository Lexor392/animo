import type { Comment } from '@/features/comments/types/comment.types';

export interface CommentCardProps {
  comment: Comment;
  currentUserId?: string | null;
  errorMessage?: string | null;
  isDeleteLoading: boolean;
  isLikeLoading: boolean;
  onDelete: (comment: Comment) => void;
  onToggleLike: (comment: Comment) => void;
}
