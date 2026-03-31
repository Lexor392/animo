import { Link } from 'react-router-dom';
import type { CommentCardProps } from '@/features/comments/components/CommentCard/CommentCard.types';
import { LikeButton } from '@/features/likes/components/LikeButton/LikeButton';
import { MediaGallery } from '@/features/media/components/MediaGallery/MediaGallery';
import { buildProfileRoute } from '@/shared/constants/app-routes';
import { Avatar } from '@/shared/ui/Avatar/Avatar';
import { Button } from '@/shared/ui/Button/Button';

const formatCommentDate = (value: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export const CommentCard = ({
  comment,
  currentUserId,
  errorMessage,
  isDeleteLoading,
  isLikeLoading,
  onDelete,
  onToggleLike,
}: CommentCardProps): JSX.Element => {
  const canDelete = currentUserId === comment.author_id;

  return (
    <article className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-start gap-3">
        <Avatar name={comment.author.username} size="sm" src={comment.author.avatar_url} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <Link className="truncate text-sm font-semibold text-slate-900 transition hover:text-brand-600" to={buildProfileRoute(comment.author.username)}>
                @{comment.author.username}
              </Link>
              <p className="text-xs font-medium text-slate-400">{formatCommentDate(comment.created_at)}</p>
            </div>

            {canDelete ? (
              <Button
                className="shrink-0"
                isLoading={isDeleteLoading}
                size="sm"
                variant="ghost"
                onClick={() => {
                  onDelete(comment);
                }}
              >
                Delete
              </Button>
            ) : null}
          </div>

          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{comment.content}</p>
          {comment.media.length > 0 ? (
            <div className="mt-3">
              <MediaGallery items={comment.media} />
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <LikeButton
              isLiked={comment.viewer_has_liked}
              isLoading={isLikeLoading}
              likesCount={comment.likes_count}
              title={`${comment.likes_count} likes on this comment`}
              onClick={() => {
                onToggleLike(comment);
              }}
            />
          </div>
          {errorMessage ? <p className="mt-3 text-xs font-medium text-rose-600">{errorMessage}</p> : null}
        </div>
      </div>
    </article>
  );
};
