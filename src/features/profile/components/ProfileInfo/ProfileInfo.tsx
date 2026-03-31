import type { ProfileInfoProps } from '@/features/profile/components/ProfileInfo/ProfileInfo.types';
import { Avatar } from '@/shared/ui/Avatar/Avatar';

const formatJoinDate = (value: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
};

export const ProfileInfo = ({ profile }: ProfileInfoProps): JSX.Element => {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={profile.username} size="lg" src={profile.avatar_url} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">@{profile.username}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {profile.bio?.trim() || 'This profile has no bio yet.'}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Joined {formatJoinDate(profile.created_at)}
          </p>
        </div>
      </div>
    </section>
  );
};
