import { supabaseClient } from '@/core/api/supabaseClient';
import type {
  CommunitiesTableInsert,
  Community,
  CommunityListParams,
  CommunityMemberRow,
  CommunityMembersTableInsert,
  CommunityMediaUploadResult,
  CreateCommunityDto,
  HydrateCommunitiesParams,
  JoinCommunityDto,
  JoinResponse,
  LeaveCommunityDto,
} from '@/features/communities/types/community.types';

const COMMUNITIES_TABLE = 'communities';
const COMMUNITY_MEMBERS_TABLE = 'community_members';
const COMMUNITY_ICON_BUCKET = 'community-icons';
const COMMUNITY_BANNER_BUCKET = 'community-banners';
const DEFAULT_PAGE_SIZE = 20;

const buildCommunityError = (message: string): Error => new Error(message);

const sanitizeFileName = (fileName: string): string => fileName.toLowerCase().replace(/[^a-z0-9.-]/g, '-');

const slugifyCommunityName = (value: string): string => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'community';
};

const getCommunityMemberCount = async (communityId: string): Promise<number> => {
  const { count, error } = await supabaseClient
    .from(COMMUNITY_MEMBERS_TABLE)
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('community_id', communityId);

  if (error) {
    throw buildCommunityError(error.message || 'Unable to load the community member count.');
  }

  return count ?? 0;
};

const getViewerMembershipMap = async (
  communityIds: string[],
  currentUserId?: string | null,
): Promise<Map<string, CommunityMemberRow>> => {
  if (!currentUserId || communityIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabaseClient
    .from(COMMUNITY_MEMBERS_TABLE)
    .select('community_id, role')
    .eq('user_id', currentUserId)
    .in('community_id', communityIds);

  if (error) {
    throw buildCommunityError(error.message || 'Unable to load the current user community memberships.');
  }

  return new Map((data as CommunityMemberRow[]).map((membership) => [membership.community_id, membership]));
};

const hydrateCommunities = async ({ currentUserId, rows }: HydrateCommunitiesParams): Promise<Community[]> => {
  const communityIds = rows.map((row) => row.id);
  const membershipMap = await getViewerMembershipMap(communityIds, currentUserId);

  const memberCounts = await Promise.all(
    rows.map(async (row) => ({
      communityId: row.id,
      count: await getCommunityMemberCount(row.id),
    })),
  );

  const countMap = new Map(memberCounts.map((item) => [item.communityId, item.count]));

  return rows.map((row) => {
    const viewerMembership = membershipMap.get(row.id);

    return {
      ...row,
      member_count: countMap.get(row.id) ?? 0,
      viewer_role: viewerMembership?.role ?? null,
      is_member: Boolean(viewerMembership),
    };
  });
};

const generateUniqueSlug = async (name: string): Promise<string> => {
  const baseSlug = slugifyCommunityName(name);
  let nextSlug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data, error } = await supabaseClient
      .from(COMMUNITIES_TABLE)
      .select('id')
      .eq('slug', nextSlug)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw buildCommunityError(error.message || 'Unable to validate the community slug.');
    }

    if (!data) {
      return nextSlug;
    }

    suffix += 1;
    nextSlug = `${baseSlug}-${suffix}`;
  }
};

const uploadCommunityMedia = async (
  bucket: string,
  currentUserId: string,
  communityId: string,
  file: File,
): Promise<CommunityMediaUploadResult> => {
  if (!file.type.startsWith('image/')) {
    throw buildCommunityError('Only image files are allowed.');
  }

  const fileExtension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() ?? 'png' : 'png';
  const fileBaseName = file.name.replace(/\.[^.]+$/, '');
  const filePath = `${currentUserId}/${communityId}/${Date.now()}-${sanitizeFileName(fileBaseName)}.${fileExtension}`;

  const { error } = await supabaseClient.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    throw buildCommunityError(error.message || 'Unable to upload community media.');
  }

  const {
    data: { publicUrl },
  } = supabaseClient.storage.from(bucket).getPublicUrl(filePath);

  return {
    publicUrl,
  };
};

export const getCommunityBySlug = async (slug: string, currentUserId?: string | null): Promise<Community | null> => {
  if (!slug.trim()) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from(COMMUNITIES_TABLE)
    .select('id, name, slug, description, icon_url, banner_url, owner_id, created_at')
    .eq('slug', slug.trim())
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw buildCommunityError(error.message || 'Unable to load the requested community.');
  }

  if (!data) {
    return null;
  }

  const [memberCount, viewerMembershipMap] = await Promise.all([
    getCommunityMemberCount(data.id),
    getViewerMembershipMap([data.id], currentUserId),
  ]);

  const viewerMembership = viewerMembershipMap.get(data.id);

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    icon_url: data.icon_url,
    banner_url: data.banner_url,
    owner_id: data.owner_id,
    created_at: data.created_at,
    member_count: memberCount,
    viewer_role: viewerMembership?.role ?? null,
    is_member: Boolean(viewerMembership),
  };
};

export const getCommunities = async ({
  currentUserId,
  limit = DEFAULT_PAGE_SIZE,
  page = 1,
  search = '',
}: CommunityListParams): Promise<Community[]> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseClient
    .from(COMMUNITIES_TABLE)
    .select('id, name, slug, description, icon_url, banner_url, owner_id, created_at')
    .order('created_at', { ascending: false })
    .range(from, to);

  const normalizedSearch = search.trim();

  if (normalizedSearch) {
    query = query.or(`name.ilike.%${normalizedSearch}%,description.ilike.%${normalizedSearch}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw buildCommunityError(error.message || 'Unable to load communities.');
  }

  return hydrateCommunities({
    currentUserId,
    rows: (data ?? []) as HydrateCommunitiesParams['rows'],
  });
};

export const createCommunity = async ({
  bannerFile,
  currentUserId,
  description,
  iconFile,
  name,
}: CreateCommunityDto): Promise<Community> => {
  const communityId = crypto.randomUUID();
  const memberId = crypto.randomUUID();
  const slug = await generateUniqueSlug(name);

  const [iconUpload, bannerUpload] = await Promise.all([
    uploadCommunityMedia(COMMUNITY_ICON_BUCKET, currentUserId, communityId, iconFile),
    bannerFile ? uploadCommunityMedia(COMMUNITY_BANNER_BUCKET, currentUserId, communityId, bannerFile) : Promise.resolve(null),
  ]);

  const communityPayload: CommunitiesTableInsert = {
    id: communityId,
    name: name.trim(),
    slug,
    description: description.trim(),
    icon_url: iconUpload.publicUrl,
    banner_url: bannerUpload?.publicUrl ?? null,
    owner_id: currentUserId,
  };

  const { error: insertCommunityError } = await supabaseClient.from(COMMUNITIES_TABLE).insert(communityPayload);

  if (insertCommunityError) {
    throw buildCommunityError(insertCommunityError.message || 'Unable to create the community.');
  }

  const membershipPayload: CommunityMembersTableInsert = {
    id: memberId,
    community_id: communityId,
    user_id: currentUserId,
    role: 'owner',
  };

  const { error: insertMembershipError } = await supabaseClient.from(COMMUNITY_MEMBERS_TABLE).insert(membershipPayload);

  if (insertMembershipError) {
    await supabaseClient.from(COMMUNITIES_TABLE).delete().eq('id', communityId);
    throw buildCommunityError(insertMembershipError.message || 'Unable to attach the owner membership.');
  }

  const community = await getCommunityBySlug(slug, currentUserId);

  if (!community) {
    throw buildCommunityError('Community was created, but the response could not be resolved.');
  }

  return community;
};

export const joinCommunity = async ({ communityId, currentUserId, slug }: JoinCommunityDto): Promise<JoinResponse> => {
  const { data: existingMembership, error: membershipLookupError } = await supabaseClient
    .from(COMMUNITY_MEMBERS_TABLE)
    .select('id, role')
    .eq('community_id', communityId)
    .eq('user_id', currentUserId)
    .maybeSingle();

  if (membershipLookupError && membershipLookupError.code !== 'PGRST116') {
    throw buildCommunityError(membershipLookupError.message || 'Unable to validate the current membership.');
  }

  if (existingMembership) {
    throw buildCommunityError('You are already a member of this community.');
  }

  const community = await getCommunityBySlug(slug, currentUserId);

  if (!community) {
    throw buildCommunityError('Community was not found.');
  }

  const { error } = await supabaseClient.from(COMMUNITY_MEMBERS_TABLE).insert({
    id: crypto.randomUUID(),
    community_id: communityId,
    user_id: currentUserId,
    role: 'member',
  });

  if (error) {
    throw buildCommunityError(error.message || 'Unable to join the community.');
  }

  return {
    communityId,
    memberCount: community.member_count + 1,
    role: 'member',
  };
};

export const leaveCommunity = async ({ communityId, currentUserId, slug }: LeaveCommunityDto): Promise<JoinResponse> => {
  const community = await getCommunityBySlug(slug, currentUserId);

  if (!community) {
    throw buildCommunityError('Community was not found.');
  }

  if (community.owner_id === currentUserId || community.viewer_role === 'owner') {
    throw buildCommunityError('Community owners cannot leave their own communities.');
  }

  if (!community.is_member) {
    throw buildCommunityError('You are not a member of this community.');
  }

  const { error } = await supabaseClient
    .from(COMMUNITY_MEMBERS_TABLE)
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', currentUserId);

  if (error) {
    throw buildCommunityError(error.message || 'Unable to leave the community.');
  }

  return {
    communityId,
    memberCount: Math.max(community.member_count - 1, 0),
    role: 'member',
  };
};

export const getUserCommunities = async (userId: string): Promise<Community[]> => {
  const { data: memberships, error: membershipError } = await supabaseClient
    .from(COMMUNITY_MEMBERS_TABLE)
    .select('community_id')
    .eq('user_id', userId);

  if (membershipError) {
    throw buildCommunityError(membershipError.message || 'Unable to load user communities.');
  }

  const communityIds = (memberships ?? []).map((membership) => membership.community_id);

  if (communityIds.length === 0) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from(COMMUNITIES_TABLE)
    .select('id, name, slug, description, icon_url, banner_url, owner_id, created_at')
    .in('id', communityIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw buildCommunityError(error.message || 'Unable to load the user community list.');
  }

  return hydrateCommunities({
    currentUserId: userId,
    rows: (data ?? []) as HydrateCommunitiesParams['rows'],
  });
};
