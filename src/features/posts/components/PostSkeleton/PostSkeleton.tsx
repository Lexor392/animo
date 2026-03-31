import type { PostSkeletonProps } from '@/features/posts/components/PostSkeleton/PostSkeleton.types';

export const PostSkeleton = ({ count = 3 }: PostSkeletonProps): JSX.Element => {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-200" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>
          <div className="mt-5 h-4 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-5 h-48 animate-pulse rounded-[1.5rem] bg-slate-200" />
        </div>
      ))}
    </div>
  );
};
