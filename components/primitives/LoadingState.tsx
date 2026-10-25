import React from 'react';
import { View, Text, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@/constants/theme';

export interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Đang tải dữ liệu...',
  size = 'large',
  accessibilityLabel,
  style,
}) => {
  const theme = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  };

  const textStyle: TextStyle = {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.mutedText,
    fontWeight: theme.typography.fontWeights.medium,
    textAlign: 'center',
  };

  return (
    <View
      style={[containerStyle, style]}
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel || message}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size={size} color={theme.colors.primary} />
      <Text style={textStyle}>{message}</Text>
    </View>
  );
};

export default LoadingState;
