import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost } from '@/features/posts/api/posts.api';
import type { DeletePostDto, PostsResponse } from '@/features/posts/types/post.types';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const useDeletePost = (communityId: string) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation<void, Error, DeletePostDto>({
    mutationFn: deletePost,
    onSuccess: async (_result, variables) => {
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
            items: currentData.items.filter((post) => post.id !== variables.postId),
          };
        },
      );

      queryClient.removeQueries({
        queryKey: QUERY_KEYS.posts.detail(variables.postId, variables.currentUserId),
      });

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.posts.community(communityId),
      });
    },
  });

  return {
    activePostId: deleteMutation.variables?.postId ?? null,
    deletePost: deleteMutation.mutateAsync,
    errorMessage: deleteMutation.error?.message ?? null,
    isLoading: deleteMutation.isPending,
  };
};
