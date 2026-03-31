import { MediaUploader } from '@/features/media/components/MediaUploader/MediaUploader';
import { useCreatePost } from '@/features/posts/hooks/useCreatePost';
import type { CreatePostFormProps } from '@/features/posts/components/CreatePostForm/CreatePostForm.types';
import { Button } from '@/shared/ui/Button/Button';

export const CreatePostForm = ({ communityId, currentUserId }: CreatePostFormProps): JSX.Element => {
  const { fieldErrors, formError, handleSubmit, isLoading, mediaUpload, successMessage, updateContent, values } =
    useCreatePost(communityId, currentUserId);

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
        <MediaUploader
          errorMessage={mediaUpload.errorMessage}
          isUploading={mediaUpload.isUploading}
          items={mediaUpload.items}
          label="Add images or videos"
          type="post"
          onAddFiles={mediaUpload.addFiles}
          onRemoveItem={mediaUpload.removeItem}
        />
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
