import type { Profile } from '@/features/profile/types/profile.types';

export interface ProfileHeaderProps {
  isOwnProfile: boolean;
  onEditProfile: () => void;
  profile: Profile;
}
