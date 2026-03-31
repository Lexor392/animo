import { useParams } from 'react-router-dom';

export const CommunityPage = (): JSX.Element => {
  const { slug = '' } = useParams<{ slug: string }>();

  return (
    <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-6">
      <h1 className="text-2xl font-bold text-slate-900">Community: {slug}</h1>
      <p className="mt-3 text-sm text-slate-500">
        Страница и маршрут готовы. Логику communities можно подключать позже без переделки layout или router-слоя.
      </p>
    </section>
  );
};
