import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useStoredAppState } from '@/src/hooks/useStoredAppState';
import { useSupabaseAuth } from '@/src/hooks/useSupabaseAuth';
import { ensureProfileForUser, UserProfile } from '@/src/services/profileService';

const PROFILE_TIMEOUT_MS = 8000;

type AppStateContextType = ReturnType<typeof useStoredAppState> &
  ReturnType<typeof useSupabaseAuth> & {
    profile: UserProfile | null;
    isProfileLoading: boolean;
    profileError: string | null;
    ready: boolean;
    refreshProfile: () => Promise<void>;
  };

const AppStateContext = createContext<AppStateContextType | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const store = useStoredAppState();
  const auth = useSupabaseAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileTimedOut, setProfileTimedOut] = useState(false);
  const sessionUser = auth.session?.user ?? null;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearProfileTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!sessionUser) {
      setProfile(null);
      setProfileError(null);
      return;
    }

    setIsProfileLoading(true);
    setProfileError(null);
    try {
      const nextProfile = await ensureProfileForUser(sessionUser);
      setProfile(nextProfile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile load failed';
      setProfileError(message);
    } finally {
      setIsProfileLoading(false);
    }
  }, [sessionUser]);

  useEffect(() => {
    clearProfileTimeout();

    if (!sessionUser) {
      setProfile(null);
      setProfileError(null);
      setIsProfileLoading(false);
      setProfileTimedOut(false);
      return;
    }

    let isCancelled = false;
    setProfileTimedOut(false);

    // Timeout fallback: if backend is unreachable, unblock the app after PROFILE_TIMEOUT_MS
    timeoutRef.current = setTimeout(() => {
      if (!isCancelled) {
        setIsProfileLoading(false);
        setProfileTimedOut(true);
      }
    }, PROFILE_TIMEOUT_MS);

    const syncProfile = async () => {
      setIsProfileLoading(true);
      setProfileError(null);
      try {
        const nextProfile = await ensureProfileForUser(sessionUser);
        if (!isCancelled) {
          setProfile(nextProfile);
          setProfileError(null);
          clearProfileTimeout();
        }
      } catch (err) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Profile sync failed';
          setProfileError(message);
          clearProfileTimeout();
        }
      } finally {
        if (!isCancelled) {
          setIsProfileLoading(false);
        }
      }
    };

    syncProfile();

    return () => {
      isCancelled = true;
      clearProfileTimeout();
    };
  // Intentionally depend on sessionUser.id only to avoid re-running on every render cycle
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser?.id]);

  // App is ready when storage hydrated, auth resolved, and profile resolved (or timed out)
  const ready =
    store.isHydrated &&
    !auth.authLoading &&
    (!sessionUser || !isProfileLoading || profileTimedOut);

  const value = useMemo(
    () => ({
      ...store,
      ...auth,
      profile,
      isProfileLoading,
      profileError,
      ready,
      refreshProfile,
    }),
    [auth, isProfileLoading, profile, profileError, ready, refreshProfile, store]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppStateContext() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppStateContext must be used inside AppStateProvider');
  }
  return context;
}
