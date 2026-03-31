import { Outlet } from 'react-router-dom';
import { Header } from '@/widgets/Header/Header';
import { Sidebar } from '@/widgets/Sidebar/Sidebar';

export const ChatLayout = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar />
        <div className="flex min-h-full min-w-0 flex-1 flex-col gap-6">
          <Header />
          <main className="grid min-h-[calc(100vh-8rem)] min-w-0 gap-4 rounded-[2rem] border border-white/60 bg-white/85 p-4 shadow-soft backdrop-blur lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Диалоги</h2>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">0 active</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Здесь позже появится список тредов. Layout уже отделён от бизнес-логики чата.
              </p>
            </aside>
            <section className="min-w-0 rounded-[1.5rem] border border-slate-200 bg-white p-4">
              <Outlet />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};
