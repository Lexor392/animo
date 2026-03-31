export enum MediaType {
  Image = 'image',
  Video = 'video',
}

export type MediaOwnerType = 'post' | 'comment';

export type MediaBucket = 'post-media' | 'comment-media';

export interface Media {
  bucket: MediaBucket;
  comment_id: string | null;
  created_at: string;
  id: string;
  media_type: MediaType;
  mime_type: string;
  owner_id: string;
  path: string;
  post_id: string | null;
  public_url: string;
  size_bytes: number;
}

export interface MediaRow extends Media {}

export interface UploadMediaInput {
  entityId: string;
  file: File;
  ownerId: string;
  type: MediaOwnerType;
}

export interface UploadMediaResponse {
  media: Media;
  publicUrl: string;
}

export interface DeleteMediaInput {
  currentUserId: string;
  mediaId: string;
}

export interface MediaListParams {
  commentId?: string;
  postId?: string;
}

export interface MediaGalleryItem {
  id: string;
  mediaType: MediaType;
  previewUrl: string;
  progress: number;
  status: 'error' | 'idle' | 'uploaded' | 'uploading';
  uploadedMedia?: Media;
  file?: File;
  errorMessage?: string;
}
