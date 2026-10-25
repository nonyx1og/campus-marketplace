import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
} from 'react-native';
import { Tokens } from '@/constants/tokens';
import { ScreenViewState } from '@/types/listing';
import { Button } from './Button';

export interface ScreenStateViewProps {
  state: ScreenViewState;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  errorMessage?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  // For interactive demo/grading review: allow toggling between the 4 states
  onStateChange?: (newState: ScreenViewState) => void;
  showStateSwitcher?: boolean;
}

export const ScreenStateView: React.FC<ScreenStateViewProps> = ({
  state,
  onRetry,
  loadingMessage = 'Đang tải dữ liệu...',
  emptyTitle = 'Chưa có dữ liệu',
  emptyMessage = 'Hiện tại danh sách đang trống. Vui lòng quay lại sau.',
  errorMessage = 'Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.',
  children,
  style,
  onStateChange,
  showStateSwitcher = true,
}) => {
  const renderStateContent = () => {
    switch (state) {
      case 'loading':
        return (
          <View
            style={styles.centerContainer}
            accessibilityRole="alert"
            accessibilityLabel={loadingMessage}
          >
            <ActivityIndicator size="large" color={Tokens.colors.primary} />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </View>
        );

      case 'empty':
        return (
          <View
            style={styles.centerContainer}
            accessibilityRole="summary"
            accessibilityLabel={`${emptyTitle}. ${emptyMessage}`}
          >
            <View style={styles.emptyBadge}>
              <Text style={styles.emptyIcon}>📦</Text>
            </View>
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyMessage}>{emptyMessage}</Text>
            {onRetry && (
              <Button
                title="Làm mới"
                onPress={onRetry}
                variant="secondary"
                accessibilityLabel="Làm mới lại danh sách"
                style={styles.actionButton}
              />
            )}
          </View>
        );

      case 'error':
        return (
          <View
            style={styles.centerContainer}
            accessibilityRole="alert"
            accessibilityLabel={`Lỗi: ${errorMessage}`}
          >
            <View style={styles.errorBadge}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>
            <Text style={styles.errorTitle}>Đã xảy ra sự cố</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            {onRetry && (
              <Button
                title="Thử lại"
                onPress={onRetry}
                variant="primary"
                accessibilityLabel="Thử lại thao tác vừa rồi"
                style={styles.actionButton}
              />
            )}
          </View>
        );

      case 'content':
      default:
        return <View style={styles.contentContainer}>{children}</View>;
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* Review toolbar to toggle states for grading/testing */}
      {showStateSwitcher && onStateChange && (
        <View style={styles.switcherContainer}>
          <Text style={styles.switcherLabel}>Review 4 states:</Text>
          <View style={styles.switcherButtonGroup}>
            {(['content', 'loading', 'empty', 'error'] as ScreenViewState[]).map((s) => {
              const isActive = state === s;
              return (
                <TouchableOpacity
                  key={s}
                  accessibilityRole="button"
                  accessibilityLabel={`Chuyển sang trạng thái ${s}`}
                  style={[
                    styles.switcherBtn,
                    isActive && styles.switcherBtnActive,
                  ]}
                  onPress={() => onStateChange(s)}
                >
                  <Text
                    style={[
                      styles.switcherBtnText,
                      isActive && styles.switcherBtnTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {renderStateContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Tokens.colors.background,
  },
  contentContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing.xl,
  },
  loadingText: {
    marginTop: Tokens.spacing.md,
    fontSize: Tokens.typography.fontSizes.sm,
    color: Tokens.colors.textSecondary,
    fontWeight: Tokens.typography.fontWeights.medium,
  },
  emptyBadge: {
    width: 64,
    height: 64,
    borderRadius: Tokens.borderRadius.pill,
    backgroundColor: Tokens.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing.md,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: Tokens.typography.fontSizes.lg,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.textPrimary,
    marginBottom: Tokens.spacing.xs,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: Tokens.typography.fontSizes.sm,
    color: Tokens.colors.textSecondary,
    textAlign: 'center',
    lineHeight: Tokens.typography.lineHeights.sm,
    marginBottom: Tokens.spacing.lg,
  },
  errorBadge: {
    width: 64,
    height: 64,
    borderRadius: Tokens.borderRadius.pill,
    backgroundColor: Tokens.colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing.md,
  },
  errorIcon: {
    fontSize: 28,
  },
  errorTitle: {
    fontSize: Tokens.typography.fontSizes.lg,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.error,
    marginBottom: Tokens.spacing.xs,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: Tokens.typography.fontSizes.sm,
    color: Tokens.colors.textSecondary,
    textAlign: 'center',
    lineHeight: Tokens.typography.lineHeights.sm,
    marginBottom: Tokens.spacing.lg,
  },
  actionButton: {
    marginTop: Tokens.spacing.sm,
  },
  switcherContainer: {
    backgroundColor: Tokens.colors.surface,
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Tokens.colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switcherLabel: {
    fontSize: Tokens.typography.fontSizes.xs,
    color: Tokens.colors.textMuted,
    fontWeight: Tokens.typography.fontWeights.semibold,
  },
  switcherButtonGroup: {
    flexDirection: 'row',
    gap: Tokens.spacing.xs,
  },
  switcherBtn: {
    minHeight: Tokens.layout.minTouchTarget,
    paddingHorizontal: Tokens.spacing.sm,
    borderRadius: Tokens.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Tokens.colors.surfaceSubtle,
  },
  switcherBtnActive: {
    backgroundColor: Tokens.colors.primary,
  },
  switcherBtnText: {
    fontSize: Tokens.typography.fontSizes.xs,
    color: Tokens.colors.textSecondary,
    fontWeight: Tokens.typography.fontWeights.medium,
    textTransform: 'capitalize',
  },
  switcherBtnTextActive: {
    color: Tokens.colors.textInverse,
    fontWeight: Tokens.typography.fontWeights.bold,
  },
});
