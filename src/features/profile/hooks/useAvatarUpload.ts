import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAvatar } from '@/features/profile/api/profile.api';
import type { AvatarUploadInput, AvatarUploadResponse, Profile } from '@/features/profile/types/profile.types';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

interface UseAvatarUploadParams {
  currentUserId: string;
  profile: Profile;
}

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

export const useAvatarUpload = ({ currentUserId, profile }: UseAvatarUploadParams) => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [selectedFile]);

  const uploadMutation = useMutation<AvatarUploadResponse, Error, AvatarUploadInput>({
    mutationFn: uploadAvatar,
    onSuccess: async () => {
      setErrorMessage(null);
      setSuccessMessage('Avatar uploaded successfully.');
      setSelectedFile(null);

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.profile.all,
      });
    },
    onError: (error) => {
      setSuccessMessage(null);
      setErrorMessage(error.message);
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextFile = event.target.files?.[0] ?? null;

    if (!nextFile) {
      setSelectedFile(null);
      return;
    }

    if (!nextFile.type.startsWith('image/')) {
      setSelectedFile(null);
      setSuccessMessage(null);
      setErrorMessage('Only image files are allowed.');
      return;
    }

    if (nextFile.size > MAX_AVATAR_SIZE_BYTES) {
      setSelectedFile(null);
      setSuccessMessage(null);
      setErrorMessage('Avatar must be 2MB or smaller.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setSelectedFile(nextFile);
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) {
      setErrorMessage('Choose an image before uploading.');
      return;
    }

    await uploadMutation.mutateAsync({
      currentUserId,
      file: selectedFile,
      profileId: profile.id,
    });
  };

  return {
    errorMessage,
    handleFileChange,
    handleUpload,
    isLoading: uploadMutation.isPending,
    previewUrl,
    selectedFileName: selectedFile?.name ?? null,
    successMessage,
  };
};
