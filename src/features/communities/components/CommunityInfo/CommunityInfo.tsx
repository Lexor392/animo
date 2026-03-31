import type { CommunityInfoProps } from '@/features/communities/components/CommunityInfo/CommunityInfo.types';

const formatCreationDate = (value: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
};

export const CommunityInfo = ({ community }: CommunityInfoProps): JSX.Element => {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="text-xl font-bold text-slate-900">About this community</h2>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
        {community.description.trim() || 'This community has no description yet.'}
      </p>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Created {formatCreationDate(community.created_at)}
      </p>
    </section>
  );
};
