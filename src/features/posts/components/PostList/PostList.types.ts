import type { Post } from '@/features/posts/types/post.types';

export interface PostListProps {
  communityOwnerId: string;
  currentUserId: string;
  deleteLoadingPostId?: string | null;
  emptyMessage?: string;
  errorMessage?: string | null;
  likeLoadingPostId?: string | null;
  onDelete: (post: Post) => void;
  onToggleLike: (post: Post) => void;
  posts: Post[];
  slug: string;
}
