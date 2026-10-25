import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Tokens } from '@/constants/tokens';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'danger':
        return styles.dangerContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      case 'secondary':
        return styles.secondaryText;
      case 'danger':
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || isLoading, busy: isLoading }}
      activeOpacity={0.8}
      disabled={disabled || isLoading}
      onPress={onPress}
      style={[
        styles.baseButton,
        getContainerStyle(),
        (disabled || isLoading) && styles.disabledContainer,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? Tokens.colors.primary : Tokens.colors.textInverse}
        />
      ) : (
        <Text style={[styles.baseText, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    minHeight: Tokens.layout.minTouchTarget, // Mandatory min 44x44
    minWidth: Tokens.layout.minTouchTarget,
    paddingHorizontal: Tokens.spacing.lg,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryContainer: {
    backgroundColor: Tokens.colors.primary,
  },
  secondaryContainer: {
    backgroundColor: Tokens.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Tokens.colors.borderSubtle,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Tokens.colors.primary,
  },
  dangerContainer: {
    backgroundColor: Tokens.colors.error,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  baseText: {
    fontSize: Tokens.typography.fontSizes.md,
    fontWeight: Tokens.typography.fontWeights.semibold,
  },
  primaryText: {
    color: Tokens.colors.textInverse,
  },
  secondaryText: {
    color: Tokens.colors.textPrimary,
  },
  outlineText: {
    color: Tokens.colors.primary,
  },
});
