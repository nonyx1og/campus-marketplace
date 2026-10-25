import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@/constants/theme';
import { AppButton } from './AppButton';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Đã có lỗi xảy ra',
  message = 'Không thể hoàn thành thao tác. Vui lòng kiểm tra lại kết nối và thử lại.',
  onRetry,
  retryLabel = 'Thử lại',
  icon,
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

  const badgeStyle: ViewStyle = {
    width: 64,
    height: 64,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.dangerBgMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  };

  const iconTextStyle: TextStyle = {
    fontSize: 28,
  };

  const titleStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.lg,
    lineHeight: theme.typography.lineHeights.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.danger,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  };

  const messageStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.mutedText,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    maxWidth: 320,
  };

  const buttonStyle: ViewStyle = {
    marginTop: theme.spacing.xs,
  };

  return (
    <View
      style={[containerStyle, style]}
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel || `${title}. ${message}`}
    >
      <View style={badgeStyle}>
        {icon || <Text style={iconTextStyle}>⚠️</Text>}
      </View>

      <Text style={titleStyle}>{title}</Text>
      <Text style={messageStyle}>{message}</Text>

      {onRetry && (
        <AppButton
          title={retryLabel}
          onPress={onRetry}
          variant="danger"
          accessibilityLabel={retryLabel}
          style={buttonStyle}
        />
      )}
    </View>
  );
};

export default ErrorState;
