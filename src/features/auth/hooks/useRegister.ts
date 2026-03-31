import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { register } from '@/features/auth/api/auth.api';
import type { AuthFieldErrors, AuthMutationResult, RegisterCredentials } from '@/features/auth/types/auth.types';
import { APP_ROUTES } from '@/shared/constants/app-routes';

const INITIAL_VALUES: RegisterCredentials = {
  email: '',
  password: '',
  username: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegisterValues = ({ email, password, username }: RegisterCredentials): AuthFieldErrors => {
  const errors: AuthFieldErrors = {};

  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (username.trim().length < 3) {
    errors.username = 'Username must contain at least 3 characters.';
  }

  if (password.trim().length < 6) {
    errors.password = 'Password must contain at least 6 characters.';
  }

  return errors;
};

export const useRegister = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterCredentials>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const registerMutation = useMutation<AuthMutationResult, Error, RegisterCredentials>({
    mutationFn: register,
    onSuccess: (result) => {
      setFormError(null);
      setSuccessMessage(
        result.requiresEmailVerification
          ? 'Account created. Check your email to confirm the account, then sign in.'
          : 'Account created successfully. Redirecting to the home page...',
      );
    },
    onError: (error: Error) => {
      setSuccessMessage(null);
      setFormError(error.message);
    },
  });

  useEffect(() => {
    if (!registerMutation.isSuccess || registerMutation.data?.requiresEmailVerification) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      navigate(APP_ROUTES.home, { replace: true });
    }, 300);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [navigate, registerMutation.data?.requiresEmailVerification, registerMutation.isSuccess]);

  const updateField =
    (field: keyof RegisterCredentials) =>
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

    const nextFieldErrors = validateRegisterValues(values);

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setFormError(null);
      setSuccessMessage(null);
      return;
    }

    await registerMutation.mutateAsync({
      email: values.email.trim(),
      password: values.password,
      username: values.username.trim(),
    });
  };

  return {
    values,
    fieldErrors,
    formError,
    successMessage,
    isLoading: registerMutation.isPending,
    requiresEmailVerification: registerMutation.data?.requiresEmailVerification ?? false,
    updateField,
    handleSubmit,
  };
};
