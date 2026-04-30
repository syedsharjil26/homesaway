import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ThemeMode } from '@/src/theme/design';

const STORAGE_KEY = 'homesawayclean:app-state:v2';

export type StoredAppState = {
  themeMode: ThemeMode;
  recentlyViewedIds: string[];
  compareIds: string[];
};

export const defaultStoredAppState: StoredAppState = {
  themeMode: 'light',
  recentlyViewedIds: [],
  compareIds: [],
};

export async function loadStoredAppState(): Promise<StoredAppState> {
  const rawState = await AsyncStorage.getItem(STORAGE_KEY);

  if (!rawState) {
    return defaultStoredAppState;
  }

  try {
    const parsed = JSON.parse(rawState) as Partial<StoredAppState>;
    return {
      ...defaultStoredAppState,
      ...parsed,
      themeMode: parsed.themeMode === 'dark' ? 'dark' : 'light',
      recentlyViewedIds: Array.isArray(parsed.recentlyViewedIds) ? parsed.recentlyViewedIds : [],
      compareIds: Array.isArray(parsed.compareIds) ? parsed.compareIds : [],
    };
  } catch {
    return defaultStoredAppState;
  }
}

export async function saveStoredAppState(state: StoredAppState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
