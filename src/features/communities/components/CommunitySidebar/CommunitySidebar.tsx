import type { CommunitySidebarProps } from '@/features/communities/components/CommunitySidebar/CommunitySidebar.types';

export const CommunitySidebar = ({ community }: CommunitySidebarProps): JSX.Element => {
  return (
    <aside className="space-y-4">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold text-slate-900">Community stats</h2>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Members</dt>
            <dd className="mt-1 text-xl font-bold text-slate-900">{community.member_count}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Your role</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-700">{community.viewer_role ?? 'Guest'}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-5">
        <h2 className="text-lg font-bold text-slate-900">Next phase</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          This sidebar is ready to grow into settings, moderation tools, rules, pinned links and community roles UI.
        </p>
      </section>
    </aside>
  );
};
