import type { Session, User } from '@supabase/supabase-js';

export type AuthUser = User;
export type AuthSession = Session;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

export interface AuthFieldErrors {
  email?: string;
  password?: string;
  username?: string;
}

export interface AuthMutationResult {
  session: AuthSession | null;
  user: AuthUser;
  requiresEmailVerification: boolean;
}

export interface AuthStatePayload {
  loading: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
}

export interface AuthStoreState extends AuthStatePayload {
  isAuthenticated: boolean;
  resetAuthState: () => void;
  setAuthState: (payload: AuthStatePayload) => void;
  setLoading: (loading: boolean) => void;
}

export interface SupabaseErrorLike {
  code?: string;
  message: string;
}
