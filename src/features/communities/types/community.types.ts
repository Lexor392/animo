export type CommunityRole = 'owner' | 'admin' | 'moderator' | 'member';

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url: string | null;
  banner_url: string | null;
  owner_id: string;
  created_at: string;
  member_count: number;
  viewer_role: CommunityRole | null;
  is_member: boolean;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: CommunityRole;
  joined_at: string;
}

export interface CreateCommunityDto {
  bannerFile?: File | null;
  currentUserId: string;
  description: string;
  iconFile: File;
  name: string;
}

export interface CommunityListParams {
  currentUserId?: string | null;
  limit?: number;
  page?: number;
  search?: string;
}

export interface JoinCommunityDto {
  communityId: string;
  currentUserId: string;
  slug: string;
}

export interface LeaveCommunityDto extends JoinCommunityDto {}

export interface JoinResponse {
  communityId: string;
  memberCount: number;
  role: CommunityRole;
}

export interface CreateCommunityFormValues {
  bannerFile: File | null;
  description: string;
  iconFile: File | null;
  name: string;
}

export interface CommunityFieldErrors {
  description?: string;
  iconFile?: string;
  name?: string;
}

interface CommunityRow {
  created_at: string;
  description: string;
  icon_url: string | null;
  id: string;
  name: string;
  owner_id: string;
  slug: string;
  banner_url: string | null;
}

export interface CommunityMemberRow {
  community_id: string;
  role: CommunityRole;
}

export interface CommunitiesTableInsert {
  banner_url?: string | null;
  created_at?: string;
  description: string;
  icon_url?: string | null;
  id: string;
  name: string;
  owner_id: string;
  slug: string;
}

export interface CommunityMembersTableInsert {
  community_id: string;
  id: string;
  joined_at?: string;
  role: CommunityRole;
  user_id: string;
}

export interface HydrateCommunitiesParams {
  currentUserId?: string | null;
  rows: CommunityRow[];
}

export interface CommunityMediaUploadResult {
  publicUrl: string;
}

export interface CommunityLookupResult {
  row: CommunityRow | null;
  viewerRole: CommunityRole | null;
}
