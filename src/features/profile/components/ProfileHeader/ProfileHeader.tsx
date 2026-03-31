import { Button } from '@/shared/ui/Button/Button';
import type { ProfileHeaderProps } from '@/features/profile/components/ProfileHeader/ProfileHeader.types';

export const ProfileHeader = ({ isOwnProfile, onEditProfile, profile }: ProfileHeaderProps): JSX.Element => {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
      <div className="h-40 w-full bg-slate-100">
        {profile.banner_url ? (
          <img alt={`${profile.username} banner`} className="h-full w-full object-cover" src={profile.banner_url} />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(53,87,255,0.28),_transparent_38%),linear-gradient(135deg,_#0f172a_0%,_#1e293b_45%,_#334155_100%)]" />
        )}
      </div>

      <div className="flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Profile</p>
          <h1 className="mt-2 truncate text-3xl font-extrabold text-slate-900">@{profile.username}</h1>
        </div>

        <Button variant={isOwnProfile ? 'primary' : 'secondary'} onClick={onEditProfile}>
          {isOwnProfile ? 'Edit profile' : 'Follow'}
        </Button>
      </div>
    </section>
  );
};
