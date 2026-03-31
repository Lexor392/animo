import { supabaseClient } from '@/core/api/supabaseClient';
import type {
  AuthMutationResult,
  AuthUser,
  LoginCredentials,
  ProfileInsert,
  RegisterCredentials,
  SupabaseErrorLike,
} from '@/features/auth/types/auth.types';

const PROFILES_TABLE = 'profiles';

const buildAuthErrorMessage = (error: SupabaseErrorLike | null, fallbackMessage: string): string => {
  if (!error) {
    return fallbackMessage;
  }

  if (error.code === '23505') {
    return 'Username or email is already in use.';
  }

  return error.message || fallbackMessage;
};

const createProfileRecord = async (payload: ProfileInsert): Promise<void> => {
  const { error } = await supabaseClient.from(PROFILES_TABLE).upsert(payload, {
    onConflict: 'id',
  });

  if (error) {
    throw new Error(buildAuthErrorMessage(error, 'Unable to create the user profile.'));
  }
};

export const register = async ({
  email,
  password,
  username,
}: RegisterCredentials): Promise<AuthMutationResult> => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();

  const { data, error } = await supabaseClient.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        username: normalizedUsername,
      },
    },
  });

  if (error) {
    throw new Error(buildAuthErrorMessage(error, 'Unable to create your account.'));
  }

  if (!data.user) {
    throw new Error('Supabase did not return a user after registration.');
  }

  try {
    const timestamp = new Date().toISOString();

    // Keep auth and profile bootstrap together until the backend trigger is introduced.
    await createProfileRecord({
      id: data.user.id,
      email: normalizedEmail,
      username: normalizedUsername,
      avatar_url: null,
      bio: null,
      created_at: timestamp,
      updated_at: timestamp,
    });
  } catch (profileError) {
    if (data.session) {
      await supabaseClient.auth.signOut();
    }

    throw profileError instanceof Error ? profileError : new Error('Unable to create the user profile.');
  }

  return {
    session: data.session,
    user: data.user,
    requiresEmailVerification: !data.session,
  };
};

export const login = async ({ email, password }: LoginCredentials): Promise<AuthMutationResult> => {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    throw new Error(buildAuthErrorMessage(error, 'Unable to sign in.'));
  }

  if (!data.user) {
    throw new Error('Supabase did not return a user for this session.');
  }

  return {
    session: data.session,
    user: data.user,
    requiresEmailVerification: false,
  };
};

export const logout = async (): Promise<void> => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    throw new Error(buildAuthErrorMessage(error, 'Unable to sign out.'));
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error) {
    throw new Error(buildAuthErrorMessage(error, 'Unable to load the current user.'));
  }

  return data.user;
};
