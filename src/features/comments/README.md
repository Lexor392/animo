# Comments Feature

## Purpose

The comments feature owns the post discussion layer: loading comment threads, creating new comments and deleting author-owned comments.

## Structure

```text
features/comments/
|- api/
|  `- comments.api.ts
|- components/
|  |- CommentCard/
|  |- CommentForm/
|  |- CommentList/
|  `- CommentSkeleton/
|- hooks/
|  |- useComments.ts
|  |- useCreateComment.ts
|  `- useDeleteComment.ts
|- types/
|  `- comment.types.ts
`- README.md
```

## Architecture

- `api` talks to Supabase tables and keeps validation close to persistence rules
- `hooks` own React Query caching, optimistic updates and post counter synchronization
- `components` stay presentational and receive ready-to-use hook state
- comments are embedded into the posts surface through `PostCard`, but the feature remains isolated

## Data Flow

### Read flow

1. `CommentList` calls `useComments(postId)`
2. `useComments` loads paginated comments through `getCommentsByPost`
3. The API hydrates author data from `profiles`
4. The UI renders cards, loading skeletons and the load-more action

### Create flow

1. `CommentForm` collects textarea input
2. `useCreateComment` validates the payload and performs the mutation
3. The hook injects an optimistic comment at the top of the first page
4. Post comment counters are synchronized in both feed and single-post caches

### Delete flow

1. `CommentCard` exposes delete only for the comment author
2. `useDeleteComment` removes the comment optimistically
3. The hook restores previous cache snapshots if the mutation fails
4. Exact counters are synchronized after the server confirms deletion

## Hook Usage

- `useComments(postId)` returns paginated comments plus `fetchNextPage`
- `useCreateComment(postId, communityId, currentUserId)` drives the form state and optimistic creation
- `useDeleteComment(postId, communityId, currentUserId)` owns delete permissions and optimistic removal

## Component Usage

- `CommentForm` should be rendered under a post for authenticated users
- `CommentList` can be mounted inside feed cards or single-post pages
- `CommentCard` and `CommentSkeleton` are internal building blocks for the list surface

## Future Preparation

The feature is structured to expand into:

- nested replies
- moderation actions
- comment editing
- mentions
