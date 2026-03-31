import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createCommunity } from '@/features/communities/api/communities.api';
import type { Community, CommunityFieldErrors, CreateCommunityDto, CreateCommunityFormValues } from '@/features/communities/types/community.types';
import { buildCommunityRoute } from '@/shared/constants/app-routes';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

const INITIAL_VALUES: CreateCommunityFormValues = {
  name: '',
  description: '',
  iconFile: null,
  bannerFile: null,
};

const validateCommunityValues = (values: CreateCommunityFormValues): CommunityFieldErrors => {
  const errors: CommunityFieldErrors = {};

  if (values.name.trim().length < 3) {
    errors.name = 'Community name must contain at least 3 characters.';
  }

  if (values.description.length > 1000) {
    errors.description = 'Description must be 1000 characters or fewer.';
  }

  if (!values.iconFile) {
    errors.iconFile = 'Community icon is required.';
  }

  return errors;
};

export const useCreateCommunity = (currentUserId: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<CreateCommunityFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<CommunityFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!values.iconFile) {
      setIconPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(values.iconFile);
    setIconPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [values.iconFile]);

  useEffect(() => {
    if (!values.bannerFile) {
      setBannerPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(values.bannerFile);
    setBannerPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [values.bannerFile]);

  const createMutation = useMutation<Community, Error, CreateCommunityDto>({
    mutationFn: createCommunity,
    onSuccess: async (community) => {
      setFormError(null);
      setSuccessMessage('Community created successfully. Redirecting...');

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.communities.all,
      });

      navigate(buildCommunityRoute(community.slug), { replace: true });
    },
    onError: (error) => {
      setSuccessMessage(null);
      setFormError(error.message);
    },
  });

  const updateField =
    (field: 'description' | 'name') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      const nextValue = event.target.value;

      setValues((currentValues) => ({
        ...currentValues,
        [field]: nextValue,
      }));
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
      }));
      setFormError(null);
      setSuccessMessage(null);
    };

  const updateFileField =
    (field: 'bannerFile' | 'iconFile') =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      const nextFile = event.target.files?.[0] ?? null;

      if (nextFile && !nextFile.type.startsWith('image/')) {
        setFormError('Only image files are allowed.');
        setSuccessMessage(null);
        return;
      }

      setValues((currentValues) => ({
        ...currentValues,
        [field]: nextFile,
      }));
      if (field === 'iconFile') {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          iconFile: undefined,
        }));
      }
      setFormError(null);
      setSuccessMessage(null);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const nextFieldErrors = validateCommunityValues(values);

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setFormError(null);
      setSuccessMessage(null);
      return;
    }

    await createMutation.mutateAsync({
      currentUserId,
      name: values.name,
      description: values.description,
      iconFile: values.iconFile as File,
      bannerFile: values.bannerFile,
    });
  };

  return {
    bannerPreviewUrl,
    fieldErrors,
    formError,
    handleSubmit,
    iconPreviewUrl,
    isLoading: createMutation.isPending,
    successMessage,
    updateField,
    updateFileField,
    values,
  };
};
