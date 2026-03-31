import type { PropsWithChildren } from 'react';
import { AuthProvider } from '@/core/providers/AuthProvider';
import { QueryProvider } from '@/core/providers/QueryProvider';

export const AppProviders = ({ children }: PropsWithChildren): JSX.Element => {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
};
