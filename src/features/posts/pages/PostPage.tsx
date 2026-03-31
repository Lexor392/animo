import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CommunitySidebar } from '@/features/communities/components/CommunitySidebar/CommunitySidebar';
import { useCommunity } from '@/features/communities/hooks/useCommunity';
import { useLikePost } from '@/features/likes/hooks/useLikePost';
import { PostCard } from '@/features/posts/components/PostCard/PostCard';
import { PostSkeleton } from '@/features/posts/components/PostSkeleton/PostSkeleton';
import { useDeletePost } from '@/features/posts/hooks/useDeletePost';
import { usePost } from '@/features/posts/hooks/usePost';
import type { Post } from '@/features/posts/types/post.types';
import { buildCommunityRoute } from '@/shared/constants/app-routes';

export const PostPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { postId = '', slug = '' } = useParams<{ postId: string; slug: string }>();
  const { data: community, error: communityError, isLoading: isCommunityLoading } = useCommunity(slug, user?.id);
  const communityId = community?.id;
  const { data: post, error: postError, isLoading: isPostLoading } = usePost(postId, user?.id, communityId);
  const { activePostId: deleteLoadingPostId, deletePost, errorMessage: deleteErrorMessage } = useDeletePost(communityId ?? '');
  const { activePostId: likeLoadingPostId, errorMessage: likeErrorMessage, toggleLike } = useLikePost(communityId ?? '', user?.id ?? '');

  if (isCommunityLoading || isPostLoading) {
    return <PostSkeleton count={1} />;
  }

  if (!community || !post || !user) {
    return (
      <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Post not found</h1>
        <p className="mt-3 text-sm text-slate-500">This post does not exist or no longer belongs to the requested community.</p>
      </section>
    );
  }

  const handleDeletePost = async (nextPost: Post): Promise<void> => {
    await deletePost({
      currentUserId: user.id,
      postId: nextPost.id,
    });
    navigate(buildCommunityRoute(slug), { replace: true });
  };

  const handleToggleLike = async (nextPost: Post): Promise<void> => {
    await toggleLike(nextPost);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        {communityError ? (
          <section className="rounded-[1.75rem] border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700 shadow-soft">
            {communityError.message}
          </section>
        ) : null}

        {postError ? (
          <section className="rounded-[1.75rem] border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700 shadow-soft">
            {postError.message}
          </section>
        ) : null}

        <PostCard
          canDelete={post.author_id === user.id || community.owner_id === user.id}
          currentUserId={user.id}
          errorMessage={deleteErrorMessage || likeErrorMessage}
          isDeleteLoading={deleteLoadingPostId === post.id}
          isLikeLoading={likeLoadingPostId === post.id}
          post={post}
          slug={slug}
          onDelete={(nextPost) => {
            void handleDeletePost(nextPost);
          }}
          onToggleLike={(nextPost) => {
            void handleToggleLike(nextPost);
          }}
        />
      </div>

      <CommunitySidebar community={community} />
    </div>
  );
};
