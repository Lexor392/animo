import { supabaseClient } from '@/core/api/supabaseClient';
import type {
  DeleteMediaInput,
  Media,
  MediaBucket,
  MediaListParams,
  MediaOwnerType,
  MediaRow,
  UploadMediaInput,
  UploadMediaResponse,
} from '@/features/media/types/media.types';
import { MediaType } from '@/features/media/types/media.types';

const MEDIA_TABLE = 'media_assets';
const POST_MEDIA_BUCKET: MediaBucket = 'post-media';
const COMMENT_MEDIA_BUCKET: MediaBucket = 'comment-media';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_MEDIA_PER_ENTITY = 5;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);

const buildMediaError = (message: string): Error => new Error(message);

const sanitizeFileName = (fileName: string): string => fileName.toLowerCase().replace(/[^a-z0-9.-]/g, '-');

export const getMediaType = (file: File): MediaType => {
  if (ALLOWED_IMAGE_TYPES.has(file.type)) {
    return MediaType.Image;
  }

  if (ALLOWED_VIDEO_TYPES.has(file.type)) {
    return MediaType.Video;
  }

  throw buildMediaError('Only jpeg, png, webp, mp4 and webm files are supported.');
};

export const validateMediaFile = (file: File): void => {
  const mediaType = getMediaType(file);

  if (mediaType === MediaType.Image && file.size > MAX_IMAGE_BYTES) {
    throw buildMediaError('Images must be 5MB or smaller.');
  }

  if (mediaType === MediaType.Video && file.size > MAX_VIDEO_BYTES) {
    throw buildMediaError('Videos must be 50MB or smaller.');
  }
};

const getBucketForType = (type: MediaOwnerType): MediaBucket => (type === 'post' ? POST_MEDIA_BUCKET : COMMENT_MEDIA_BUCKET);

const buildUploadPath = (ownerId: string, entityId: string, file: File): string => {
  const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() ?? 'bin' : 'bin';
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'media';
  return `${ownerId}/${entityId}/${crypto.randomUUID()}-${sanitizeFileName(baseName)}.${extension}`;
};

const mapMediaRow = (row: MediaRow): Media => row;

const fetchEntityMediaCount = async (params: MediaListParams): Promise<number> => {
  let query = supabaseClient.from(MEDIA_TABLE).select('*', {
    count: 'exact',
    head: true,
  });

  if (params.postId) {
    query = query.eq('post_id', params.postId);
  }

  if (params.commentId) {
    query = query.eq('comment_id', params.commentId);
  }

  const { count, error } = await query;

  if (error) {
    throw buildMediaError(error.message || 'Unable to validate current media count.');
  }

  return count ?? 0;
};

export const uploadMedia = async ({ entityId, file, ownerId, type }: UploadMediaInput): Promise<UploadMediaResponse> => {
  validateMediaFile(file);

  const bucket = getBucketForType(type);
  const currentCount = await fetchEntityMediaCount(type === 'post' ? { postId: entityId } : { commentId: entityId });

  if (currentCount >= MAX_MEDIA_PER_ENTITY) {
    throw buildMediaError('You can attach up to 5 files to one post or comment.');
  }

  const path = buildUploadPath(ownerId, entityId, file);
  const mediaType = getMediaType(file);

  const { error: uploadError } = await supabaseClient.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    throw buildMediaError(uploadError.message || 'Unable to upload media to storage.');
  }

  const {
    data: { publicUrl },
  } = supabaseClient.storage.from(bucket).getPublicUrl(path);

  const mediaId = crypto.randomUUID();
  const payload = {
    id: mediaId,
    owner_id: ownerId,
    post_id: type === 'post' ? entityId : null,
    comment_id: type === 'comment' ? entityId : null,
    bucket,
    path,
    public_url: publicUrl,
    media_type: mediaType,
    mime_type: file.type,
    size_bytes: file.size,
  };

  const { data, error } = await supabaseClient
    .from(MEDIA_TABLE)
    .insert(payload)
    .select('id, owner_id, post_id, comment_id, bucket, path, public_url, media_type, mime_type, size_bytes, created_at')
    .single();

  if (error) {
    throw buildMediaError(error.message || 'Unable to store media metadata.');
  }

  const media = mapMediaRow(data as MediaRow);

  return {
    media,
    publicUrl,
  };
};

export const getMediaUrls = async (ids: string[]): Promise<Media[]> => {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from(MEDIA_TABLE)
    .select('id, owner_id, post_id, comment_id, bucket, path, public_url, media_type, mime_type, size_bytes, created_at')
    .in('id', ids)
    .order('created_at', { ascending: true });

  if (error) {
    throw buildMediaError(error.message || 'Unable to load media assets.');
  }

  return ((data ?? []) as MediaRow[]).map(mapMediaRow);
};

export const getMediaList = async ({ commentId, postId }: MediaListParams): Promise<Media[]> => {
  let query = supabaseClient
    .from(MEDIA_TABLE)
    .select('id, owner_id, post_id, comment_id, bucket, path, public_url, media_type, mime_type, size_bytes, created_at')
    .order('created_at', { ascending: true });

  if (postId) {
    query = query.eq('post_id', postId);
  }

  if (commentId) {
    query = query.eq('comment_id', commentId);
  }

  const { data, error } = await query;

  if (error) {
    throw buildMediaError(error.message || 'Unable to load media list.');
  }

  return ((data ?? []) as MediaRow[]).map(mapMediaRow);
};

export const getMediaMapByPosts = async (postIds: string[]): Promise<Map<string, Media[]>> => {
  if (postIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabaseClient
    .from(MEDIA_TABLE)
    .select('id, owner_id, post_id, comment_id, bucket, path, public_url, media_type, mime_type, size_bytes, created_at')
    .in('post_id', postIds)
    .order('created_at', { ascending: true });

  if (error) {
    throw buildMediaError(error.message || 'Unable to load post media.');
  }

  const mediaRows = (data ?? []) as MediaRow[];
  const mediaMap = new Map<string, Media[]>();

  mediaRows.forEach((row) => {
    if (!row.post_id) {
      return;
    }

    const currentItems = mediaMap.get(row.post_id) ?? [];
    currentItems.push(mapMediaRow(row));
    mediaMap.set(row.post_id, currentItems);
  });

  return mediaMap;
};

export const getMediaMapByComments = async (commentIds: string[]): Promise<Map<string, Media[]>> => {
  if (commentIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabaseClient
    .from(MEDIA_TABLE)
    .select('id, owner_id, post_id, comment_id, bucket, path, public_url, media_type, mime_type, size_bytes, created_at')
    .in('comment_id', commentIds)
    .order('created_at', { ascending: true });

  if (error) {
    throw buildMediaError(error.message || 'Unable to load comment media.');
  }

  const mediaRows = (data ?? []) as MediaRow[];
  const mediaMap = new Map<string, Media[]>();

  mediaRows.forEach((row) => {
    if (!row.comment_id) {
      return;
    }

    const currentItems = mediaMap.get(row.comment_id) ?? [];
    currentItems.push(mapMediaRow(row));
    mediaMap.set(row.comment_id, currentItems);
  });

  return mediaMap;
};

export const deleteMedia = async ({ currentUserId, mediaId }: DeleteMediaInput): Promise<void> => {
  const { data, error } = await supabaseClient
    .from(MEDIA_TABLE)
    .select('id, owner_id, bucket, path')
    .eq('id', mediaId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw buildMediaError(error.message || 'Unable to load media metadata.');
  }

  if (!data) {
    throw buildMediaError('Media item was not found.');
  }

  if (data.owner_id !== currentUserId) {
    throw buildMediaError('Only the media owner can remove this file.');
  }

  const { error: storageError } = await supabaseClient.storage.from(data.bucket as MediaBucket).remove([data.path as string]);

  if (storageError) {
    throw buildMediaError(storageError.message || 'Unable to delete media from storage.');
  }

  const { error: deleteError } = await supabaseClient.from(MEDIA_TABLE).delete().eq('id', mediaId);

  if (deleteError) {
    throw buildMediaError(deleteError.message || 'Unable to delete media metadata.');
  }
};

export const MEDIA_RULES = {
  allowedImageTypes: Array.from(ALLOWED_IMAGE_TYPES),
  allowedVideoTypes: Array.from(ALLOWED_VIDEO_TYPES),
  maxFiles: MAX_MEDIA_PER_ENTITY,
  maxImageBytes: MAX_IMAGE_BYTES,
  maxVideoBytes: MAX_VIDEO_BYTES,
} as const;
