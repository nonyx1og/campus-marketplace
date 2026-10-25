import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Tokens } from '@/constants/tokens';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Không tìm thấy trang' }} />
      <View
        style={styles.container}
        accessibilityRole="alert"
        accessibilityLabel="Trang bạn tìm kiếm không tồn tại trên hệ thống"
      >
        <Text style={styles.emoji}>🔍</Text>
        <Text style={styles.title}>404 - Không tìm thấy trang</Text>
        <Text style={styles.description}>
          Đường dẫn bạn yêu cầu không tồn tại hoặc đã được chuyển sang địa chỉ khác.
        </Text>

        <Link
          href="/"
          style={styles.linkButton}
          accessibilityRole="button"
          accessibilityLabel="Quay về trang chủ Campus Marketplace"
        >
          <Text style={styles.linkText}>Quay về trang chủ</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing.xl,
  },
  emoji: {
    fontSize: 54,
    marginBottom: Tokens.spacing.md,
  },
  title: {
    fontSize: Tokens.typography.fontSizes.xl,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.textPrimary,
    marginBottom: Tokens.spacing.xs,
    textAlign: 'center',
  },
  description: {
    fontSize: Tokens.typography.fontSizes.sm,
    color: Tokens.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.xl,
    lineHeight: Tokens.typography.lineHeights.sm,
  },
  linkButton: {
    minHeight: Tokens.layout.minTouchTarget,
    minWidth: Tokens.layout.minTouchTarget,
    backgroundColor: Tokens.colors.primary,
    paddingHorizontal: Tokens.spacing.lg,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: Tokens.colors.textInverse,
    fontWeight: Tokens.typography.fontWeights.semibold,
    fontSize: Tokens.typography.fontSizes.md,
  },
});
