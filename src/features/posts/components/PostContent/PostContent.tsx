import type { PostContentProps } from '@/features/posts/components/PostContent/PostContent.types';

export const PostContent = ({ post }: PostContentProps): JSX.Element => {
  return (
    <div className="space-y-4">
      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.content}</p>

      {post.media_url ? (
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
          <img alt="Post media" className="max-h-[420px] w-full object-cover" src={post.media_url} />
        </div>
      ) : null}
    </div>
  );
};
