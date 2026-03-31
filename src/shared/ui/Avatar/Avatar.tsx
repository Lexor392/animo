import type { AvatarProps } from '@/shared/ui/Avatar/Avatar.types';
import { cn } from '@/shared/utils/cn';

const sizeClasses = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
} as const;

export const Avatar = ({ name, size = 'md', src }: AvatarProps): JSX.Element => {
  const fallback = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  if (src) {
    return <img alt={name} className={cn('rounded-2xl object-cover', sizeClasses[size])} src={src} />;
  }

  return (
    <div
      aria-label={name}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-400 font-bold text-white shadow-soft',
        sizeClasses[size],
      )}
    >
      {fallback || 'A'}
    </div>
  );
};
