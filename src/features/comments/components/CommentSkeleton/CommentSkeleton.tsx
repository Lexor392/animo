import type { CommentSkeletonProps } from '@/features/comments/components/CommentSkeleton/CommentSkeleton.types';

export const CommentSkeleton = ({ count = 2 }: CommentSkeletonProps): JSX.Element => {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-32 rounded-full bg-slate-200" />
              <div className="h-3 w-24 rounded-full bg-slate-200" />
              <div className="h-3 w-full rounded-full bg-slate-200" />
              <div className="h-3 w-2/3 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
