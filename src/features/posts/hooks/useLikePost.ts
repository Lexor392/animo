import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePost, unlikePost } from '@/features/posts/api/posts.api';
import type { LikePostDto, Post, PostActionResponse, PostsResponse, UnlikePostDto } from '@/features/posts/types/post.types';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

interface LikeMutationContext {
  previousFeedQueries: Array<[readonly unknown[], PostsResponse | undefined]>;
  previousPost: Post | null | undefined;
}

const updatePostInFeed = (currentData: PostsResponse | undefined, postId: string, update: (post: Post) => Post) => {
  if (!currentData) {
    return currentData;
  }

  return {
    ...currentData,
    items: currentData.items.map((post) => (post.id === postId ? update(post) : post)),
  };
};

export const useLikePost = (communityId: string, currentUserId: string) => {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation<PostActionResponse, Error, Post, LikeMutationContext>({
    mutationFn: async (post) => {
      if (post.viewer_has_liked) {
        const payload: UnlikePostDto = {
          currentUserId,
          postId: post.id,
        };
        return unlikePost(payload);
      }

      const payload: LikePostDto = {
        currentUserId,
        postId: post.id,
      };
      return likePost(payload);
    },
    onMutate: async (post) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: QUERY_KEYS.posts.community(communityId),
        }),
        queryClient.cancelQueries({
          queryKey: QUERY_KEYS.posts.detail(post.id, currentUserId),
        }),
      ]);

      const previousFeedQueries = queryClient.getQueriesData<PostsResponse | undefined>({
        queryKey: QUERY_KEYS.posts.community(communityId),
      });
      const previousPost = queryClient.getQueryData<Post | null>(QUERY_KEYS.posts.detail(post.id, currentUserId));

      queryClient.setQueriesData<PostsResponse | undefined>(
        {
          queryKey: QUERY_KEYS.posts.community(communityId),
        },
        (currentData) =>
          updatePostInFeed(currentData, post.id, (currentPost) => ({
            ...currentPost,
            likes_count: currentPost.viewer_has_liked ? Math.max(currentPost.likes_count - 1, 0) : currentPost.likes_count + 1,
            viewer_has_liked: !currentPost.viewer_has_liked,
          })),
      );

      queryClient.setQueryData<Post | null>(QUERY_KEYS.posts.detail(post.id, currentUserId), (currentPost) => {
        if (!currentPost) {
          return currentPost;
        }

        return {
          ...currentPost,
          likes_count: currentPost.viewer_has_liked ? Math.max(currentPost.likes_count - 1, 0) : currentPost.likes_count + 1,
          viewer_has_liked: !currentPost.viewer_has_liked,
        };
      });

      return {
        previousFeedQueries,
        previousPost,
      };
    },
    onError: (_error, post, context) => {
      context?.previousFeedQueries.forEach(([queryKey, queryData]) => {
        queryClient.setQueryData(queryKey, queryData);
      });
      queryClient.setQueryData(QUERY_KEYS.posts.detail(post.id, currentUserId), context?.previousPost ?? null);
    },
    onSuccess: (result) => {
      queryClient.setQueriesData<PostsResponse | undefined>(
        {
          queryKey: QUERY_KEYS.posts.community(communityId),
        },
        (currentData) =>
          updatePostInFeed(currentData, result.postId, (currentPost) => ({
            ...currentPost,
            likes_count: result.likesCount,
            viewer_has_liked: result.viewerHasLiked,
          })),
      );

      queryClient.setQueryData<Post | null>(QUERY_KEYS.posts.detail(result.postId, currentUserId), (currentPost) => {
        if (!currentPost) {
          return currentPost;
        }

        return {
          ...currentPost,
          likes_count: result.likesCount,
          viewer_has_liked: result.viewerHasLiked,
        };
      });
    },
  });

  return {
    activePostId: toggleMutation.variables?.id ?? null,
    errorMessage: toggleMutation.error?.message ?? null,
    isLoading: toggleMutation.isPending,
    toggleLike: toggleMutation.mutateAsync,
  };
};
