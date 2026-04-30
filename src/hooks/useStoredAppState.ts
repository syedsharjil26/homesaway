import { useEffect, useState } from 'react';

import { defaultStoredAppState, loadStoredAppState, saveStoredAppState, StoredAppState } from '@/src/storage/appState';

export function useStoredAppState() {
  const [state, setState] = useState<StoredAppState>(defaultStoredAppState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadStoredAppState()
      .then((storedState) => {
        if (isMounted) {
          setState(storedState);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveStoredAppState(state).catch(() => {
      // Local persistence is best-effort until a backend exists.
    });
  }, [isHydrated, state]);

  return { state, setState, isHydrated };
}
