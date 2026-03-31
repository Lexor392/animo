import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/core/routing/layouts/AuthLayout/AuthLayout';
import { ChatLayout } from '@/core/routing/layouts/ChatLayout/ChatLayout';
import { MainLayout } from '@/core/routing/layouts/MainLayout/MainLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute/ProtectedRoute';
import { EditProfilePage } from '@/features/profile/pages/EditProfilePage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { ChatPage } from '@/pages/ChatPage/ChatPage';
import { CommunityPage } from '@/pages/CommunityPage/CommunityPage';
import { HomePage } from '@/pages/HomePage/HomePage';
import { SettingsPage } from '@/pages/SettingsPage/SettingsPage';
import { APP_ROUTES } from '@/shared/constants/app-routes';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to={APP_ROUTES.home} />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: APP_ROUTES.login,
        element: <LoginPage />,
      },
      {
        path: APP_ROUTES.register,
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: APP_ROUTES.home,
            element: <HomePage />,
          },
          {
            path: APP_ROUTES.profileEdit,
            element: <EditProfilePage />,
          },
          {
            path: APP_ROUTES.profile,
            element: <ProfilePage />,
          },
          {
            path: APP_ROUTES.community,
            element: <CommunityPage />,
          },
          {
            path: APP_ROUTES.settings,
            element: <SettingsPage />,
          },
        ],
      },
      {
        element: <ChatLayout />,
        children: [
          {
            path: APP_ROUTES.chat,
            element: <ChatPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to={APP_ROUTES.home} />,
  },
]);
