import type { MediaGalleryItem, MediaOwnerType } from '@/features/media/types/media.types';

export interface MediaUploaderProps {
  accept?: string;
  errorMessage?: string | null;
  isUploading?: boolean;
  items: MediaGalleryItem[];
  label?: string;
  maxFiles?: number;
  type: MediaOwnerType;
  onAddFiles: (files: File[] | FileList) => void;
  onRemoveItem: (itemId: string) => void;
}
