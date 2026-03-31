import type { PropsWithChildren } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { APP_ROUTES } from '@/shared/constants/app-routes';

export const ProtectedRoute = ({ children }: PropsWithChildren): JSX.Element => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 px-6 py-5 text-sm font-semibold text-slate-500 shadow-soft">
          Restoring session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: `${location.pathname}${location.search}` }} to={APP_ROUTES.login} />;
  }

  return children ? <>{children}</> : <Outlet />;
};
