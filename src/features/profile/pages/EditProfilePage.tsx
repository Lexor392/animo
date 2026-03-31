import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProfileEditForm } from '@/features/profile/components/ProfileEditForm/ProfileEditForm';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { APP_ROUTES, buildProfileRoute } from '@/shared/constants/app-routes';

export const EditProfilePage = (): JSX.Element => {
  const { user } = useAuth();
  const { data: profile, error, isLoading } = useProfile({
    profileId: user?.id,
  });

  if (!user) {
    return <Navigate replace to={APP_ROUTES.login} />;
  }

  if (isLoading) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-6 h-12 w-full animate-pulse rounded-2xl bg-slate-200" />
        <div className="mt-4 h-32 w-full animate-pulse rounded-2xl bg-slate-200" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[2rem] border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700 shadow-soft">
        {error.message}
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Profile setup is incomplete</h1>
        <p className="mt-3 text-sm text-slate-500">We could not find the profile record for this account.</p>
      </section>
    );
  }

  if (profile.user_id !== user.id) {
    return <Navigate replace to={buildProfileRoute(profile.username)} />;
  }

  return <ProfileEditForm currentUserId={user.id} profile={profile} />;
};
