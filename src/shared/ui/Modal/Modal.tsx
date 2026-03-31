import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ModalProps } from '@/shared/ui/Modal/Modal.types';
import { Button } from '@/shared/ui/Button/Button';

export const Modal = ({ children, isOpen, onClose, title }: ModalProps): JSX.Element | null => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      role="dialog"
      onClick={onClose}
    >
      <div className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">Reusable modal primitive for feature-level flows.</p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
};
