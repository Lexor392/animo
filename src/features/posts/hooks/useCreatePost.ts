import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/features/posts/api/posts.api';
import type { CreatePostDto, CreatePostFieldErrors, CreatePostFormValues, Post, PostsResponse } from '@/features/posts/types/post.types';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

const INITIAL_VALUES: CreatePostFormValues = {
  content: '',
  mediaFile: null,
};

const validatePostValues = ({ content }: CreatePostFormValues): CreatePostFieldErrors => {
  const errors: CreatePostFieldErrors = {};

  if (!content.trim()) {
    errors.content = 'Write something before publishing.';
  }

  if (content.length > 5000) {
    errors.content = 'Post content must be 5000 characters or fewer.';
  }

  return errors;
};

export const useCreatePost = (communityId: string, currentUserId: string) => {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<CreatePostFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<CreatePostFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createMutation = useMutation<Post, Error, CreatePostDto>({
    mutationFn: createPost,
    onSuccess: async (createdPost) => {
      setFormError(null);
      setSuccessMessage('Post published.');
      setValues(INITIAL_VALUES);

      queryClient.setQueriesData<PostsResponse | undefined>(
        {
          queryKey: QUERY_KEYS.posts.community(communityId),
        },
        (currentData) => {
          if (!currentData) {
            return currentData;
          }

          return {
            ...currentData,
            items: [createdPost, ...currentData.items],
          };
        },
      );

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.posts.community(communityId),
      });
    },
    onError: (error) => {
      setSuccessMessage(null);
      setFormError(error.message);
    },
  });

  const updateContent = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setValues((currentValues) => ({
      ...currentValues,
      content: event.target.value,
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      content: undefined,
    }));
    setFormError(null);
    setSuccessMessage(null);
  };

  const updateMedia = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextFile = event.target.files?.[0] ?? null;

    if (nextFile && !nextFile.type.startsWith('image/')) {
      setFormError('Only image files are allowed.');
      setSuccessMessage(null);
      return;
    }

    if (nextFile && nextFile.size > 5 * 1024 * 1024) {
      setFormError('Post image must be 5MB or smaller.');
      setSuccessMessage(null);
      return;
    }

    setValues((currentValues) => ({
      ...currentValues,
      mediaFile: nextFile,
    }));
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const nextErrors = validatePostValues(values);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError(null);
      setSuccessMessage(null);
      return;
    }

    await createMutation.mutateAsync({
      authorId: currentUserId,
      communityId,
      content: values.content,
      mediaFile: values.mediaFile,
    });
  };

  return {
    fieldErrors,
    formError,
    handleSubmit,
    isLoading: createMutation.isPending,
    successMessage,
    updateContent,
    updateMedia,
    values,
  };
};
