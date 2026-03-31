import { supabaseClient } from '@/core/api/supabaseClient';
import type { AvatarUploadInput, AvatarUploadResponse, Profile, UpdateProfileDto } from '@/features/profile/types/profile.types';

const PROFILES_TABLE = 'profiles';
const AVATARS_BUCKET = 'avatars';
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

const buildProfileError = (message: string): Error => new Error(message);

const isNotFoundError = (error: { code?: string; message?: string } | null): boolean => {
  return error?.code === 'PGRST116';
};

const sanitizeFileName = (fileName: string): string => {
  return fileName.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
};

const assertOwnership = async (profileId: string, currentUserId: string): Promise<Profile> => {
  const profile = await getProfileById(profileId);

  if (!profile) {
    throw buildProfileError('Profile was not found.');
  }

  if (profile.user_id !== currentUserId) {
    throw buildProfileError('You can edit only your own profile.');
  }

  return profile;
};

export const getProfileByUsername = async (username: string): Promise<Profile | null> => {
  if (!username.trim()) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from(PROFILES_TABLE)
    .select('id, user_id, username, avatar_url, banner_url, bio, created_at, updated_at')
    .eq('username', username.trim())
    .maybeSingle();

  if (error && !isNotFoundError(error)) {
    throw buildProfileError(error.message || 'Unable to load the requested profile.');
  }

  return (data as Profile | null) ?? null;
};

export const getProfileById = async (profileId: string): Promise<Profile | null> => {
  if (!profileId.trim()) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from(PROFILES_TABLE)
    .select('id, user_id, username, avatar_url, banner_url, bio, created_at, updated_at')
    .eq('id', profileId.trim())
    .maybeSingle();

  if (error && !isNotFoundError(error)) {
    throw buildProfileError(error.message || 'Unable to load the requested profile.');
  }

  return (data as Profile | null) ?? null;
};

export const updateProfile = async ({
  banner_url,
  bio,
  currentUserId,
  profileId,
  username,
}: UpdateProfileDto): Promise<Profile> => {
  await assertOwnership(profileId, currentUserId);

  const { data, error } = await supabaseClient
    .from(PROFILES_TABLE)
    .update({
      username: username.trim(),
      bio: bio.trim() || null,
      banner_url: banner_url?.trim() ? banner_url.trim() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId)
    .select('id, user_id, username, avatar_url, banner_url, bio, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw buildProfileError('Username is already taken.');
    }

    throw buildProfileError(error.message || 'Unable to update the profile.');
  }

  return data as Profile;
};

export const uploadAvatar = async ({ currentUserId, file, profileId }: AvatarUploadInput): Promise<AvatarUploadResponse> => {
  if (!file.type.startsWith('image/')) {
    throw buildProfileError('Only image files are allowed.');
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw buildProfileError('Avatar must be 2MB or smaller.');
  }

  await assertOwnership(profileId, currentUserId);

  const fileExtension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() ?? 'png' : 'png';
  const fileBaseName = file.name.replace(/\.[^.]+$/, '');
  const filePath = `${currentUserId}/${Date.now()}-${sanitizeFileName(fileBaseName)}.${fileExtension}`;

  const { error: uploadError } = await supabaseClient.storage.from(AVATARS_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    throw buildProfileError(uploadError.message || 'Unable to upload avatar.');
  }

  const {
    data: { publicUrl },
  } = supabaseClient.storage.from(AVATARS_BUCKET).getPublicUrl(filePath);

  const { error: updateError } = await supabaseClient
    .from(PROFILES_TABLE)
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId);

  if (updateError) {
    throw buildProfileError(updateError.message || 'Unable to save the avatar URL.');
  }

  return {
    avatarUrl: publicUrl,
    path: filePath,
  };
};
