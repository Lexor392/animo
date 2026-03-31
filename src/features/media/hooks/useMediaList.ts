import { useQuery } from '@tanstack/react-query';
import { getMediaList } from '@/features/media/api/media.api';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const useMediaList = ({ commentId, postId }: { commentId?: string; postId?: string }) => {
  return useQuery({
    queryKey: postId ? QUERY_KEYS.media.byPost(postId) : QUERY_KEYS.media.byComment(commentId ?? ''),
    queryFn: () =>
      getMediaList({
        commentId,
        postId,
      }),
    enabled: Boolean(postId || commentId),
  });
};
