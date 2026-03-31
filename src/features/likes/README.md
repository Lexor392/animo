# Likes Feature

## Purpose

The likes feature owns like toggles for posts and comments, including optimistic UI, count synchronization and reusable button rendering.

## Structure

```text
features/likes/
|- api/
|  `- likes.api.ts
|- components/
|  `- LikeButton/
|- hooks/
|  |- useLikeComment.ts
|  `- useLikePost.ts
|- types/
|  `- like.types.ts
`- README.md
```

## Architecture

- `api` handles Supabase access for `post_likes` and `comment_likes`
- `hooks` own optimistic cache updates for feed, detail and comment list data
- `components` stay generic and reusable across post and comment surfaces

## Hook Usage

- `useLikePost(communityId, currentUserId)` toggles likes for posts and updates both feed and detail caches
- `useLikeComment(postId, currentUserId)` toggles likes for comments and updates comment pagination cache

## Component Usage

- `LikeButton` receives ready-to-render state: `isLiked`, `likesCount`, `isLoading`, `onClick`
- it is integrated into `PostActions` and `CommentCard`

## Cache and Optimistic Updates

- post likes update only the affected post in community feed and detail caches
- comment likes update only the affected comment in the paginated comment cache
- exact counters are synchronized after the server mutation resolves
- no full likes refetch is required for normal toggles
