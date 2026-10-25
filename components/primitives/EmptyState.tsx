import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@/constants/theme';
import { AppButton } from './AppButton';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  onAction?: () => void;
  actionLabel?: string;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Chưa có dữ liệu',
  message = 'Hiện tại danh sách đang trống. Vui lòng quay lại sau.',
  onAction,
  actionLabel,
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
    backgroundColor: theme.colors.surfaceSubtle,
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
    color: theme.colors.text,
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
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel || `${title}. ${message}`}
    >
      <View style={badgeStyle}>
        {icon || <Text style={iconTextStyle}>📦</Text>}
      </View>

      <Text style={titleStyle}>{title}</Text>
      <Text style={messageStyle}>{message}</Text>

      {onAction && actionLabel && (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          accessibilityLabel={actionLabel}
          style={buttonStyle}
        />
      )}
    </View>
  );
};

export default EmptyState;
