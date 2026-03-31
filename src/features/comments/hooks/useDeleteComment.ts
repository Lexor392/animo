import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { deleteComment } from '@/features/comments/api/comments.api';
import type { Comment, CommentsResponse, DeleteCommentDto, DeleteCommentResponse } from '@/features/comments/types/comment.types';
import type { Post, PostsResponse } from '@/features/posts/types/post.types';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

interface DeleteCommentMutationContext {
  previousComments: InfiniteData<CommentsResponse, string | null> | undefined;
  previousFeedQueries: Array<[readonly unknown[], PostsResponse | undefined]>;
  previousPost: Post | null | undefined;
}

const updateCommentsCountInFeed = (currentData: PostsResponse | undefined, postId: string, nextCount: number) => {
  if (!currentData) {
    return currentData;
  }

  return {
    ...currentData,
    items: currentData.items.map((post) => (post.id === postId ? { ...post, comments_count: nextCount } : post)),
  };
};

const removeCommentFromPages = (currentData: InfiniteData<CommentsResponse, string | null> | undefined, commentId: string) => {
  if (!currentData) {
    return currentData;
  }

  return {
    ...currentData,
    pages: currentData.pages.map((page) => ({
      ...page,
      items: page.items.filter((comment) => comment.id !== commentId),
    })),
  };
};

export const useDeleteComment = (postId: string, communityId: string, currentUserId: string) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation<DeleteCommentResponse, Error, DeleteCommentDto, DeleteCommentMutationContext>({
    mutationFn: deleteComment,
    onMutate: async ({ commentId }) => {
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

      queryClient.setQueryData<InfiniteData<CommentsResponse, string | null>>(QUERY_KEYS.comments.byPost(postId, currentUserId), (currentData) =>
        removeCommentFromPages(currentData, commentId),
      );

      queryClient.setQueriesData<PostsResponse | undefined>(
        {
          queryKey: QUERY_KEYS.posts.community(communityId),
        },
        (currentData) => {
          const currentCount = currentData?.items.find((post) => post.id === postId)?.comments_count ?? 0;
          return updateCommentsCountInFeed(currentData, postId, Math.max(currentCount - 1, 0));
        },
      );

      queryClient.setQueryData<Post | null>(QUERY_KEYS.posts.detail(postId, currentUserId), (currentPost) => {
        if (!currentPost) {
          return currentPost;
        }

        return {
          ...currentPost,
          comments_count: Math.max(currentPost.comments_count - 1, 0),
        };
      });

      return {
        previousComments,
        previousFeedQueries,
        previousPost,
      };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(QUERY_KEYS.comments.byPost(postId, currentUserId), context?.previousComments);
      context?.previousFeedQueries.forEach(([queryKey, queryData]) => {
        queryClient.setQueryData(queryKey, queryData);
      });
      queryClient.setQueryData(QUERY_KEYS.posts.detail(postId, currentUserId), context?.previousPost ?? null);
    },
    onSuccess: (result) => {
      queryClient.setQueryData<InfiniteData<CommentsResponse, string | null>>(QUERY_KEYS.comments.byPost(postId, currentUserId), (currentData) =>
        removeCommentFromPages(currentData, result.commentId),
      );

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

  const handleDelete = async (comment: Comment): Promise<void> => {
    await deleteMutation.mutateAsync({
      commentId: comment.id,
      currentUserId,
      postId,
    });
  };

  return {
    activeCommentId: deleteMutation.variables?.commentId ?? null,
    deleteComment: handleDelete,
    errorMessage: deleteMutation.error?.message ?? null,
    isLoading: deleteMutation.isPending,
  };
};
