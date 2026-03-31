import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CommunityCard } from '@/features/communities/components/CommunityCard/CommunityCard';
import { useCommunities } from '@/features/communities/hooks/useCommunities';
import { buildCreateCommunityRoute } from '@/shared/constants/app-routes';
import { Button } from '@/shared/ui/Button/Button';

const CommunitiesSkeleton = (): JSX.Element => {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200" />
            <div className="min-w-0 flex-1">
              <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-200" />
              <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const CommunitiesPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: communities, error, isLoading } = useCommunities({
    currentUserId: user?.id,
    limit: 20,
    page: 1,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">Communities</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Explore the network core</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Community discovery uses React Query caching, pagination-ready list fetching and membership-aware cards.
          </p>
        </div>

        <Button
          onClick={() => {
            navigate(buildCreateCommunityRoute());
          }}
        >
          Create community
        </Button>
      </div>

      {isLoading ? <CommunitiesSkeleton /> : null}

      {error ? (
        <div className="rounded-[1.75rem] border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700 shadow-soft">
          {error.message}
        </div>
      ) : null}

      {!isLoading && !error && communities?.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-soft">
          <h2 className="text-2xl font-bold text-slate-900">No communities yet</h2>
          <p className="mt-3 text-sm text-slate-500">Create the first community and start building the social graph.</p>
        </div>
      ) : null}

      {!isLoading && !error && communities?.length ? (
        <div className="grid gap-4">
          {communities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      ) : null}
    </section>
  );
};
