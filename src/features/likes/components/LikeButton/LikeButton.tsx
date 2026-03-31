import type { LikeButtonProps } from '@/features/likes/components/LikeButton/LikeButton.types';
import { cn } from '@/shared/utils/cn';

export const LikeButton = ({ className, isLiked, isLoading = false, likesCount, onClick, title }: LikeButtonProps): JSX.Element => {
  return (
    <button
      aria-busy={isLoading}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        isLiked ? 'bg-brand-50 text-brand-700 hover:bg-brand-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        className,
      )}
      disabled={isLoading}
      title={title ?? `${likesCount} likes`}
      type="button"
      onClick={onClick}
    >
      <span aria-hidden="true" className={cn('text-base leading-none', isLiked ? 'text-brand-600' : 'text-slate-400')}>
        {isLiked ? '♥' : '♡'}
      </span>
      <span>{likesCount}</span>
    </button>
  );
};
