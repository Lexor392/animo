import type { ButtonProps } from '@/shared/ui/Button/Button.types';
import { cn } from '@/shared/utils/cn';

const variantClasses = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-300',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-400',
} as const;

const sizeClasses = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
} as const;

export const Button = ({
  children,
  className,
  disabled,
  isLoading = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps): JSX.Element => {
  return (
    <button
      aria-busy={isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" /> : null}
      {children}
    </button>
  );
};
