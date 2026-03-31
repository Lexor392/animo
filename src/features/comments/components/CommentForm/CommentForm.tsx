import type { CommentFormProps } from '@/features/comments/components/CommentForm/CommentForm.types';
import { useCreateComment } from '@/features/comments/hooks/useCreateComment';
import { Button } from '@/shared/ui/Button/Button';

export const CommentForm = ({ communityId, currentUserId, postId }: CommentFormProps): JSX.Element => {
  const { fieldErrors, formError, handleSubmit, isLoading, updateContent, values } = useCreateComment(postId, communityId, currentUserId);

  return (
    <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
      <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-3">
        <textarea
          className="min-h-[108px] w-full resize-none border-none bg-transparent text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
          maxLength={1000}
          placeholder="Share your thoughts about this post..."
          value={values.content}
          onChange={updateContent}
        />
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
          <p className="text-xs font-medium text-slate-400">{values.content.length}/1000</p>
          <Button isLoading={isLoading} size="sm" type="submit">
            Comment
          </Button>
        </div>
      </div>

      {fieldErrors.content ? <p className="text-xs font-medium text-rose-600">{fieldErrors.content}</p> : null}
      {formError ? <p className="text-xs font-medium text-rose-600">{formError}</p> : null}
    </form>
  );
};
