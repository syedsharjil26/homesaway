import type { AuthSession } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/src/services/supabaseClient';

type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
};

type SignInInput = {
  email: string;
  password: string;
};

export function useSupabaseAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (isMounted) {
          setSession(currentSession);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to get session');
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
        setAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateSession = useCallback((nextSession: AuthSession | null) => {
    setSession(nextSession);
    if (nextSession) {
      setError(null);
    }
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    setActionLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: input.email.trim().toLowerCase(),
        password: input.password,
        options: {
          data: {
            full_name: input.fullName.trim(),
            phone: input.phone.trim(),
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        updateSession(data.session);
      }

      setError(null);
      return { data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      return { error: message };
    } finally {
      setActionLoading(false);
    }
  }, [updateSession]);

  const signIn = useCallback(async (input: SignInInput) => {
    setActionLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: input.email.trim().toLowerCase(),
        password: input.password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.session) {
        updateSession(data.session);
      }

      setError(null);
      return { data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      return { error: message };
    } finally {
      setActionLoading(false);
    }
  }, [updateSession]);

  const signOut = useCallback(async () => {
    setActionLoading(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
      updateSession(null);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  }, [updateSession]);

  const isLoading = authLoading || actionLoading;

  return {
    session,
    authLoading,
    actionLoading,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!session,
  };
}
