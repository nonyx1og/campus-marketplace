import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/constants/theme';

export interface OfflineBannerProps {
  lastUpdated: string | null;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function formatLastUpdatedTime(isoString: string | null): string {
  if (!isoString) return 'Chưa có thông tin';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Gần đây';

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  } catch {
    return 'Gần đây';
  }
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  lastUpdated,
  onRetry,
  isRetrying = false,
}) => {
  const theme = useTheme();

  const containerStyle: ViewStyle = {
    backgroundColor: theme.colors.warningBgMuted,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const textContainerStyle: ViewStyle = {
    flex: 1,
    marginRight: theme.spacing.sm,
  };

  const titleStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.warning,
    marginBottom: theme.spacing.xxs,
  };

  const subtextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.mutedText,
  };

  const buttonStyle: ViewStyle = {
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xxs,
  };

  const buttonTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  };

  return (
    <View
      style={containerStyle}
      accessibilityRole="alert"
      accessibilityLabel={`Ngoại tuyến, đang hiển thị catalogue lưu trữ gần nhất lúc ${formatLastUpdatedTime(lastUpdated)}`}
      accessibilityLiveRegion="polite"
    >
      <View style={textContainerStyle}>
        <Text style={titleStyle}>⚡ Offline — showing last updated catalogue</Text>
        <Text style={subtextStyle}>
          Lần cập nhật gần nhất: {formatLastUpdatedTime(lastUpdated)}
        </Text>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Thử kết nối lại và làm mới dữ liệu"
        style={buttonStyle}
        onPress={onRetry}
        disabled={isRetrying}
        activeOpacity={0.7}
      >
        {isRetrying ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Text style={buttonTextStyle}>Thử lại</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default OfflineBanner;
