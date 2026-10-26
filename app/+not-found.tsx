import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTheme } from '@/constants/theme';

export default function NotFoundScreen() {
  const theme = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  };

  const emojiStyle: TextStyle = {
    fontSize: 54,
    marginBottom: theme.spacing.md,
  };

  const titleStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  };

  const descriptionStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.mutedText,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.lineHeights.sm,
  };

  const linkButtonStyle: ViewStyle = {
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,
    backgroundColor: theme.colors.primaryBg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const linkTextStyle: TextStyle = {
    color: theme.colors.textInverse,
    fontWeight: theme.typography.fontWeights.semibold,
    fontSize: theme.typography.fontSizes.md,
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Không tìm thấy trang' }} />
      <View
        style={containerStyle}
        accessibilityRole="alert"
        accessibilityLabel="Trang bạn tìm kiếm không tồn tại trên hệ thống"
      >
        <Text style={emojiStyle}>🔍</Text>
        <Text style={titleStyle}>404 - Không tìm thấy trang</Text>
        <Text style={descriptionStyle}>
          Đường dẫn bạn yêu cầu không tồn tại hoặc đã được chuyển sang địa chỉ khác.
        </Text>

        <Link
          href="/"
          style={linkButtonStyle}
          accessibilityRole="button"
          accessibilityLabel="Quay về trang chủ Campus Marketplace"
        >
          <Text style={linkTextStyle}>Quay về trang chủ</Text>
        </Link>
      </View>
    </>
  );
}
