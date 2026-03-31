import { useInfiniteQuery } from '@tanstack/react-query';
import { getCommentsByPost } from '@/features/comments/api/comments.api';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

const DEFAULT_COMMENTS_LIMIT = 10;

export const useComments = (postId: string, currentUserId?: string | null, limit = DEFAULT_COMMENTS_LIMIT) => {
  const commentsQuery = useInfiniteQuery({
    queryKey: QUERY_KEYS.comments.byPost(postId, currentUserId),
    queryFn: ({ pageParam }) =>
      getCommentsByPost({
        postId,
        currentUserId,
        cursor: pageParam,
        limit,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(postId),
  });

  return {
    ...commentsQuery,
    comments: commentsQuery.data?.pages.flatMap((page) => page.items) ?? [],
  };
};
