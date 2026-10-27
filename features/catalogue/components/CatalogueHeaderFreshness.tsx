import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/constants/theme';
import { formatLastUpdatedTime } from './OfflineBanner';

export interface CatalogueHeaderFreshnessProps {
  lastUpdated: string | null;
  isRefetching: boolean;
  refreshError: string | null;
  itemCount: number;
  onDismissError?: () => void;
  onRetry?: () => void;
}

export const CatalogueHeaderFreshness: React.FC<CatalogueHeaderFreshnessProps> = ({
  lastUpdated,
  isRefetching,
  refreshError,
  itemCount,
  onDismissError,
  onRetry,
}) => {
  const theme = useTheme();

  const formattedTime = formatLastUpdatedTime(lastUpdated);

  const containerStyle: ViewStyle = {
    marginBottom: theme.spacing.sm,
  };

  const statusBarStyle: ViewStyle = {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  };

  const statusTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.mutedText,
    fontWeight: theme.typography.fontWeights.medium,
  };

  const refreshHintStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  };

  const errorCardStyle: ViewStyle = {
    backgroundColor: theme.colors.dangerBgMuted,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const errorTitleStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.danger,
    marginBottom: 2,
  };

  const errorSubStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeights.xs,
  };

  const dismissBtnStyle: ViewStyle = {
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.xs,
  };

  return (
    <View style={containerStyle}>
      {/* Refresh Error Banner: Proves cache preservation on error */}
      {refreshError && (
        <View style={errorCardStyle}>
          <View style={{ flex: 1 }}>
            <Text style={errorTitleStyle}>⚠️ Làm mới không thành công</Text>
            <Text style={errorSubStyle}>
              Không thể tải dữ liệu mới từ máy chủ. Toàn bộ {itemCount} sản phẩm đang hiển thị vẫn được bảo toàn nguyên vẹn từ bản lưu lúc {formattedTime}.
            </Text>
          </View>

          {onDismissError && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Đóng thông báo lỗi làm mới"
              style={dismissBtnStyle}
              onPress={onDismissError}
            >
              <Text style={{ fontSize: 16, color: theme.colors.danger, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Freshness Status Bar */}
      <View style={statusBarStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {isRefetching ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={{ fontSize: 13 }}>🕒</Text>
          )}
          <Text style={statusTextStyle}>
            {isRefetching
              ? 'Đang cập nhật danh mục...'
              : `Cập nhật lần cuối: ${formattedTime}`}
          </Text>
        </View>

        {!isRefetching && (
          <Text style={refreshHintStyle}>↓ Kéo để làm mới</Text>
        )}
      </View>
    </View>
  );
};
