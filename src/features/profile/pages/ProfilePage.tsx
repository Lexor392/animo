import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader/ProfileHeader';
import { ProfileInfo } from '@/features/profile/components/ProfileInfo/ProfileInfo';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { buildEditProfileRoute } from '@/shared/constants/app-routes';

const ProfileSkeleton = (): JSX.Element => {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="h-40 animate-pulse bg-slate-200" />
        <div className="p-6">
          <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-3 h-8 w-56 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-slate-200" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
};

export const ProfilePage = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { username = '' } = useParams<{ username: string }>();
  const { data: profile, error, isLoading } = useProfile({
    username,
  });

  if (isLoading) {
    return <ProfileSkeleton />;
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
        <h1 className="text-2xl font-bold text-slate-900">Profile not found</h1>
        <p className="mt-3 text-sm text-slate-500">This user has not created a public profile yet.</p>
      </section>
    );
  }

  const isOwnProfile = user?.id === profile.user_id;

  return (
    <div className="space-y-6">
      <ProfileHeader
        isOwnProfile={isOwnProfile}
        profile={profile}
        onEditProfile={() => {
          if (isOwnProfile) {
            navigate(buildEditProfileRoute());
          }
        }}
      />
      <ProfileInfo profile={profile} />
    </div>
  );
};
