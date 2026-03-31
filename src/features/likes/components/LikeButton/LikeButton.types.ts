export interface LikeButtonProps {
  className?: string;
  isLiked: boolean;
  isLoading?: boolean;
  likesCount: number;
  onClick: () => void;
  title?: string;
}
