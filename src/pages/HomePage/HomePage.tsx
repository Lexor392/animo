import { Feed } from '@/widgets/Feed/Feed';

export const HomePage = (): JSX.Element => {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Home</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Лента, готовая к масштабированию</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Страница демонстрирует composition-слой: page собирает widgets, а бизнес-логика остаётся внутри features.
          </p>
        </div>
      </div>
      <Feed />
    </section>
  );
};
