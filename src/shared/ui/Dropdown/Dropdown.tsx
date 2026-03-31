import { useEffect, useRef, useState } from 'react';
import type { DropdownProps } from '@/shared/ui/Dropdown/Dropdown.types';
import { cn } from '@/shared/utils/cn';

export const Dropdown = ({ label, onSelect, options }: DropdownProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          'inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition',
          'hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-brand-100',
        )}
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        {label}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 min-w-[180px] rounded-2xl border border-slate-200 bg-white p-2 shadow-soft" role="menu">
          {options.map((option) => (
            <button
              key={option.value}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              role="menuitem"
              type="button"
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
