import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { supabaseClient } from '@/core/api/supabaseClient';
import { useAuthStore } from '@/features/auth/store/authStore';

export const AuthProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const resetAuthState = useAuthStore((state) => state.resetAuthState);
  const setAuthState = useAuthStore((state) => state.setAuthState);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async (): Promise<void> => {
      setLoading(true);

      const { data, error } = await supabaseClient.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        resetAuthState();
        return;
      }

      // Keep the local auth store in sync so route guards stay predictable.
      setAuthState({
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
      });
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [resetAuthState, setAuthState, setLoading]);

  return <>{children}</>;
};
