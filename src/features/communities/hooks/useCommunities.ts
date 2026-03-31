import { useQuery } from '@tanstack/react-query';
import { getCommunities } from '@/features/communities/api/communities.api';
import type { CommunityListParams } from '@/features/communities/types/community.types';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const useCommunities = ({ currentUserId, limit = 20, page = 1, search = '' }: CommunityListParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.communities.list(page, search, currentUserId),
    queryFn: () =>
      getCommunities({
        currentUserId,
        limit,
        page,
        search,
      }),
  });
};
