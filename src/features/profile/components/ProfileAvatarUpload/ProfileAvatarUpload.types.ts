import type { Profile } from '@/features/profile/types/profile.types';

export interface ProfileAvatarUploadProps {
  currentUserId: string;
  profile: Profile;
}
