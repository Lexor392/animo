import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveCommunity } from '@/features/communities/api/communities.api';
import type { JoinResponse, LeaveCommunityDto } from '@/features/communities/types/community.types';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const useLeaveCommunity = () => {
  const queryClient = useQueryClient();

  const leaveMutation = useMutation<JoinResponse, Error, LeaveCommunityDto>({
    mutationFn: leaveCommunity,
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
    errorMessage: leaveMutation.error?.message ?? null,
    isLoading: leaveMutation.isPending,
    leave: leaveMutation.mutateAsync,
  };
};
