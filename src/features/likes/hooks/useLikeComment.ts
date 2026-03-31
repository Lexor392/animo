import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { toggleCommentLike } from '@/features/likes/api/likes.api';
import type { Comment, CommentsResponse } from '@/features/comments/types/comment.types';
import type { ToggleLikeResponse } from '@/features/likes/types/like.types';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

interface CommentLikeMutationContext {
  previousComments: InfiniteData<CommentsResponse, string | null> | undefined;
}

const updateCommentsPages = (
  currentData: InfiniteData<CommentsResponse, string | null> | undefined,
  commentId: string,
  update: (comment: Comment) => Comment,
) => {
  if (!currentData) {
    return currentData;
  }

  return {
    ...currentData,
    pages: currentData.pages.map((page) => ({
      ...page,
      items: page.items.map((comment) => (comment.id === commentId ? update(comment) : comment)),
    })),
  };
};

export const useLikeComment = (postId: string, currentUserId: string) => {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation<ToggleLikeResponse, Error, Comment, CommentLikeMutationContext>({
    mutationFn: (comment) =>
      toggleCommentLike({
        commentId: comment.id,
        userId: currentUserId,
      }),
    onMutate: async (comment) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.comments.byPost(postId, currentUserId),
      });

      const previousComments = queryClient.getQueryData<InfiniteData<CommentsResponse, string | null>>(
        QUERY_KEYS.comments.byPost(postId, currentUserId),
      );

      queryClient.setQueryData<InfiniteData<CommentsResponse, string | null>>(
        QUERY_KEYS.comments.byPost(postId, currentUserId),
        (currentData) =>
          updateCommentsPages(currentData, comment.id, (currentComment) => ({
            ...currentComment,
            likes_count: currentComment.viewer_has_liked ? Math.max(currentComment.likes_count - 1, 0) : currentComment.likes_count + 1,
            viewer_has_liked: !currentComment.viewer_has_liked,
          })),
      );

      return {
        previousComments,
      };
    },
    onError: (_error, _comment, context) => {
      queryClient.setQueryData(QUERY_KEYS.comments.byPost(postId, currentUserId), context?.previousComments);
    },
    onSuccess: (result) => {
      queryClient.setQueryData<InfiniteData<CommentsResponse, string | null>>(
        QUERY_KEYS.comments.byPost(postId, currentUserId),
        (currentData) =>
          updateCommentsPages(currentData, result.targetId, (currentComment) => ({
            ...currentComment,
            likes_count: result.likesCount,
            viewer_has_liked: result.viewerHasLiked,
          })),
      );
    },
  });

  return {
    activeCommentId: toggleMutation.variables?.id ?? null,
    errorMessage: toggleMutation.error?.message ?? null,
    isLoading: toggleMutation.isPending,
    toggleLike: toggleMutation.mutateAsync,
  };
};
