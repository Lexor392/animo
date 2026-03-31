import { NavLink } from 'react-router-dom';
import { useUiStore } from '@/core/store/uiStore';
import { Avatar } from '@/shared/ui/Avatar/Avatar';
import { Button } from '@/shared/ui/Button/Button';
import { APP_ROUTES, buildCommunityRoute, buildProfileRoute } from '@/shared/constants/app-routes';
import { cn } from '@/shared/utils/cn';

const navigationItems = [
  { label: 'Home', to: APP_ROUTES.home },
  { label: 'Profile', to: buildProfileRoute('animo-admin') },
  { label: 'Community', to: buildCommunityRoute('frontend-lab') },
  { label: 'Chat', to: APP_ROUTES.chat },
  { label: 'Settings', to: APP_ROUTES.settings },
];

export const Sidebar = (): JSX.Element => {
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <aside
      className={cn(
        'sticky top-6 hidden h-[calc(100vh-3rem)] flex-col rounded-[2rem] border border-white/60 bg-slate-950 px-4 py-5 text-white shadow-soft lg:flex',
        isSidebarCollapsed ? 'w-24' : 'w-72',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {!isSidebarCollapsed ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Animo</p>
            <h2 className="mt-2 text-xl font-bold">Social Core</h2>
          </div>
        ) : null}
        <Button size="sm" variant="secondary" onClick={toggleSidebar}>
          {isSidebarCollapsed ? '>' : '<'}
        </Button>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              cn(
                'rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition',
                'hover:bg-white/10 hover:text-white',
                isActive ? 'bg-white text-slate-900' : '',
                isSidebarCollapsed ? 'text-center' : '',
              )
            }
            to={item.to}
          >
            {isSidebarCollapsed ? item.label.slice(0, 1) : item.label}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-[1.5rem] bg-white/10 p-3">
        <div className="flex items-center gap-3">
          <Avatar name="Animo Admin" />
          {!isSidebarCollapsed ? (
            <div>
              <p className="text-sm font-semibold text-white">Animo Admin</p>
              <p className="text-xs text-slate-300">Platform architect</p>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
};
