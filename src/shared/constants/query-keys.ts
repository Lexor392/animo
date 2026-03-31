export const QUERY_KEYS = {
  comments: {
    all: ['comments'] as const,
    byPost: (postId: string, viewerId?: string | null) => ['comments', 'post', postId, viewerId ?? 'guest'] as const,
  },
  communities: {
    all: ['communities'] as const,
    detail: (slug: string, viewerId?: string | null) => ['communities', 'detail', slug, viewerId ?? 'guest'] as const,
    list: (page: number, search = '', viewerId?: string | null) =>
      ['communities', 'list', page, search, viewerId ?? 'guest'] as const,
    user: (userId: string) => ['communities', 'user', userId] as const,
  },
  media: {
    all: ['media'] as const,
    byComment: (commentId: string) => ['media', 'comment', commentId] as const,
    byPost: (postId: string) => ['media', 'post', postId] as const,
  },
  posts: {
    all: ['posts'] as const,
    community: (communityId: string) => ['posts', 'community', communityId] as const,
    feed: (communityId: string, cursor: string | null, viewerId?: string | null) =>
      ['posts', 'community', communityId, 'feed', cursor ?? 'initial', viewerId ?? 'guest'] as const,
    detail: (postId: string, viewerId?: string | null) => ['posts', 'detail', postId, viewerId ?? 'guest'] as const,
  },
  profile: {
    all: ['profile'] as const,
    byId: (profileId: string) => ['profile', 'id', profileId] as const,
    byUsername: (username: string) => ['profile', 'username', username] as const,
  },
};
