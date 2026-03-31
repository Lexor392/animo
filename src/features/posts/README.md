# Posts Feature

## Purpose

The posts feature owns the community feed experience: publishing posts, rendering the feed, deleting posts, toggling likes and exposing the post surface that the comments feature enhances.

## Structure

```text
features/posts/
|- api/
|  `- posts.api.ts
|- components/
|  |- CreatePostForm/
|  |- PostActions/
|  |- PostAuthor/
|  |- PostCard/
|  |- PostContent/
|  |- PostList/
|  `- PostSkeleton/
|- hooks/
|  |- useCreatePost.ts
|  |- useDeletePost.ts
|  |- useLikePost.ts
|  |- usePost.ts
|  `- usePosts.ts
|- pages/
|  |- CommunityFeedPage.tsx
|  `- PostPage.tsx
|- types/
|  `- post.types.ts
`- README.md
```

## Data Flow

### Feed flow

1. `CommunityFeedPage` loads community shell data through the communities feature
2. `usePosts` fetches posts ordered by `created_at desc`
3. `PostList` renders the feed, loading skeletons, empty states and cards
4. `PostCard` composes likes and comments UI while keeping post mutations inside hooks

### Create flow

1. `CreatePostForm` captures content and optional media
2. `useCreatePost` validates input and calls `createPost`
3. `posts.api.ts` uploads media to `post-media` and creates the row in `posts`
4. React Query updates and invalidates only community-scoped post caches

### Like flow

1. `PostActions` triggers `useLikePost`
2. The hook applies optimistic updates to:
   - the community feed cache
   - the single post cache
3. The API toggles `post_likes` and recalculates `likes_count`

### Delete flow

1. `PostActions` triggers `useDeletePost`
2. API verifies the author or community owner permission
3. Deleted posts are removed from cached feed data and detail cache

## Like System

- likes are stored in `post_likes`
- duplicate likes are prevented in the API layer
- optimistic UI keeps the interface responsive
- exact counters are synchronized after the server mutation completes

## Future Preparation

The structure is ready to expand into:

- media gallery
- moderation actions
- pinned posts

These areas are intentionally left out of the current implementation.
