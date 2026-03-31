export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileDto {
  profileId: string;
  currentUserId: string;
  username: string;
  bio: string;
  banner_url?: string | null;
}

export interface AvatarUploadInput {
  currentUserId: string;
  file: File;
  profileId: string;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
  path: string;
}

export interface UseProfileParams {
  profileId?: string;
  username?: string;
}

export interface ProfileFieldErrors {
  bio?: string;
  username?: string;
}
