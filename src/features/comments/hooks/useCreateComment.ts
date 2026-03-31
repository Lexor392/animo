import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { createComment } from '@/features/comments/api/comments.api';
import type {
  Comment,
  CommentsResponse,
  CreateCommentDto,
  CreateCommentFieldErrors,
  CreateCommentFormValues,
  CreateCommentResponse,
} from '@/features/comments/types/comment.types';
import type { Post, PostsResponse } from '@/features/posts/types/post.types';
import type { Profile } from '@/features/profile/types/profile.types';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

const INITIAL_VALUES: CreateCommentFormValues = {
  content: '',
};

interface CreateCommentMutationContext {
  previousComments: InfiniteData<CommentsResponse, string | null> | undefined;
  previousFeedQueries: Array<[readonly unknown[], PostsResponse | undefined]>;
  previousPost: Post | null | undefined;
  temporaryCommentId: string;
}

const validateCommentValues = ({ content }: CreateCommentFormValues): CreateCommentFieldErrors => {
  const errors: CreateCommentFieldErrors = {};

  if (!content.trim()) {
    errors.content = 'Write a comment before sending it.';
  }

  if (content.length > 1000) {
    errors.content = 'Comment must be 1000 characters or fewer.';
  }

  return errors;
};

const updateCommentsCountInFeed = (currentData: PostsResponse | undefined, postId: string, nextCount: number) => {
  if (!currentData) {
    return currentData;
  }

  return {
    ...currentData,
    items: currentData.items.map((post) => (post.id === postId ? { ...post, comments_count: nextCount } : post)),
  };
};

const updateCommentsPages = (
  currentData: InfiniteData<CommentsResponse, string | null> | undefined,
  update: (items: Comment[]) => Comment[],
) => {
  if (!currentData) {
    return currentData;
  }

  return {
    ...currentData,
    pages: currentData.pages.map((page, pageIndex) => ({
      ...page,
      items: pageIndex === 0 ? update(page.items) : page.items,
    })),
  };
};

export const useCreateComment = (postId: string, communityId: string, currentUserId: string) => {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<CreateCommentFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<CreateCommentFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useMutation<CreateCommentResponse, Error, CreateCommentDto, CreateCommentMutationContext>({
    mutationFn: createComment,
    onMutate: async ({ content }) => {
      const temporaryCommentId = `temp-${crypto.randomUUID()}`;
      const timestamp = new Date().toISOString();
      const trimmedContent = content.trim();

      await Promise.all([
        queryClient.cancelQueries({
          queryKey: QUERY_KEYS.comments.byPost(postId, currentUserId),
        }),
        queryClient.cancelQueries({
          queryKey: QUERY_KEYS.posts.community(communityId),
        }),
        queryClient.cancelQueries({
          queryKey: QUERY_KEYS.posts.detail(postId, currentUserId),
        }),
      ]);

      const previousComments = queryClient.getQueryData<InfiniteData<CommentsResponse, string | null>>(QUERY_KEYS.comments.byPost(postId, currentUserId));
      const previousFeedQueries = queryClient.getQueriesData<PostsResponse | undefined>({
        queryKey: QUERY_KEYS.posts.community(communityId),
      });
      const previousPost = queryClient.getQueryData<Post | null>(QUERY_KEYS.posts.detail(postId, currentUserId));
      const cachedProfile = queryClient.getQueryData<Profile | null>(QUERY_KEYS.profile.byId(currentUserId));

      const optimisticComment: Comment = {
        id: temporaryCommentId,
        author_id: currentUserId,
        author: {
          user_id: currentUserId,
          username: cachedProfile?.username ?? 'you',
          avatar_url: cachedProfile?.avatar_url ?? null,
        },
        content: trimmedContent,
        created_at: timestamp,
        post_id: postId,
        updated_at: timestamp,
        likes_count: 0,
        viewer_has_liked: false,
      };

      queryClient.setQueryData<InfiniteData<CommentsResponse, string | null>>(QUERY_KEYS.comments.byPost(postId, currentUserId), (currentData) => {
        if (!currentData) {
          return {
            pages: [
              {
                items: [optimisticComment],
                nextCursor: null,
              },
            ],
            pageParams: [null],
          };
        }

        return updateCommentsPages(currentData, (items) => [optimisticComment, ...items]);
      });

      queryClient.setQueriesData<PostsResponse | undefined>(
        {
          queryKey: QUERY_KEYS.posts.community(communityId),
        },
        (currentData) => {
          const currentCount = currentData?.items.find((post) => post.id === postId)?.comments_count ?? 0;
          return updateCommentsCountInFeed(currentData, postId, currentCount + 1);
        },
      );

      queryClient.setQueryData<Post | null>(QUERY_KEYS.posts.detail(postId, currentUserId), (currentPost) => {
        if (!currentPost) {
          return currentPost;
        }

        return {
          ...currentPost,
          comments_count: currentPost.comments_count + 1,
        };
      });

      return {
        previousComments,
        previousFeedQueries,
        previousPost,
        temporaryCommentId,
      };
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(QUERY_KEYS.comments.byPost(postId, currentUserId), context?.previousComments);
      context?.previousFeedQueries.forEach(([queryKey, queryData]) => {
        queryClient.setQueryData(queryKey, queryData);
      });
      queryClient.setQueryData(QUERY_KEYS.posts.detail(postId, currentUserId), context?.previousPost ?? null);
      setFormError(error.message);
    },
    onSuccess: (result, _variables, context) => {
      setValues(INITIAL_VALUES);
      setFormError(null);
      setFieldErrors({});

      queryClient.setQueryData<InfiniteData<CommentsResponse, string | null>>(QUERY_KEYS.comments.byPost(postId, currentUserId), (currentData) => {
        if (!currentData) {
          return {
            pages: [
              {
                items: [result.comment],
                nextCursor: null,
              },
            ],
            pageParams: [null],
          };
        }

        return updateCommentsPages(currentData, (items) => {
          const replacedItems = items.map((comment) => (comment.id === context?.temporaryCommentId ? result.comment : comment));
          const hasComment = replacedItems.some((comment) => comment.id === result.comment.id);
          return hasComment ? replacedItems : [result.comment, ...replacedItems];
        });
      });

      queryClient.setQueriesData<PostsResponse | undefined>(
        {
          queryKey: QUERY_KEYS.posts.community(communityId),
        },
        (currentData) => updateCommentsCountInFeed(currentData, result.postId, result.commentsCount),
      );

      queryClient.setQueryData<Post | null>(QUERY_KEYS.posts.detail(postId, currentUserId), (currentPost) => {
        if (!currentPost) {
          return currentPost;
        }

        return {
          ...currentPost,
          comments_count: result.commentsCount,
        };
      });
    },
  });

  const updateContent = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setValues({
      content: event.target.value,
    });
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      content: undefined,
    }));
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const nextErrors = validateCommentValues(values);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError(null);
      return;
    }

    await createMutation.mutateAsync({
      authorId: currentUserId,
      content: values.content,
      postId,
    });
  };

  return {
    fieldErrors,
    formError,
    handleSubmit,
    isLoading: createMutation.isPending,
    updateContent,
    values,
  };
};
