import { Button } from '@/shared/ui/Button/Button';
import { Modal } from '@/shared/ui/Modal/Modal';
import { useDisclosure } from '@/shared/hooks/useDisclosure';

const previewFeed = [
  {
    id: '1',
    communityName: 'Frontend Architects',
    title: 'Feature-based architecture that can grow with the product',
    excerpt: 'Routes, widgets and features are already separated so teams can scale delivery independently.',
  },
  {
    id: '2',
    communityName: 'Design Systems',
    title: 'Reusable UI primitives with a clean Tailwind contract',
    excerpt: 'Buttons, inputs, dropdowns and modals now live in shared/ui and can evolve without touching pages.',
  },
];

export const Feed = (): JSX.Element => {
  const composerModal = useDisclosure();

  return (
    <>
      <div className="flex items-center justify-between rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Featured feed widget</h2>
          <p className="text-sm text-slate-500">Крупный UI-блок не знает о роутинге и может переиспользоваться в других страницах.</p>
        </div>
        <Button onClick={composerModal.open}>Open composer</Button>
      </div>

      <div className="grid gap-4">
        {previewFeed.map((card) => (
          <article key={card.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">{card.communityName}</p>
            <h3 className="mt-3 text-xl font-bold text-slate-900">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.excerpt}</p>
          </article>
        ))}
      </div>

      <Modal isOpen={composerModal.isOpen} onClose={composerModal.close} title="Create post">
        <p className="text-sm text-slate-500">
          Modal primitive is ready. Реальный post composer позже появится как отдельная feature без переписывания shared/ui.
        </p>
      </Modal>
    </>
  );
};
