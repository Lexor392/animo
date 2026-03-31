import { useQuery } from '@tanstack/react-query';
import { getProfileById, getProfileByUsername } from '@/features/profile/api/profile.api';
import type { UseProfileParams } from '@/features/profile/types/profile.types';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const useProfile = ({ profileId, username }: UseProfileParams) => {
  return useQuery({
    queryKey: profileId ? QUERY_KEYS.profile.byId(profileId) : QUERY_KEYS.profile.byUsername(username ?? ''),
    queryFn: async () => {
      if (profileId) {
        return getProfileById(profileId);
      }

      if (username) {
        return getProfileByUsername(username);
      }

      return null;
    },
    enabled: Boolean(profileId || username),
  });
};
