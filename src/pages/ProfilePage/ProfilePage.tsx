import { useParams } from 'react-router-dom';
import { useUser } from '@/features/profile/hooks/useUser';
import { Avatar } from '@/shared/ui/Avatar/Avatar';

export const ProfilePage = (): JSX.Element => {
  const { username = '' } = useParams<{ username: string }>();
  const { data: user } = useUser(username);

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
      <div className="flex items-center gap-4">
        <Avatar name={user?.displayName ?? username} size="lg" src={user?.avatarUrl} />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{user?.displayName ?? username}</h1>
          <p className="mt-1 text-sm text-slate-500">{user?.bio ?? 'Profile feature foundation is ready.'}</p>
        </div>
      </div>
    </section>
  );
};
