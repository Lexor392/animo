import { useAuthStore } from '@/features/auth/store/authStore';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return {
    user,
    session,
    loading,
    isAuthenticated,
  };
};
