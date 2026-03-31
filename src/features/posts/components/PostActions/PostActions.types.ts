export interface PostActionsProps {
  canDelete: boolean;
  commentsCount: number;
  errorMessage?: string | null;
  isDeleteLoading: boolean;
  isLikeLoading: boolean;
  isLiked: boolean;
  likesCount: number;
  onDelete: () => void;
  onToggleLike: () => void;
}
