import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

/**
 * Campus Marketplace Design System & Theme Tokens.
 *
 * RULE: This file is the SINGLE SOURCE OF TRUTH for all color, spacing, radius,
 * and typography tokens.
 *
 * WCAG AA Contrast Compliance (verified >= 4.5:1 for body text):
 * - Light Theme:
 *   - text (#0F172A) on background (#F8FAFC): 17.06:1
 *   - text (#0F172A) on surface (#FFFFFF): 17.85:1
 *   - mutedText (#475569) on background (#F8FAFC): 7.24:1
 *   - mutedText (#475569) on surface (#FFFFFF): 7.58:1
 *   - primary (#1D4ED8) on surface (#FFFFFF): 6.70:1
 *   - danger (#B91C1C) on surface (#FFFFFF): 6.47:1
 *   - success (#15803D) on surface (#FFFFFF): 5.02:1
 *   - textInverse (#FFFFFF) on primary/danger/success buttons: >= 5.0:1
 *
 * - Dark Theme:
 *   - text (#F8FAFC) on background (#0B0F17): 18.33:1
 *   - text (#F8FAFC) on surface (#161E2E): 15.94:1
 *   - mutedText (#94A3B8) on background (#0B0F17): 7.48:1
 *   - mutedText (#94A3B8) on surface (#161E2E): 6.50:1
 *   - primary (#60A5FA) on surface (#161E2E): 6.56:1
 *   - danger (#F87171) on surface (#161E2E): 6.03:1
 *   - success (#4ADE80) on surface (#161E2E): 9.57:1
 *   - textInverse (#FFFFFF) on primaryBg (#2563EB): 5.17:1
 *   - textInverse (#FFFFFF) on dangerBg (#DC2626): 4.83:1
 *   - textInverse (#FFFFFF) on successBg (#15803D): 5.02:1
 */

export const lightTokens = {
  // Required core color tokens
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  mutedText: '#475569',
  primary: '#1D4ED8',
  danger: '#B91C1C',
  border: '#CBD5E1',
  success: '#15803D',

  // Semantic surfaces & interactive helpers
  surfaceSubtle: '#F1F5F9',
  surfaceActive: '#E2E8F0',
  borderSubtle: '#E2E8F0',
  borderStrong: '#94A3B8',

  // Button background tokens for solid fills
  primaryBg: '#1D4ED8',
  primaryBgMuted: '#DBEAFE',
  dangerBg: '#B91C1C',
  dangerBgMuted: '#FEE2E2',
  successBg: '#15803D',
  successBgMuted: '#DCFCE7',

  // Accents & warning
  warning: '#B45309',
  warningBgMuted: '#FEF3C7',

  // Contrast text & interaction
  textInverse: '#FFFFFF',
  touchHighlight: 'rgba(29, 78, 216, 0.1)',
} as const;

export const darkTokens = {
  // Required core color tokens
  background: '#0B0F17',
  surface: '#161E2E',
  text: '#F8FAFC',
  mutedText: '#94A3B8',
  primary: '#60A5FA',
  danger: '#F87171',
  border: '#334155',
  success: '#4ADE80',

  // Semantic surfaces & interactive helpers
  surfaceSubtle: '#1E293B',
  surfaceActive: '#334155',
  borderSubtle: '#1E293B',
  borderStrong: '#475569',

  // Button background tokens for solid fills (WCAG >= 4.5:1 with white text)
  primaryBg: '#2563EB',
  primaryBgMuted: '#1E3A8A',
  dangerBg: '#DC2626',
  dangerBgMuted: '#450A0A',
  successBg: '#15803D',
  successBgMuted: '#052E16',

  // Accents & warning
  warning: '#FBBF24',
  warningBgMuted: '#451A03',

  // Contrast text & interaction
  textInverse: '#FFFFFF',
  touchHighlight: 'rgba(96, 165, 250, 0.15)',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  screenPadding: 16,
} as const;

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
} as const;

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 34,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 26,
    xl: 30,
    xxl: 36,
    xxxl: 42,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const layout = {
  minTouchTarget: 44, // Minimum 44x44 touch target size required for accessibility
} as const;

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';
export type ThemeColors = {
  [K in keyof typeof lightTokens]: string;
};

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  layout: typeof layout;
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightTokens,
  spacing,
  radius,
  typography,
  layout,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkTokens,
  spacing,
  radius,
  typography,
  layout,
};

export const themeTokens = {
  light: lightTokens,
  dark: darkTokens,
  spacing,
  radius,
  typography,
  layout,
} as const;

// Optional Theme Context for manual toggling or system sync
interface ThemeContextValue {
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialPreference?: ThemePreference;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialPreference = 'system',
}) => {
  const [themePreference, setThemePreference] = useState<ThemePreference>(initialPreference);
  const systemScheme = useColorScheme();

  const resolvedMode: ThemeMode = useMemo(() => {
    if (themePreference === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return themePreference;
  }, [themePreference, systemScheme]);

  const theme: Theme = useMemo(() => {
    return resolvedMode === 'dark' ? darkTheme : lightTheme;
  }, [resolvedMode]);

  const toggleTheme = () => {
    setThemePreference((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const contextValue = useMemo(
    () => ({
      theme,
      themePreference,
      setThemePreference,
      toggleTheme,
    }),
    [theme, themePreference]
  );

  return React.createElement(ThemeContext.Provider, { value: contextValue }, children);
};

/**
 * Hook to access active theme tokens and mode.
 * Gracefully falls back to system color scheme if called outside of ThemeProvider.
 */
export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  const systemScheme = useColorScheme();

  if (context) {
    return context.theme;
  }

  const fallbackMode: ThemeMode = systemScheme === 'dark' ? 'dark' : 'light';
  return fallbackMode === 'dark' ? darkTheme : lightTheme;
}

/**
 * Hook to access theme switching functions.
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  const systemScheme = useColorScheme();

  if (context) {
    return context;
  }

  const fallbackMode: ThemeMode = systemScheme === 'dark' ? 'dark' : 'light';
  return {
    theme: fallbackMode === 'dark' ? darkTheme : lightTheme,
    themePreference: 'system',
    setThemePreference: () => {},
    toggleTheme: () => {},
  };
}

export default themeTokens;
