import { useId } from 'react';
import { useAvatarUpload } from '@/features/profile/hooks/useAvatarUpload';
import type { ProfileAvatarUploadProps } from '@/features/profile/components/ProfileAvatarUpload/ProfileAvatarUpload.types';
import { Avatar } from '@/shared/ui/Avatar/Avatar';
import { Button } from '@/shared/ui/Button/Button';

export const ProfileAvatarUpload = ({ currentUserId, profile }: ProfileAvatarUploadProps): JSX.Element => {
  const inputId = useId();
  const { errorMessage, handleFileChange, handleUpload, isLoading, previewUrl, selectedFileName, successMessage } =
    useAvatarUpload({
      currentUserId,
      profile,
    });

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={profile.username} size="lg" src={previewUrl ?? profile.avatar_url} />
          <div>
            <h3 className="text-lg font-bold text-slate-900">Avatar</h3>
            <p className="mt-1 text-sm text-slate-500">Image only, max 2MB. Changes are uploaded to Supabase Storage.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <input accept="image/*" className="hidden" id={inputId} type="file" onChange={handleFileChange} />
          <div className="flex flex-wrap gap-2">
            <label htmlFor={inputId}>
              <span className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Choose image
              </span>
            </label>
            <Button disabled={!selectedFileName} isLoading={isLoading} onClick={() => void handleUpload()} variant="secondary">
              Upload avatar
            </Button>
          </div>
          {selectedFileName ? <p className="text-xs font-medium text-slate-500">{selectedFileName}</p> : null}
        </div>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}
    </section>
  );
};
