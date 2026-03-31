import { PostCard } from '@/features/posts/components/PostCard/PostCard';
import type { PostListProps } from '@/features/posts/components/PostList/PostList.types';

export const PostList = ({
  communityOwnerId,
  currentUserId,
  deleteLoadingPostId = null,
  emptyMessage = 'No posts yet.',
  errorMessage,
  likeLoadingPostId = null,
  onDelete,
  onToggleLike,
  posts,
  slug,
}: PostListProps): JSX.Element => {
  if (posts.length === 0) {
    return (
      <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-soft">
        <h2 className="text-2xl font-bold text-slate-900">No posts yet</h2>
        <p className="mt-3 text-sm text-slate-500">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          canDelete={post.author_id === currentUserId || communityOwnerId === currentUserId}
          currentUserId={currentUserId}
          errorMessage={errorMessage}
          isDeleteLoading={deleteLoadingPostId === post.id}
          isLikeLoading={likeLoadingPostId === post.id}
          post={post}
          slug={slug}
          onDelete={onDelete}
          onToggleLike={onToggleLike}
        />
      ))}
    </div>
  );
};
