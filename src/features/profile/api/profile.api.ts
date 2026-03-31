import type { UserProfile } from '@/features/profile/types/profile.types';

export const getProfileByUsername = async (username: string): Promise<UserProfile | null> => {
  if (!username) {
    return null;
  }

  // Foundation stub. Replace with a typed Supabase query when the DB schema is finalized.
  return {
    id: 'foundation-profile',
    username,
    displayName: 'Architecture Preview',
    bio: 'Profile feature foundation is ready for Supabase integration.',
    avatarUrl: null,
  };
};
