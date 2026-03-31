export const APP_ROUTES = {
  login: '/login',
  register: '/register',
  home: '/home',
  profile: '/profile/:username',
  community: '/community/:slug',
  chat: '/chat',
  settings: '/settings',
} as const;

export const buildProfileRoute = (username: string): string => `/profile/${username}`;
export const buildCommunityRoute = (slug: string): string => `/community/${slug}`;
