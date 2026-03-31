# Auth Feature

## Purpose

The auth feature owns the complete email-based authentication flow for the application.

It is responsible for:

- login
- registration
- logout
- session persistence integration with Supabase Auth
- protected route guarding
- profile bootstrap in the `profiles` table after registration

## Structure

```text
features/auth/
|- api/
|  `- auth.api.ts
|- components/
|  |- LoginForm/
|  |- ProtectedRoute/
|  `- RegisterForm/
|- hooks/
|  |- useAuth.ts
|  |- useLogin.ts
|  |- useLogout.ts
|  `- useRegister.ts
|- pages/
|  |- LoginPage.tsx
|  `- RegisterPage.tsx
|- store/
|  `- authStore.ts
|- types/
|  `- auth.types.ts
`- README.md
```

## Responsibilities

### API layer

`auth.api.ts` communicates with Supabase Auth and creates a profile record in `public.profiles` after successful registration.

Expected profile fields:

- `id`
- `email`
- `username`
- `avatar_url`
- `bio`
- `created_at`
- `updated_at`

### Hooks layer

- `useAuth` exposes the current auth state
- `useLogin` owns login form state, validation and redirect flow
- `useRegister` owns registration form state, validation and success/error handling
- `useLogout` handles sign-out logic and post-logout navigation

### Store layer

The auth store keeps only global auth state:

- `user`
- `session`
- `loading`
- `isAuthenticated`

## Notes

- Passwords are never stored outside Supabase Auth.
- Session persistence is handled by Supabase and synchronized via `AuthProvider`.
- For larger production setups, profile creation is often moved from the client to a database trigger or an Edge Function for stronger backend guarantees.
- The current structure is test-friendly because form logic lives in hooks and API communication lives in a dedicated module.
