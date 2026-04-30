import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useStoredAppState } from '@/src/hooks/useStoredAppState';
import { useSupabaseAuth } from '@/src/hooks/useSupabaseAuth';
import { ensureProfileForUser, UserProfile } from '@/src/services/profileService';

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
  const sessionUser = auth.session?.user ?? null;

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
    if (!sessionUser) {
      setProfile(null);
      setProfileError(null);
      setIsProfileLoading(false);
      return;
    }

    let isCancelled = false;

    const syncProfile = async () => {
      setIsProfileLoading(true);
      setProfileError(null);
      try {
        const nextProfile = await ensureProfileForUser(sessionUser);
        if (!isCancelled) {
          setProfile(nextProfile);
          setProfileError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Profile sync failed';
          setProfileError(message);
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
    };
  }, [sessionUser]);

  const ready = store.isHydrated && !auth.authLoading && (!sessionUser || (!isProfileLoading && (!!profile || !!profileError)));

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
