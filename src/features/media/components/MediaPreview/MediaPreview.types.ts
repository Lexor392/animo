import type { MediaGalleryItem } from '@/features/media/types/media.types';

export interface MediaPreviewProps {
  isRemovingDisabled?: boolean;
  item: MediaGalleryItem;
  onRemove?: (itemId: string) => void;
}
