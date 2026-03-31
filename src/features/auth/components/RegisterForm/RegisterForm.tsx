import { Link } from 'react-router-dom';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { Button } from '@/shared/ui/Button/Button';
import { Input } from '@/shared/ui/Input/Input';
import { APP_ROUTES } from '@/shared/constants/app-routes';

export const RegisterForm = (): JSX.Element => {
  const {
    fieldErrors,
    formError,
    handleSubmit,
    isLoading,
    requiresEmailVerification,
    successMessage,
    updateField,
    values,
  } = useRegister();

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
        <p className="mt-2 text-sm text-slate-500">
          Register with email authentication and bootstrap your profile in Supabase.
        </p>
      </div>

      <Input
        autoComplete="username"
        disabled={isLoading}
        error={fieldErrors.username}
        label="Username"
        name="username"
        placeholder="animo_creator"
        value={values.username}
        onChange={updateField('username')}
      />

      <Input
        autoComplete="email"
        disabled={isLoading}
        error={fieldErrors.email}
        label="Email"
        name="email"
        placeholder="you@example.com"
        type="email"
        value={values.email}
        onChange={updateField('email')}
      />

      <Input
        autoComplete="new-password"
        disabled={isLoading}
        error={fieldErrors.password}
        label="Password"
        name="password"
        placeholder="Minimum 6 characters"
        type="password"
        value={values.password}
        onChange={updateField('password')}
      />

      {formError ? (
        <p aria-live="polite" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {formError}
        </p>
      ) : null}

      {successMessage ? (
        <p aria-live="polite" className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <Button className="w-full" isLoading={isLoading} type="submit">
        Register
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link className="font-semibold text-brand-600 transition hover:text-brand-700" to={APP_ROUTES.login}>
          Login
        </Link>
      </p>

      {requiresEmailVerification ? (
        <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Email confirmation is enabled for this project.
        </p>
      ) : null}
    </form>
  );
};
