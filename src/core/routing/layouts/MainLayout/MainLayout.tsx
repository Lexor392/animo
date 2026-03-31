import { Outlet } from 'react-router-dom';
import { Header } from '@/widgets/Header/Header';
import { Sidebar } from '@/widgets/Sidebar/Sidebar';

export const MainLayout = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar />
        <div className="flex min-h-full min-w-0 flex-1 flex-col gap-6">
          <Header />
          <main className="min-h-[calc(100vh-8rem)] rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
