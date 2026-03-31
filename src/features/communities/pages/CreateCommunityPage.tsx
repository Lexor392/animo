import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CreateCommunityForm } from '@/features/communities/components/CreateCommunityForm/CreateCommunityForm';
import { APP_ROUTES } from '@/shared/constants/app-routes';

export const CreateCommunityPage = (): JSX.Element => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate replace to={APP_ROUTES.login} />;
  }

  return <CreateCommunityForm currentUserId={user.id} />;
};
