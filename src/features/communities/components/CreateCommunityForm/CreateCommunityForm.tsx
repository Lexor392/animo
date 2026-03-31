import { useId } from 'react';
import { useCreateCommunity } from '@/features/communities/hooks/useCreateCommunity';
import type { CreateCommunityFormProps } from '@/features/communities/components/CreateCommunityForm/CreateCommunityForm.types';
import { Avatar } from '@/shared/ui/Avatar/Avatar';
import { Button } from '@/shared/ui/Button/Button';
import { Input } from '@/shared/ui/Input/Input';

export const CreateCommunityForm = ({ currentUserId }: CreateCommunityFormProps): JSX.Element => {
  const iconInputId = useId();
  const bannerInputId = useId();
  const {
    bannerPreviewUrl,
    fieldErrors,
    formError,
    handleSubmit,
    iconPreviewUrl,
    isLoading,
    successMessage,
    updateField,
    updateFileField,
    values,
  } = useCreateCommunity(currentUserId);

  return (
    <form className="space-y-6" noValidate onSubmit={handleSubmit}>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Create a community</h1>
          <p className="mt-3 text-sm text-slate-500">
            Launch a new hub around your niche. The creator automatically becomes the owner and first member.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <Input
              disabled={isLoading}
              error={fieldErrors.name}
              label="Community name"
              name="name"
              placeholder="Anime Fans"
              value={values.name}
              onChange={updateField('name')}
            />

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Description</span>
              <textarea
                className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                disabled={isLoading}
                maxLength={1000}
                name="description"
                placeholder="Describe what this community is about and who it is for."
                value={values.description}
                onChange={updateField('description')}
              />
              <div className="mt-2 flex items-center justify-between gap-4">
                {fieldErrors.description ? (
                  <span className="text-sm text-rose-600">{fieldErrors.description}</span>
                ) : (
                  <span className="text-sm text-slate-400">Up to 1000 characters.</span>
                )}
                <span className="text-xs font-medium text-slate-400">{values.description.length}/1000</span>
              </div>
            </label>
          </div>

          <div className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <div>
              <p className="text-sm font-semibold text-slate-900">Icon</p>
              <p className="mt-1 text-xs text-slate-500">Required. Image only.</p>
              <div className="mt-4 flex items-center gap-4">
                <Avatar name={values.name || 'Community'} size="lg" src={iconPreviewUrl} />
                <div className="space-y-2">
                  <input accept="image/*" className="hidden" id={iconInputId} type="file" onChange={updateFileField('iconFile')} />
                  <label htmlFor={iconInputId}>
                    <span className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                      Upload icon
                    </span>
                  </label>
                  {fieldErrors.iconFile ? <p className="text-xs text-rose-600">{fieldErrors.iconFile}</p> : null}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">Banner</p>
              <p className="mt-1 text-xs text-slate-500">Optional. Helps make the community page feel distinct.</p>
              <input accept="image/*" className="hidden" id={bannerInputId} type="file" onChange={updateFileField('bannerFile')} />
              <label htmlFor={bannerInputId}>
                <span className="mt-4 inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                  Upload banner
                </span>
              </label>

              <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                {bannerPreviewUrl ? (
                  <img alt="Community banner preview" className="h-36 w-full object-cover" src={bannerPreviewUrl} />
                ) : (
                  <div className="flex h-36 items-center justify-center bg-[linear-gradient(135deg,_#e2e8f0_0%,_#f8fafc_100%)] text-sm font-semibold text-slate-400">
                    Banner preview
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {formError ? (
          <p className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">{formError}</p>
        ) : null}

        {successMessage ? (
          <p className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end">
          <Button isLoading={isLoading} size="lg" type="submit">
            Create community
          </Button>
        </div>
      </section>
    </form>
  );
};
