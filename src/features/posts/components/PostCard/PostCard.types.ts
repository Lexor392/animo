import type { Post } from '@/features/posts/types/post.types';

export interface PostCardProps {
  canDelete: boolean;
  errorMessage?: string | null;
  isDeleteLoading: boolean;
  isLikeLoading: boolean;
  onDelete: (post: Post) => void;
  onToggleLike: (post: Post) => void;
  post: Post;
  slug: string;
}
