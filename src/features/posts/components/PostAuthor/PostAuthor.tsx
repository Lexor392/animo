import { Link } from 'react-router-dom';
import type { PostAuthorProps } from '@/features/posts/components/PostAuthor/PostAuthor.types';
import { Avatar } from '@/shared/ui/Avatar/Avatar';
import { buildProfileRoute } from '@/shared/constants/app-routes';

const formatPostDate = (value: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export const PostAuthor = ({ post }: PostAuthorProps): JSX.Element => {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={post.author.username} src={post.author.avatar_url} />
      <div className="min-w-0">
        <Link className="truncate text-sm font-semibold text-slate-900 transition hover:text-brand-600" to={buildProfileRoute(post.author.username)}>
          @{post.author.username}
        </Link>
        <p className="text-xs font-medium text-slate-400">{formatPostDate(post.created_at)}</p>
      </div>
    </div>
  );
};
