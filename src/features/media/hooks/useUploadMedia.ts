import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MEDIA_RULES, uploadMedia, validateMediaFile } from '@/features/media/api/media.api';
import type { MediaGalleryItem, MediaOwnerType, UploadMediaResponse } from '@/features/media/types/media.types';
import { MediaType } from '@/features/media/types/media.types';

interface UseUploadMediaOptions {
  maxFiles?: number;
  type: MediaOwnerType;
}

interface UploadSelectedParams {
  entityId: string;
  ownerId: string;
}

const buildPreviewItem = (file: File): MediaGalleryItem => ({
  id: crypto.randomUUID(),
  file,
  mediaType: file.type.startsWith('video/') ? MediaType.Video : MediaType.Image,
  previewUrl: URL.createObjectURL(file),
  progress: 0,
  status: 'idle',
});

export const useUploadMedia = ({ maxFiles = MEDIA_RULES.maxFiles, type }: UseUploadMediaOptions) => {
  const [items, setItems] = useState<MediaGalleryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const itemsRef = useRef<MediaGalleryItem[]>([]);

  const uploadMutation = useMutation<UploadMediaResponse[], Error, UploadSelectedParams>({
    mutationFn: async ({ entityId, ownerId }) => {
      const pendingItems = items.filter((item) => item.file && item.status !== 'uploaded');
      const uploadedItems: UploadMediaResponse[] = [];

      for (const item of pendingItems) {
        if (!item.file) {
          continue;
        }

        setItems((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id ? { ...currentItem, progress: 15, status: 'uploading', errorMessage: undefined } : currentItem,
          ),
        );

        try {
          // Supabase Storage client does not expose byte-level progress,
          // so we move through staged progress values around the async upload lifecycle.
          setItems((currentItems) =>
            currentItems.map((currentItem) => (currentItem.id === item.id ? { ...currentItem, progress: 55 } : currentItem)),
          );

          const result = await uploadMedia({
            entityId,
            file: item.file,
            ownerId,
            type,
          });

          uploadedItems.push(result);

          setItems((currentItems) =>
            currentItems.map((currentItem) =>
              currentItem.id === item.id
                ? {
                    ...currentItem,
                    progress: 100,
                    status: 'uploaded',
                    uploadedMedia: result.media,
                  }
                : currentItem,
            ),
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to upload media.';

          setItems((currentItems) =>
            currentItems.map((currentItem) =>
              currentItem.id === item.id
                ? {
                    ...currentItem,
                    errorMessage: message,
                    progress: 0,
                    status: 'error',
                  }
                : currentItem,
            ),
          );

          throw error;
        }
      }

      return uploadedItems;
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const addFiles = (files: File[] | FileList): void => {
    const nextFiles = Array.from(files);

    if (nextFiles.length === 0) {
      return;
    }

    if (items.length + nextFiles.length > maxFiles) {
      setErrorMessage(`You can attach up to ${maxFiles} files.`);
      return;
    }

    try {
      nextFiles.forEach(validateMediaFile);
      const nextItems = nextFiles.map(buildPreviewItem);
      setItems((currentItems) => [...currentItems, ...nextItems]);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to attach the selected file.');
    }
  };

  const removeItem = (itemId: string): void => {
    setItems((currentItems) => {
      const itemToRemove = currentItems.find((item) => item.id === itemId);

      if (itemToRemove?.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }

      return currentItems.filter((item) => item.id !== itemId);
    });
    setErrorMessage(null);
  };

  const reset = (): void => {
    setItems((currentItems) => {
      currentItems.forEach((item) => {
        if (item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      return [];
    });
    setErrorMessage(null);
  };

  const uploadSelected = async (params: UploadSelectedParams) => {
    return uploadMutation.mutateAsync(params);
  };

  const uploadedMedia = useMemo(() => items.flatMap((item) => (item.uploadedMedia ? [item.uploadedMedia] : [])), [items]);

  return {
    addFiles,
    errorMessage,
    isUploading: uploadMutation.isPending,
    items,
    removeItem,
    reset,
    uploadSelected,
    uploadedMedia,
  };
};
