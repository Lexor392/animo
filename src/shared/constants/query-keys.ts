export const QUERY_KEYS = {
  profile: {
    all: ['profile'] as const,
    byId: (profileId: string) => ['profile', 'id', profileId] as const,
    byUsername: (username: string) => ['profile', 'username', username] as const,
  },
};
