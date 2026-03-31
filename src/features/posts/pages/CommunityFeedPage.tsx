import { useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CommunityHeader } from '@/features/communities/components/CommunityHeader/CommunityHeader';
import { CommunitySidebar } from '@/features/communities/components/CommunitySidebar/CommunitySidebar';
import { useCommunity } from '@/features/communities/hooks/useCommunity';
import { CreatePostForm } from '@/features/posts/components/CreatePostForm/CreatePostForm';
import { PostList } from '@/features/posts/components/PostList/PostList';
import { PostSkeleton } from '@/features/posts/components/PostSkeleton/PostSkeleton';
import { useDeletePost } from '@/features/posts/hooks/useDeletePost';
import { useLikePost } from '@/features/likes/hooks/useLikePost';
import { usePosts } from '@/features/posts/hooks/usePosts';
import type { Post } from '@/features/posts/types/post.types';

export const CommunityFeedPage = (): JSX.Element => {
  const { user } = useAuth();
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: community, error: communityError, isLoading: isCommunityLoading } = useCommunity(slug, user?.id);
  const communityId = community?.id ?? '';
  const { data: postsResponse, error: postsError, isLoading: isPostsLoading } = usePosts(communityId, user?.id, null, 20);
  const { activePostId: deleteLoadingPostId, deletePost, errorMessage: deleteErrorMessage } = useDeletePost(communityId);
  const { activePostId: likeLoadingPostId, errorMessage: likeErrorMessage, toggleLike } = useLikePost(communityId, user?.id ?? '');

  if (isCommunityLoading) {
    return <PostSkeleton count={2} />;
  }

  if (!community || !user) {
    return (
      <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Community not found</h1>
        <p className="mt-3 text-sm text-slate-500">This community does not exist or is not visible yet.</p>
      </section>
    );
  }

  const canCreatePost = community.is_member || community.viewer_role === 'owner';
  const posts = postsResponse?.items ?? [];

  const handleDeletePost = async (post: Post): Promise<void> => {
    await deletePost({
      currentUserId: user.id,
      postId: post.id,
    });
  };

  const handleToggleLike = async (post: Post): Promise<void> => {
    await toggleLike(post);
  };

  return (
    <div className="space-y-6">
      <CommunityHeader community={community} currentUserId={user.id} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {canCreatePost ? (
            <CreatePostForm communityId={community.id} currentUserId={user.id} />
          ) : (
            <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 shadow-soft">
              Join the community to publish posts in this feed.
            </section>
          )}

          {communityError ? (
            <section className="rounded-[1.75rem] border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700 shadow-soft">
              {communityError.message}
            </section>
          ) : null}

          {isPostsLoading ? <PostSkeleton count={3} /> : null}

          {!isPostsLoading && !postsError ? (
            <PostList
              communityOwnerId={community.owner_id}
              currentUserId={user.id}
              deleteLoadingPostId={deleteLoadingPostId}
              emptyMessage="No posts yet. Be the first to start the discussion."
              errorMessage={deleteErrorMessage || likeErrorMessage}
              likeLoadingPostId={likeLoadingPostId}
              posts={posts}
              slug={community.slug}
              onDelete={(post) => {
                void handleDeletePost(post);
              }}
              onToggleLike={(post) => {
                void handleToggleLike(post);
              }}
            />
          ) : null}

          {postsError ? (
            <section className="rounded-[1.75rem] border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700 shadow-soft">
              {postsError.message}
            </section>
          ) : null}
        </div>

        <CommunitySidebar community={community} />
      </div>
    </div>
  );
};
