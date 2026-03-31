import { forwardRef } from 'react';
import type { InputProps } from '@/shared/ui/Input/Input.types';
import { cn } from '@/shared/utils/cn';

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, label, ...props }, ref) => {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span> : null}
      <input
        ref={ref}
        className={cn(
          'h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition',
          'placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100',
          error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : '',
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm text-rose-600">{error}</span> : null}
    </label>
  );
});

Input.displayName = 'Input';
