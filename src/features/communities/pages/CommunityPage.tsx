import { useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CommunityHeader } from '@/features/communities/components/CommunityHeader/CommunityHeader';
import { CommunityInfo } from '@/features/communities/components/CommunityInfo/CommunityInfo';
import { CommunitySidebar } from '@/features/communities/components/CommunitySidebar/CommunitySidebar';
import { useCommunity } from '@/features/communities/hooks/useCommunity';

const CommunitySkeleton = (): JSX.Element => {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="h-44 animate-pulse bg-slate-200" />
        <div className="p-6">
          <div className="h-8 w-60 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-3 h-4 w-32 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
          <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-4 h-4 w-20 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

export const CommunityPage = (): JSX.Element => {
  const { user } = useAuth();
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: community, error, isLoading } = useCommunity(slug, user?.id);

  if (isLoading) {
    return <CommunitySkeleton />;
  }

  if (error) {
    return (
      <section className="rounded-[1.75rem] border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700 shadow-soft">
        {error.message}
      </section>
    );
  }

  if (!community || !user) {
    return (
      <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Community not found</h1>
        <p className="mt-3 text-sm text-slate-500">This community does not exist or is not visible yet.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <CommunityHeader community={community} currentUserId={user.id} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <CommunityInfo community={community} />
        <CommunitySidebar community={community} />
      </div>
    </div>
  );
};
