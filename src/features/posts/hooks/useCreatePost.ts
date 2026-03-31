import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUploadMedia } from '@/features/media/hooks/useUploadMedia';
import { createPost } from '@/features/posts/api/posts.api';
import type { CreatePostDto, CreatePostFieldErrors, CreatePostFormValues, Post, PostsResponse } from '@/features/posts/types/post.types';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

const INITIAL_VALUES: CreatePostFormValues = {
  content: '',
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
  const mediaUpload = useUploadMedia({
    type: 'post',
  });

  const createMutation = useMutation<Post, Error, CreatePostDto>({
    mutationFn: createPost,
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const nextErrors = validatePostValues(values);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError(null);
      setSuccessMessage(null);
      return;
    }

    const createdPost = await createMutation.mutateAsync({
      authorId: currentUserId,
      communityId,
      content: values.content,
    });

    let nextPost = createdPost;
    let nextSuccessMessage = 'Post published.';

    if (mediaUpload.items.length > 0) {
      try {
        const uploadedItems = await mediaUpload.uploadSelected({
          entityId: createdPost.id,
          ownerId: currentUserId,
        });

        nextPost = {
          ...createdPost,
          media: uploadedItems.map((item) => item.media),
          media_url: uploadedItems[0]?.publicUrl ?? createdPost.media_url,
        };
      } catch (error) {
        nextSuccessMessage = 'Post published, but some media failed to upload.';
        setFormError(error instanceof Error ? error.message : 'Post was created, but media upload failed.');
      }
    }

    if (nextSuccessMessage === 'Post published.') {
      setFormError(null);
    }

    setSuccessMessage(nextSuccessMessage);
    setValues(INITIAL_VALUES);
    mediaUpload.reset();

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
          items: [nextPost, ...currentData.items],
        };
      },
    );

    queryClient.setQueryData(QUERY_KEYS.posts.detail(nextPost.id, currentUserId), nextPost);

    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.posts.community(communityId),
    });
  };

  return {
    fieldErrors,
    formError,
    handleSubmit,
    isLoading: createMutation.isPending || mediaUpload.isUploading,
    mediaUpload,
    successMessage,
    updateContent,
    values,
  };
};
