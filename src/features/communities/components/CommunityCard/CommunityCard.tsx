import { Link } from 'react-router-dom';
import type { CommunityCardProps } from '@/features/communities/components/CommunityCard/CommunityCard.types';
import { Avatar } from '@/shared/ui/Avatar/Avatar';
import { buildCommunityRoute } from '@/shared/constants/app-routes';

export const CommunityCard = ({ community }: CommunityCardProps): JSX.Element => {
  const descriptionPreview =
    community.description.length > 140 ? `${community.description.slice(0, 137).trimEnd()}...` : community.description;

  return (
    <Link
      className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
      to={buildCommunityRoute(community.slug)}
    >
      <div className="flex items-start gap-4">
        <Avatar name={community.name} size="lg" src={community.icon_url} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-xl font-bold text-slate-900 transition group-hover:text-brand-600">{community.name}</h3>
            {community.viewer_role === 'owner' ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Owner</span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{descriptionPreview}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {community.member_count} members
          </p>
        </div>
      </div>
    </Link>
  );
};
