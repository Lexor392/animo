import { create } from 'zustand';
import type { AuthStoreState } from '@/features/auth/types/auth.types';

const baseAuthState = {
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
} as const;

export const useAuthStore = create<AuthStoreState>((set) => ({
  ...baseAuthState,
  setAuthState: ({ loading, session, user }) =>
    set({
      loading,
      session,
      user,
      isAuthenticated: Boolean(session && user),
    }),
  resetAuthState: () =>
    set({
      ...baseAuthState,
      loading: false,
    }),
  setLoading: (loading) => set({ loading }),
}));
