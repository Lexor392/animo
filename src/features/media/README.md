# Media Feature

## Purpose

The media feature owns reusable upload and rendering primitives for post and comment attachments backed by Supabase Storage.

## Structure

```text
features/media/
|- api/
|  `- media.api.ts
|- components/
|  |- MediaGallery/
|  |- MediaPreview/
|  `- MediaUploader/
|- hooks/
|  |- useMediaList.ts
|  `- useUploadMedia.ts
|- types/
|  `- media.types.ts
`- README.md
```

## Architecture

- `api` talks to Supabase Storage and the `media_assets` table
- `hooks` manage previews, staged upload progress and query access to attached media
- `components` stay presentational and can be reused by posts and comments

## Hook Usage

- `useUploadMedia({ type })` manages local previews, validation, removal and batch upload
- `useMediaList({ postId })` and `useMediaList({ commentId })` read stored media through React Query

## Component Usage

- `MediaUploader` provides drag-and-drop and selection UI
- `MediaPreview` displays local files before and during upload
- `MediaGallery` renders saved image/video attachments inside posts and comments

## Integration

- `CreatePostForm` uses `MediaUploader` for up to five attachments
- `CommentForm` uses the same uploader with optional attachments
- `PostContent` and `CommentCard` render persisted attachments with `MediaGallery`

## Notes

- images support `jpeg`, `png`, `webp` up to 5MB
- videos support `mp4`, `webm` up to 50MB
- Supabase Storage does not expose byte-accurate upload progress in the client SDK, so the hook uses staged progress updates around the upload lifecycle
