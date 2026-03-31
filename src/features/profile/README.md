# Profile Feature

## Purpose

The profile feature owns public user profile data and profile editing flows.

This module is responsible for:

- loading a profile by `username`
- loading the current user's profile by `id`
- editing username, bio and optional banner
- uploading avatar images to Supabase Storage
- invalidating cached profile queries after mutations

## Structure

```text
features/profile/
|- api/
|  `- profile.api.ts
|- components/
|  |- ProfileAvatarUpload/
|  |- ProfileEditForm/
|  |- ProfileHeader/
|  `- ProfileInfo/
|- hooks/
|  |- useAvatarUpload.ts
|  |- useProfile.ts
|  `- useUpdateProfile.ts
|- pages/
|  |- EditProfilePage.tsx
|  `- ProfilePage.tsx
|- types/
|  `- profile.types.ts
`- README.md
```

## Data Flow

### Read flow

1. Route opens `/profile/:username` or `/profile/edit`
2. `useProfile` requests data through React Query
3. `profile.api.ts` reads the row from `public.profiles`
4. UI renders loading, empty, error or success state

### Update flow

1. User edits form fields in `ProfileEditForm`
2. `useUpdateProfile` validates the payload
3. `profile.api.ts` updates the `profiles` row
4. React Query invalidates profile caches
5. User is redirected to the public profile page

### Avatar flow

1. User selects an image in `ProfileAvatarUpload`
2. `useAvatarUpload` validates size and MIME type
3. `profile.api.ts` uploads the file to Supabase Storage bucket `avatars`
4. Public URL is stored in the profile row
5. Profile caches are invalidated

## API Structure

`profile.api.ts` exposes:

- `getProfileByUsername`
- `getProfileById`
- `updateProfile`
- `uploadAvatar`

## Security Notes

- Client-side edit actions verify `user.id === profile.user_id`
- Real production security should also be enforced with Supabase RLS policies
- Profile data is stored only in React Query, not Zustand
