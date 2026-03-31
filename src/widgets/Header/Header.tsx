import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Avatar } from '@/shared/ui/Avatar/Avatar';
import { Dropdown } from '@/shared/ui/Dropdown/Dropdown';
import { Input } from '@/shared/ui/Input/Input';
import { APP_ROUTES } from '@/shared/constants/app-routes';

export const Header = (): JSX.Element => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { logout } = useLogout();
  const avatarUrl = typeof user?.user_metadata?.['avatar_url'] === 'string' ? user.user_metadata['avatar_url'] : null;

  const handleDropdownSelect = async (value: string): Promise<void> => {
    if (value === 'login') {
      navigate(APP_ROUTES.login);
      return;
    }

    if (value === 'settings') {
      navigate(APP_ROUTES.settings);
      return;
    }

    if (value === 'logout') {
      await logout();
    }
  };

  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-white/85 p-4 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">Workspace</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Scalable frontend shell</h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input className="w-full sm:w-72" placeholder="Search communities, posts, people" />
        <div className="flex items-center gap-3">
          <Avatar name={user?.email ?? 'Guest User'} src={avatarUrl} />
          <Dropdown
            label={isAuthenticated ? 'Account' : 'Guest'}
            onSelect={(value) => {
              void handleDropdownSelect(value);
            }}
            options={
              isAuthenticated
                ? [
                    { label: 'Settings', value: 'settings' },
                    { label: 'Logout', value: 'logout' },
                  ]
                : [{ label: 'Go to login', value: 'login' }]
            }
          />
        </div>
      </div>
    </header>
  );
};
