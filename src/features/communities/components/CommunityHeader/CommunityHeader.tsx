import { Avatar } from '@/shared/ui/Avatar/Avatar';
import { CommunityJoinButton } from '@/features/communities/components/CommunityJoinButton/CommunityJoinButton';
import type { CommunityHeaderProps } from '@/features/communities/components/CommunityHeader/CommunityHeader.types';

export const CommunityHeader = ({ community, currentUserId }: CommunityHeaderProps): JSX.Element => {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
      <div className="h-44 w-full bg-slate-100">
        {community.banner_url ? (
          <img alt={`${community.name} banner`} className="h-full w-full object-cover" src={community.banner_url} />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.26),_transparent_34%),linear-gradient(135deg,_#0f172a_0%,_#1e293b_45%,_#134e4a_100%)]" />
        )}
      </div>

      <div className="flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={community.name} size="lg" src={community.icon_url} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Community</p>
            <h1 className="mt-2 truncate text-3xl font-extrabold text-slate-900">{community.name}</h1>
            <p className="mt-2 text-sm text-slate-500">{community.member_count} members</p>
          </div>
        </div>

        <CommunityJoinButton community={community} currentUserId={currentUserId} />
      </div>
    </section>
  );
};
