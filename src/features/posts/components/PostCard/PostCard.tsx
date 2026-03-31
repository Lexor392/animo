import { Link } from 'react-router-dom';
import { PostActions } from '@/features/posts/components/PostActions/PostActions';
import { PostAuthor } from '@/features/posts/components/PostAuthor/PostAuthor';
import { PostContent } from '@/features/posts/components/PostContent/PostContent';
import type { PostCardProps } from '@/features/posts/components/PostCard/PostCard.types';
import { buildCommunityPostRoute } from '@/shared/constants/app-routes';

export const PostCard = ({
  canDelete,
  errorMessage,
  isDeleteLoading,
  isLikeLoading,
  onDelete,
  onToggleLike,
  post,
  slug,
}: PostCardProps): JSX.Element => {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <PostAuthor post={post} />
        <Link className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:text-brand-600" to={buildCommunityPostRoute(slug, post.id)}>
          Open post
        </Link>
      </div>

      <div className="mt-5">
        <PostContent post={post} />
      </div>

      <div className="mt-5">
        <PostActions
          canDelete={canDelete}
          commentsCount={post.comments_count}
          errorMessage={errorMessage}
          isDeleteLoading={isDeleteLoading}
          isLikeLoading={isLikeLoading}
          isLiked={post.viewer_has_liked}
          likesCount={post.likes_count}
          onDelete={() => onDelete(post)}
          onToggleLike={() => onToggleLike(post)}
        />
      </div>
    </article>
  );
};
