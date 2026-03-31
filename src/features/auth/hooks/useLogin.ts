import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '@/features/auth/api/auth.api';
import type { AuthFieldErrors, AuthMutationResult, LoginCredentials } from '@/features/auth/types/auth.types';
import { APP_ROUTES } from '@/shared/constants/app-routes';

const INITIAL_VALUES: LoginCredentials = {
  email: '',
  password: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateLoginValues = ({ email, password }: LoginCredentials): AuthFieldErrors => {
  const errors: AuthFieldErrors = {};

  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (password.trim().length < 6) {
    errors.password = 'Password must contain at least 6 characters.';
  }

  return errors;
};

export const useLogin = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginCredentials>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loginMutation = useMutation<AuthMutationResult, Error, LoginCredentials>({
    mutationFn: login,
    onSuccess: () => {
      setFormError(null);
      setSuccessMessage('Login successful. Redirecting to the home page...');
    },
    onError: (error: Error) => {
      setSuccessMessage(null);
      setFormError(error.message);
    },
  });

  useEffect(() => {
    if (!loginMutation.isSuccess) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      navigate(APP_ROUTES.home, { replace: true });
    }, 300);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [loginMutation.isSuccess, navigate]);

  const updateField =
    (field: keyof LoginCredentials) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      const nextValue = event.target.value;

      setValues((currentValues) => ({
        ...currentValues,
        [field]: nextValue,
      }));
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
      }));
      setFormError(null);
      setSuccessMessage(null);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const nextFieldErrors = validateLoginValues(values);

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setFormError(null);
      setSuccessMessage(null);
      return;
    }

    await loginMutation.mutateAsync({
      email: values.email.trim(),
      password: values.password,
    });
  };

  return {
    values,
    fieldErrors,
    formError,
    successMessage,
    isLoading: loginMutation.isPending,
    updateField,
    handleSubmit,
  };
};
