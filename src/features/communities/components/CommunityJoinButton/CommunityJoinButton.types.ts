import type { Community } from '@/features/communities/types/community.types';

export interface CommunityJoinButtonProps {
  community: Community;
  currentUserId: string;
}
