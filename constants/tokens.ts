/**
 * Backward-compatible tokens re-export.
 * RULE: All tokens are defined in constants/theme.ts (the single source of truth).
 * No raw hex values exist in this file.
 */

import {
  lightTokens,
  darkTokens,
  spacing,
  radius,
  typography,
  layout,
  themeTokens,
  useTheme,
  ThemeProvider,
} from './theme';

export const Colors = {
  // Brand colors
  primary: lightTokens.primary,
  primaryDark: lightTokens.primaryBg,
  primaryLight: lightTokens.primaryBgMuted,
  primaryMuted: lightTokens.primaryBgMuted,

  // Secondary & Accents
  accent: lightTokens.warning,
  accentLight: lightTokens.warningBgMuted,

  // Semantic Feedback
  success: lightTokens.success,
  successLight: lightTokens.successBgMuted,
  warning: lightTokens.warning,
  warningLight: lightTokens.warningBgMuted,
  error: lightTokens.danger,
  errorLight: lightTokens.dangerBgMuted,

  // Neutrals & Surfaces
  background: lightTokens.background,
  surface: lightTokens.surface,
  surfaceSubtle: lightTokens.surfaceSubtle,
  surfaceActive: lightTokens.surfaceActive,

  // Typography
  textPrimary: lightTokens.text,
  textSecondary: lightTokens.mutedText,
  textMuted: lightTokens.mutedText,
  textInverse: lightTokens.textInverse,

  // Borders & Dividers
  borderSubtle: lightTokens.borderSubtle,
  borderStrong: lightTokens.borderStrong,

  // Interactive
  touchHighlight: lightTokens.touchHighlight,
} as const;

export const Spacing = spacing;
export const Typography = typography;
export const BorderRadius = radius;
export const Layout = layout;

export const Tokens = {
  colors: Colors,
  spacing: Spacing,
  typography: Typography,
  borderRadius: BorderRadius,
  layout: Layout,
  light: lightTokens,
  dark: darkTokens,
} as const;

export { useTheme, ThemeProvider, themeTokens };
export default Tokens;
