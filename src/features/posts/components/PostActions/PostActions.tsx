import { LikeButton } from '@/features/likes/components/LikeButton/LikeButton';
import { Button } from '@/shared/ui/Button/Button';
import type { PostActionsProps } from '@/features/posts/components/PostActions/PostActions.types';

export const PostActions = ({
  canDelete,
  commentsCount,
  errorMessage,
  isDeleteLoading,
  isLikeLoading,
  isLiked,
  likesCount,
  onDelete,
  onToggleLike,
}: PostActionsProps): JSX.Element => {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <LikeButton
          isLiked={isLiked}
          isLoading={isLikeLoading}
          likesCount={likesCount}
          title={`${likesCount} likes on this post`}
          onClick={onToggleLike}
        />

        <span className="inline-flex h-9 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-semibold text-slate-600">
          Comments {commentsCount}
        </span>

        <span className="inline-flex h-9 items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 text-sm font-semibold text-slate-400">
          Pin later
        </span>

        {canDelete ? (
          <Button isLoading={isDeleteLoading} size="sm" variant="danger" onClick={onDelete}>
            Delete
          </Button>
        ) : null}
      </div>

      {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
    </div>
  );
};
