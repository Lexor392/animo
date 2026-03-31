import { useQuery } from '@tanstack/react-query';
import { getPostById } from '@/features/posts/api/posts.api';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const usePost = (postId: string, currentUserId?: string | null, communityId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.posts.detail(postId, currentUserId),
    queryFn: () => getPostById(postId, currentUserId, communityId),
    enabled: Boolean(postId),
  });
};
