export const QUERY_KEYS = {
  profile: {
    all: ['profile'] as const,
    byUsername: (username: string) => ['profile', username] as const,
  },
};
