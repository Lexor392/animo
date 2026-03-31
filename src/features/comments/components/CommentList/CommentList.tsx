import { CommentCard } from '@/features/comments/components/CommentCard/CommentCard';
import { CommentSkeleton } from '@/features/comments/components/CommentSkeleton/CommentSkeleton';
import type { CommentListProps } from '@/features/comments/components/CommentList/CommentList.types';
import { useComments } from '@/features/comments/hooks/useComments';
import { useDeleteComment } from '@/features/comments/hooks/useDeleteComment';
import { useLikeComment } from '@/features/likes/hooks/useLikeComment';
import { Button } from '@/shared/ui/Button/Button';

export const CommentList = ({ communityId, currentUserId, postId }: CommentListProps): JSX.Element => {
  const { comments, error, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useComments(postId, currentUserId);
  const deleteComments = useDeleteComment(postId, communityId, currentUserId ?? '');
  const likeComments = useLikeComment(postId, currentUserId ?? '');

  if (isLoading) {
    return <CommentSkeleton count={2} />;
  }

  if (error) {
    return (
      <section className="rounded-[1.25rem] border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
        {error.message}
      </section>
    );
  }

  if (comments.length === 0) {
    return (
      <section className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50/70 p-4 text-sm text-slate-500">
        No comments yet.
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          errorMessage={deleteComments.errorMessage || likeComments.errorMessage}
          isDeleteLoading={deleteComments.activeCommentId === comment.id}
          isLikeLoading={likeComments.activeCommentId === comment.id}
          onDelete={(nextComment) => {
            if (!currentUserId) {
              return;
            }

            void deleteComments.deleteComment(nextComment);
          }}
          onToggleLike={(nextComment) => {
            if (!currentUserId) {
              return;
            }

            void likeComments.toggleLike(nextComment);
          }}
        />
      ))}

      {hasNextPage ? (
        <Button
          className="w-full"
          isLoading={isFetchingNextPage}
          size="sm"
          variant="secondary"
          onClick={() => {
            void fetchNextPage();
          }}
        >
          Load more comments
        </Button>
      ) : null}
    </div>
  );
};
