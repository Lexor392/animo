import { useQuery } from '@tanstack/react-query';
import { getCommunityBySlug } from '@/features/communities/api/communities.api';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const useCommunity = (slug: string, currentUserId?: string | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.communities.detail(slug, currentUserId),
    queryFn: () => getCommunityBySlug(slug, currentUserId),
    enabled: Boolean(slug),
  });
};
