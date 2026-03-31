import { Link } from 'react-router-dom';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { Button } from '@/shared/ui/Button/Button';
import { Input } from '@/shared/ui/Input/Input';
import { APP_ROUTES } from '@/shared/constants/app-routes';

export const LoginForm = (): JSX.Element => {
  const { fieldErrors, formError, handleSubmit, isLoading, successMessage, updateField, values } = useLogin();

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Login</h2>
        <p className="mt-2 text-sm text-slate-500">Use your email account to continue to the platform.</p>
      </div>

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
        autoComplete="current-password"
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
        Login
      </Button>

      <p className="text-center text-sm text-slate-500">
        Need an account?{' '}
        <Link className="font-semibold text-brand-600 transition hover:text-brand-700" to={APP_ROUTES.register}>
          Create one
        </Link>
      </p>
    </form>
  );
};
