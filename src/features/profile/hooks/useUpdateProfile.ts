import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '@/features/profile/api/profile.api';
import type { Profile, ProfileFieldErrors, UpdateProfileDto } from '@/features/profile/types/profile.types';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { buildProfileRoute } from '@/shared/constants/app-routes';

interface UseUpdateProfileParams {
  currentUserId: string;
  profile: Profile;
}

interface EditProfileFormValues {
  banner_url: string;
  bio: string;
  username: string;
}

const validateProfileValues = ({ bio, username }: EditProfileFormValues): ProfileFieldErrors => {
  const errors: ProfileFieldErrors = {};

  if (username.trim().length < 3) {
    errors.username = 'Username must contain at least 3 characters.';
  }

  if (bio.length > 500) {
    errors.bio = 'Bio must be 500 characters or fewer.';
  }

  return errors;
};

export const useUpdateProfile = ({ currentUserId, profile }: UseUpdateProfileParams) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<EditProfileFormValues>({
    banner_url: profile.banner_url ?? '',
    bio: profile.bio ?? '',
    username: profile.username,
  });
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setValues({
      banner_url: profile.banner_url ?? '',
      bio: profile.bio ?? '',
      username: profile.username,
    });
  }, [profile.banner_url, profile.bio, profile.username]);

  const updateMutation = useMutation<Profile, Error, UpdateProfileDto>({
    mutationFn: updateProfile,
    onSuccess: async (updatedProfile) => {
      setFormError(null);
      setSuccessMessage('Profile updated successfully. Redirecting...');

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.profile.all,
      });

      navigate(buildProfileRoute(updatedProfile.username), { replace: true });
    },
    onError: (error) => {
      setSuccessMessage(null);
      setFormError(error.message);
    },
  });

  const updateField =
    (field: keyof EditProfileFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      const nextValue = event.target.value;

      setValues((currentValues) => ({
        ...currentValues,
        [field]: nextValue,
      }));
      if (field === 'username' || field === 'bio') {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          [field]: undefined,
        }));
      }
      setFormError(null);
      setSuccessMessage(null);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const nextFieldErrors = validateProfileValues(values);

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setFormError(null);
      setSuccessMessage(null);
      return;
    }

    await updateMutation.mutateAsync({
      profileId: profile.id,
      currentUserId,
      username: values.username,
      bio: values.bio,
      banner_url: values.banner_url,
    });
  };

  return {
    values,
    fieldErrors,
    formError,
    successMessage,
    isLoading: updateMutation.isPending,
    updateField,
    handleSubmit,
  };
};
