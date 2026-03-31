import { MediaGallery } from '@/features/media/components/MediaGallery/MediaGallery';
import { MediaType } from '@/features/media/types/media.types';
import type { PostContentProps } from '@/features/posts/components/PostContent/PostContent.types';

export const PostContent = ({ post }: PostContentProps): JSX.Element => {
  const fallbackMedia =
    post.media.length === 0 && post.media_url
      ? [
          {
            id: `${post.id}-fallback-media`,
            bucket: 'post-media',
            comment_id: null,
            created_at: post.created_at,
            media_type: MediaType.Image,
            mime_type: 'image/jpeg',
            owner_id: post.author_id,
            path: post.media_url,
            post_id: post.id,
            public_url: post.media_url,
            size_bytes: 0,
          } as const,
        ]
      : [];

  return (
    <div className="space-y-4">
      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.content}</p>
      <MediaGallery items={post.media.length > 0 ? post.media : fallbackMedia} />
    </div>
  );
};
