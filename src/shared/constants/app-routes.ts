export const APP_ROUTES = {
  login: '/login',
  register: '/register',
  home: '/home',
  communities: '/communities',
  communityCreate: '/community/create',
  communityPost: '/community/:slug/post/:postId',
  profileEdit: '/profile/edit',
  profile: '/profile/:username',
  community: '/community/:slug',
  chat: '/chat',
  settings: '/settings',
} as const;

export const buildProfileRoute = (username: string): string => `/profile/${username}`;
export const buildEditProfileRoute = (): string => APP_ROUTES.profileEdit;
export const buildCommunityRoute = (slug: string): string => `/community/${slug}`;
export const buildCommunityPostRoute = (slug: string, postId: string): string => `/community/${slug}/post/${postId}`;
export const buildCommunitiesRoute = (): string => APP_ROUTES.communities;
export const buildCreateCommunityRoute = (): string => APP_ROUTES.communityCreate;
