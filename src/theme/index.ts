import { colors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
} as const;

export const typography = {
  hero: { fontSize: 40, fontWeight: '600' as const, letterSpacing: -0.5 },
  title: { fontSize: 24, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '500' as const, letterSpacing: 0.3 },
  caption: { fontSize: 12, fontWeight: '400' as const },
};

export const theme = { colors, spacing, radii, typography };
export { colors };
export type Theme = typeof theme;
