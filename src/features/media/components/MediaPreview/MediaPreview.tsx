import type { MediaPreviewProps } from '@/features/media/components/MediaPreview/MediaPreview.types';
import { MediaType } from '@/features/media/types/media.types';
import { Button } from '@/shared/ui/Button/Button';

export const MediaPreview = ({ isRemovingDisabled = false, item, onRemove }: MediaPreviewProps): JSX.Element => {
  return (
    <article className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-50">
      <div className="relative">
        {item.mediaType === MediaType.Video ? (
          <video className="max-h-[240px] w-full object-cover" controls preload="metadata" src={item.previewUrl} />
        ) : (
          <img alt="Media preview" className="max-h-[240px] w-full object-cover" loading="lazy" src={item.previewUrl} />
        )}
      </div>

      <div className="space-y-3 p-3">
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand-500 transition-all duration-300" style={{ width: `${item.progress}%` }} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-slate-500">
            {item.status === 'uploaded' ? 'Uploaded' : item.status === 'uploading' ? 'Uploading...' : item.status === 'error' ? 'Upload failed' : 'Ready to upload'}
          </p>

          {onRemove ? (
            <Button
              disabled={isRemovingDisabled}
              size="sm"
              variant="ghost"
              onClick={() => {
                onRemove(item.id);
              }}
            >
              Remove
            </Button>
          ) : null}
        </div>

        {item.errorMessage ? <p className="text-xs font-medium text-rose-600">{item.errorMessage}</p> : null}
      </div>
    </article>
  );
};
