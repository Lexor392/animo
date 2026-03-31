import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/authStore';
import { APP_ROUTES } from '@/shared/constants/app-routes';

export const useLogout = () => {
  const navigate = useNavigate();
  const resetAuthState = useAuthStore((state) => state.resetAuthState);
  const setLoading = useAuthStore((state) => state.setLoading);

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: logout,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      resetAuthState();
      navigate(APP_ROUTES.login, { replace: true });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  return {
    logout: logoutMutation.mutateAsync,
    errorMessage: logoutMutation.error?.message ?? null,
    isLoading: logoutMutation.isPending,
  };
};
