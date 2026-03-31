import { ProfileAvatarUpload } from '@/features/profile/components/ProfileAvatarUpload/ProfileAvatarUpload';
import type { ProfileEditFormProps } from '@/features/profile/components/ProfileEditForm/ProfileEditForm.types';
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile';
import { Button } from '@/shared/ui/Button/Button';
import { Input } from '@/shared/ui/Input/Input';

export const ProfileEditForm = ({ currentUserId, profile }: ProfileEditFormProps): JSX.Element => {
  const { fieldErrors, formError, handleSubmit, isLoading, successMessage, updateField, values } = useUpdateProfile({
    currentUserId,
    profile,
  });

  return (
    <div className="space-y-6">
      <ProfileAvatarUpload currentUserId={currentUserId} profile={profile} />

      <form className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft" noValidate onSubmit={handleSubmit}>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Edit profile</h2>
          <p className="mt-2 text-sm text-slate-500">Update the public identity of your account.</p>
        </div>

        <Input
          disabled={isLoading}
          error={fieldErrors.username}
          label="Username"
          name="username"
          placeholder="animo_creator"
          value={values.username}
          onChange={updateField('username')}
        />

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Bio</span>
          <textarea
            className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            disabled={isLoading}
            maxLength={500}
            name="bio"
            placeholder="Tell the community a bit about yourself."
            value={values.bio}
            onChange={updateField('bio')}
          />
          <div className="mt-2 flex items-center justify-between gap-4">
            {fieldErrors.bio ? <span className="text-sm text-rose-600">{fieldErrors.bio}</span> : <span className="text-sm text-slate-400">Up to 500 characters.</span>}
            <span className="text-xs font-medium text-slate-400">{values.bio.length}/500</span>
          </div>
        </label>

        <Input
          disabled={isLoading}
          label="Banner URL (optional)"
          name="banner_url"
          placeholder="https://images.example.com/banner.jpg"
          value={values.banner_url}
          onChange={updateField('banner_url')}
        />

        {formError ? (
          <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">{formError}</p>
        ) : null}

        {successMessage ? (
          <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button isLoading={isLoading} type="submit">
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
};
