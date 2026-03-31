import { useMutation, useQueryClient } from '@tanstack/react-query';
import { joinCommunity } from '@/features/communities/api/communities.api';
import type { JoinCommunityDto, JoinResponse } from '@/features/communities/types/community.types';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();

  const joinMutation = useMutation<JoinResponse, Error, JoinCommunityDto>({
    mutationFn: joinCommunity,
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.communities.all,
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.communities.detail(variables.slug, variables.currentUserId),
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.communities.user(variables.currentUserId),
        }),
      ]);
    },
  });

  return {
    errorMessage: joinMutation.error?.message ?? null,
    isLoading: joinMutation.isPending,
    join: joinMutation.mutateAsync,
  };
};
