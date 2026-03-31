import type { Community } from '@/features/communities/types/community.types';

export interface CommunityHeaderProps {
  community: Community;
  currentUserId: string;
}
