import { Outlet } from 'react-router-dom';

export const AuthLayout = (): JSX.Element => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(53,87,255,0.14),_transparent_35%),linear-gradient(180deg,_#eef2ff_0%,_#f8fafc_100%)]" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Animo</p>
          <h1 className="mt-3 text-4xl font-extrabold text-slate-900">Сообщества, контент и чат в одной системе</h1>
          <p className="mt-3 text-sm text-slate-500">
            Архитектурный foundation для будущей социальной платформы масштаба 100k+ пользователей.
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-soft backdrop-blur">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
