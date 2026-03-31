import { useQuery } from '@tanstack/react-query';
import { getCommunityPosts } from '@/features/posts/api/posts.api';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const usePosts = (communityId: string, currentUserId?: string | null, cursor: string | null = null, limit = 20) => {
  return useQuery({
    queryKey: QUERY_KEYS.posts.feed(communityId, cursor, currentUserId),
    queryFn: () =>
      getCommunityPosts({
        communityId,
        currentUserId,
        cursor,
        limit,
      }),
    enabled: Boolean(communityId),
  });
};
