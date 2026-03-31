import { Navigate } from 'react-router-dom';
import { RegisterForm } from '@/features/auth/components/RegisterForm/RegisterForm';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { APP_ROUTES } from '@/shared/constants/app-routes';

export const RegisterPage = (): JSX.Element => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="text-center text-sm font-semibold text-slate-500">Restoring session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate replace to={APP_ROUTES.home} />;
  }

  return <RegisterForm />;
};
