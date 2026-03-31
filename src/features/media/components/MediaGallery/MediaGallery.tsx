import type { MediaGalleryProps } from '@/features/media/components/MediaGallery/MediaGallery.types';
import { MediaType } from '@/features/media/types/media.types';

export const MediaGallery = ({ items }: MediaGalleryProps): JSX.Element | null => {
  if (items.length === 0) {
    return null;
  }

  const gridClassName =
    items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-2' : items.length === 3 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3';

  return (
    <div className={`grid gap-3 ${gridClassName}`}>
      {items.map((item) => (
        <div key={item.id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
          {item.media_type === MediaType.Video ? (
            <video className="max-h-[420px] w-full object-cover" controls preload="metadata" src={item.public_url} />
          ) : (
            <img alt="Uploaded media" className="max-h-[420px] w-full object-cover" loading="lazy" src={item.public_url} />
          )}
        </div>
      ))}
    </div>
  );
};
