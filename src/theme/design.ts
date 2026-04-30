export const palette = {
  ink: '#111827',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  canvas: '#F8FAFC',
  surface: '#FFFFFF',
  line: '#E5E7EB',
  navy: '#0F2747',
  blue: '#1D4ED8',
  blueSoft: '#E8EEFF',
  green: '#15803D',
  greenSoft: '#EAF7EE',
  amber: '#F59E0B',
  amberSoft: '#FFF7E8',
  rose: '#BE123C',
};

export type ThemeMode = 'light' | 'dark';

export type AppTheme = typeof lightTheme;

export const lightTheme = {
  ink: '#111827',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  canvas: '#F8FAFC',
  surface: '#FFFFFF',
  line: '#E5E7EB',
  navy: '#0F2747',
  blue: '#1D4ED8',
  blueSoft: '#E8EEFF',
  green: '#15803D',
  greenSoft: '#EAF7EE',
  amber: '#F59E0B',
  amberSoft: '#FFF7E8',
  rose: '#BE123C',
  elevated: '#FFFFFF',
};

export const darkTheme: AppTheme = {
  ink: '#F8FAFC',
  muted: '#D1D5DB',
  subtle: '#94A3B8',
  canvas: '#0B1220',
  surface: '#111827',
  line: '#334155',
  navy: '#EAF1FF',
  blue: '#93C5FD',
  blueSoft: '#17294A',
  green: '#86EFAC',
  greenSoft: '#123822',
  amber: '#FCD34D',
  amberSoft: '#3A2A10',
  rose: '#FDA4AF',
  elevated: '#162033',
};

export function getTheme(mode: ThemeMode) {
  return mode === 'dark' ? darkTheme : lightTheme;
}

export const radii = {
  sm: 6,
  md: 8,
  lg: 8,
  xl: 8,
};

export const shadow = {
  shadowColor: '#101828',
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: 12 },
  shadowRadius: 24,
  elevation: 4,
};
