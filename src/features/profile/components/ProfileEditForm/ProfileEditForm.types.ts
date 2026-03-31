import type { Profile } from '@/features/profile/types/profile.types';

export interface ProfileEditFormProps {
  currentUserId: string;
  profile: Profile;
}
