import { useId, useState } from 'react';
import type { DragEvent } from 'react';
import { MediaPreview } from '@/features/media/components/MediaPreview/MediaPreview';
import type { MediaUploaderProps } from '@/features/media/components/MediaUploader/MediaUploader.types';

export const MediaUploader = ({
  accept = 'image/jpeg,image/png,image/webp,video/mp4,video/webm',
  errorMessage,
  isUploading = false,
  items,
  label = 'Add media',
  maxFiles = 5,
  type,
  onAddFiles,
  onRemoveItem,
}: MediaUploaderProps): JSX.Element => {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length > 0) {
      onAddFiles(event.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      <input
        accept={accept}
        className="hidden"
        id={inputId}
        multiple
        type="file"
        onChange={(event) => {
          if (event.target.files) {
            onAddFiles(event.target.files);
            event.target.value = '';
          }
        }}
      />

      <label
        className={`flex min-h-[144px] cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed px-6 py-8 text-center transition ${
          isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100'
        }`}
        htmlFor={inputId}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={handleDrop}
      >
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-2 text-sm text-slate-500">
          Drag and drop images or videos here, or click to select files for this {type}.
        </p>
        <p className="mt-2 text-xs font-medium text-slate-400">Max {maxFiles} files. Images up to 5MB, videos up to 50MB.</p>
      </label>

      {errorMessage ? <p className="text-sm font-medium text-rose-600">{errorMessage}</p> : null}

      {items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <MediaPreview key={item.id} isRemovingDisabled={isUploading} item={item} onRemove={onRemoveItem} />
          ))}
        </div>
      ) : null}
    </div>
  );
};
