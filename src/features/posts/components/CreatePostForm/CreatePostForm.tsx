import { useEffect, useId, useState } from 'react';
import { useCreatePost } from '@/features/posts/hooks/useCreatePost';
import type { CreatePostFormProps } from '@/features/posts/components/CreatePostForm/CreatePostForm.types';
import { Button } from '@/shared/ui/Button/Button';

export const CreatePostForm = ({ communityId, currentUserId }: CreatePostFormProps): JSX.Element => {
  const fileInputId = useId();
  const { fieldErrors, formError, handleSubmit, isLoading, successMessage, updateContent, updateMedia, values } =
    useCreatePost(communityId, currentUserId);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!values.mediaFile) {
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(values.mediaFile);
    setPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [values.mediaFile]);

  return (
    <form className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft" noValidate onSubmit={handleSubmit}>
      <div>
        <h2 className="text-xl font-bold text-slate-900">Create a post</h2>
        <p className="mt-2 text-sm text-slate-500">Share an update, theory, artwork or discussion starter with the community.</p>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Content</span>
        <textarea
          className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
          disabled={isLoading}
          maxLength={5000}
          placeholder="What do you want to post?"
          value={values.content}
          onChange={updateContent}
        />
        <div className="mt-2 flex items-center justify-between gap-4">
          {fieldErrors.content ? <span className="text-sm text-rose-600">{fieldErrors.content}</span> : <span className="text-sm text-slate-400">Up to 5000 characters.</span>}
          <span className="text-xs font-medium text-slate-400">{values.content.length}/5000</span>
        </div>
      </label>

      <div className="mt-5">
        <input accept="image/*" className="hidden" id={fileInputId} type="file" onChange={updateMedia} />
        <label htmlFor={fileInputId}>
          <span className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Add image
          </span>
        </label>

        {previewUrl ? (
          <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
            <img alt="Post media preview" className="max-h-[320px] w-full object-cover" src={previewUrl} />
          </div>
        ) : null}
      </div>

      {formError ? (
        <p className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">{formError}</p>
      ) : null}

      {successMessage ? (
        <p className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end">
        <Button isLoading={isLoading} type="submit">
          Publish post
        </Button>
      </div>
    </form>
  );
};
