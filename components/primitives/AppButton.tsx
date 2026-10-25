import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { useTheme } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const theme = useTheme();

  // Resolve container styles based on variant and theme
  const getContainerVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.colors.surfaceSubtle,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.dangerBg,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'primary':
      default:
        return {
          backgroundColor: theme.colors.primaryBg,
        };
    }
  };

  // Resolve text styles based on variant and theme
  const getTextVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return {
          color: theme.colors.primary,
        };
      case 'secondary':
        return {
          color: theme.colors.text,
        };
      case 'danger':
      case 'primary':
      default:
        return {
          color: theme.colors.textInverse,
        };
    }
  };

  // Resolve sizing tokens (strictly maintaining min 44x44 touch target)
  const getSizeStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            minHeight: theme.layout.minTouchTarget, // Mandatory minimum 44
            minWidth: theme.layout.minTouchTarget,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.radius.sm,
          },
          text: {
            fontSize: theme.typography.fontSizes.sm,
            lineHeight: theme.typography.lineHeights.sm,
          },
        };
      case 'lg':
        return {
          container: {
            minHeight: 48,
            minWidth: theme.layout.minTouchTarget,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.md,
            borderRadius: theme.radius.lg,
          },
          text: {
            fontSize: theme.typography.fontSizes.lg,
            lineHeight: theme.typography.lineHeights.lg,
          },
        };
      case 'md':
      default:
        return {
          container: {
            minHeight: theme.layout.minTouchTarget, // Mandatory minimum 44
            minWidth: theme.layout.minTouchTarget,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.radius.md,
          },
          text: {
            fontSize: theme.typography.fontSizes.md,
            lineHeight: theme.typography.lineHeights.md,
          },
        };
    }
  };

  const sizeStyle = getSizeStyle();

  const baseContainerStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    opacity: disabled || isLoading ? 0.5 : 1,
    ...sizeStyle.container,
    ...getContainerVariantStyle(),
  };

  const baseTextStyle: TextStyle = {
    fontWeight: theme.typography.fontWeights.semibold,
    ...sizeStyle.text,
    ...getTextVariantStyle(),
  };

  const spinnerColor =
    variant === 'outline' || variant === 'ghost'
      ? theme.colors.primary
      : variant === 'secondary'
      ? theme.colors.text
      : theme.colors.textInverse;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || isLoading, busy: isLoading }}
      activeOpacity={0.75}
      disabled={disabled || isLoading}
      onPress={onPress}
      style={[baseContainerStyle, style]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {leftIcon && <View>{leftIcon}</View>}
          <Text style={[baseTextStyle, textStyle]}>{title}</Text>
          {rightIcon && <View>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;
