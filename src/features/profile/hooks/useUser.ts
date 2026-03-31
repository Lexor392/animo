import { useQuery } from '@tanstack/react-query';
import { getProfileByUsername } from '@/features/profile/api/profile.api';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const useUser = (username: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.profile.byUsername(username),
    queryFn: () => getProfileByUsername(username),
    enabled: Boolean(username),
  });
};
