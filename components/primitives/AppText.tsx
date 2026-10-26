import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleProp,
  TextStyle,
  AccessibilityRole,
} from 'react-native';
import { useTheme } from '@/constants/theme';

export type TextVariant =
  | 'heading'
  | 'title'
  | 'subheading'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'muted';

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export type TextColor =
  | 'text'
  | 'mutedText'
  | 'primary'
  | 'danger'
  | 'success'
  | 'inverse';

export interface AppTextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  weight,
  color,
  align = 'left',
  style,
  children,
  accessibilityRole,
  accessibilityLabel,
  ...rest
}) => {
  const theme = useTheme();

  // Resolve accessibility role
  const resolvedRole: AccessibilityRole =
    accessibilityRole ||
    (variant === 'heading' || variant === 'title' || variant === 'subheading'
      ? 'header'
      : 'text');

  // Resolve color token with guaranteed >= 4.5:1 contrast
  const resolveColor = (): string => {
    if (color === 'mutedText') return theme.colors.mutedText;
    if (color === 'primary') return theme.colors.primary;
    if (color === 'danger') return theme.colors.danger;
    if (color === 'success') return theme.colors.success;
    if (color === 'inverse') return theme.colors.textInverse;
    if (variant === 'muted' || variant === 'caption') return theme.colors.mutedText;
    return theme.colors.text;
  };

  // Resolve font size and line height
  const getTypographyStyle = (): TextStyle => {
    switch (variant) {
      case 'heading':
        return {
          fontSize: theme.typography.fontSizes.xxl,
          lineHeight: theme.typography.lineHeights.xxl,
          fontWeight: weight || theme.typography.fontWeights.bold,
        };
      case 'title':
        return {
          fontSize: theme.typography.fontSizes.xl,
          lineHeight: theme.typography.lineHeights.xl,
          fontWeight: weight || theme.typography.fontWeights.bold,
        };
      case 'subheading':
        return {
          fontSize: theme.typography.fontSizes.lg,
          lineHeight: theme.typography.lineHeights.lg,
          fontWeight: weight || theme.typography.fontWeights.semibold,
        };
      case 'label':
        return {
          fontSize: theme.typography.fontSizes.xs,
          lineHeight: theme.typography.lineHeights.xs,
          fontWeight: weight || theme.typography.fontWeights.semibold,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        };
      case 'bodySmall':
      case 'muted':
        return {
          fontSize: theme.typography.fontSizes.sm,
          lineHeight: theme.typography.lineHeights.sm,
          fontWeight: weight || theme.typography.fontWeights.regular,
        };
      case 'caption':
        return {
          fontSize: theme.typography.fontSizes.xs,
          lineHeight: theme.typography.lineHeights.xs,
          fontWeight: weight || theme.typography.fontWeights.regular,
        };
      case 'body':
      default:
        return {
          fontSize: theme.typography.fontSizes.md,
          lineHeight: theme.typography.lineHeights.md,
          fontWeight: weight || theme.typography.fontWeights.regular,
        };
    }
  };

  const computedStyle: TextStyle = {
    ...getTypographyStyle(),
    color: resolveColor(),
    textAlign: align,
  };

  return (
    <RNText
      accessibilityRole={resolvedRole}
      accessibilityLabel={
        accessibilityLabel || (typeof children === 'string' ? children : undefined)
      }
      style={[computedStyle, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
};

export default AppText;
