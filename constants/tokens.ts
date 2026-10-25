/**
 * Design tokens for Campus Marketplace.
 * RULE: All colors, typography, spacing, and touch target sizes must be defined here.
 * Never hardcode hex values outside of this file.
 */

export const Colors = {
  // Brand colors
  primary: '#1D4ED8', // Campus Royal Blue
  primaryDark: '#1E40AF',
  primaryLight: '#DBEAFE',
  primaryMuted: '#93C5FD',

  // Secondary & Accents
  accent: '#F59E0B', // Amber
  accentLight: '#FEF3C7',

  // Semantic Feedback
  success: '#15803D',
  successLight: '#DCFCE7',
  warning: '#B45309',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',

  // Neutrals & Surfaces
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceActive: '#E2E8F0',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  borderSubtle: '#E2E8F0',
  borderStrong: '#CBD5E1',

  // Interactive
  touchHighlight: 'rgba(29, 78, 216, 0.1)',
} as const;

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  screenPadding: 16,
} as const;

export const Typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 26,
    xl: 30,
    xxl: 36,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  pill: 9999,
} as const;

export const Layout = {
  minTouchTarget: 44, // Minimum 44x44 touch target size required for accessibility
} as const;

export const Tokens = {
  colors: Colors,
  spacing: Spacing,
  typography: Typography,
  borderRadius: BorderRadius,
  layout: Layout,
} as const;

export default Tokens;
