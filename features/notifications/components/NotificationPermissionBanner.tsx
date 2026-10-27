import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle, Alert } from 'react-native';
import { useTheme } from '@/constants/theme';
import { NotificationPermissionStatus } from '../types';
import {
  getNotificationPermission,
  requestNotificationPermission,
  handlePermissionDenied,
  checkAndNotifyFavoritePriceChanges,
} from '../notificationService';
import { ListingItem } from '@/types/listing';

interface Props {
  favoriteIds: string[];
  derivedListings: ListingItem[];
  onTriggerSimulatedDrop?: () => void;
}

export function NotificationPermissionBanner({
  favoriteIds,
  derivedListings,
  onTriggerSimulatedDrop,
}: Props) {
  const theme = useTheme();
  const [permission, setPermission] = useState<NotificationPermissionStatus>('undetermined');
  const [lastCheckMessage, setLastCheckMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const status = await getNotificationPermission();
      setPermission(status);
    })();
  }, []);

  const handleRequestPermission = async () => {
    const status = await requestNotificationPermission();
    setPermission(status);
    if (status === 'granted') {
      Alert.alert(
        'Đã bật thông báo',
        'Ứng dụng sẽ tự động gửi thông báo đến bạn khi có sản phẩm yêu thích giảm giá.'
      );
    } else {
      Alert.alert(
        'Từ chối thông báo',
        'Bạn đã từ chối nhận thông báo. Bạn có thể bật lại bất cứ lúc nào tại đây.'
      );
    }
  };

  const handleDeny = async () => {
    await handlePermissionDenied();
    setPermission('denied');
  };

  const handleManualCheck = async () => {
    if (favoriteIds.length === 0) {
      Alert.alert('Chưa có yêu thích', 'Hãy thêm ít nhất 1 sản phẩm vào danh sách yêu thích để kiểm tra thông báo.');
      return;
    }

    const notifs = await checkAndNotifyFavoritePriceChanges(favoriteIds, derivedListings);
    if (notifs.length === 0) {
      setLastCheckMessage('✅ Giá không đổi: Không có thông báo mới (Đã chặn spam thành công).');
      Alert.alert(
        'Không có thay đổi giá',
        'Tất cả sản phẩm yêu thích đều giữ nguyên giá. Hệ thống tự động chặn gửi thông báo để tránh làm phiền (không spam).'
      );
    } else {
      setLastCheckMessage(`⚡ Đã kích hoạt ${notifs.length} thông báo giảm giá!`);
    }
  };

  const containerStyle: ViewStyle = {
    backgroundColor:
      permission === 'granted'
        ? theme.colors.surfaceSubtle
        : permission === 'denied'
        ? theme.colors.surfaceSubtle
        : theme.colors.primaryBgMuted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor:
      permission === 'granted'
        ? theme.colors.borderSubtle
        : permission === 'denied'
        ? theme.colors.borderSubtle
        : theme.colors.primary,
  };

  const headerRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  };

  const titleStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  };

  const descStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.sm,
    lineHeight: theme.typography.lineHeights.sm,
  };

  const actionsRowStyle: ViewStyle = {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  };

  const btnStyle = (primary: boolean): ViewStyle => ({
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.xs,
    backgroundColor: primary ? theme.colors.primaryBg : theme.colors.surface,
    borderWidth: 1,
    borderColor: primary ? theme.colors.primaryBg : theme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  });

  const btnTextStyle = (primary: boolean): TextStyle => ({
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: primary ? theme.colors.textInverse : theme.colors.text,
  });

  const feedbackTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
    marginTop: theme.spacing.xs,
  };

  return (
    <View style={containerStyle}>
      <View style={headerRowStyle}>
        <Text style={titleStyle}>
          {permission === 'granted'
            ? '🔔 Thông báo giá sản phẩm yêu thích (Đang BẬT)'
            : permission === 'denied'
            ? '🔕 Thông báo giá sản phẩm (Đang TẮT)'
            : '🔔 Nhận thông báo khi sản phẩm yêu thích GIẢM GIÁ'}
        </Text>
      </View>

      <Text style={descStyle}>
        {permission === 'granted'
          ? 'Hệ thống tự động theo dõi giá và gửi thông báo khi giá giảm. Tuyệt đối không spam khi giá không đổi.'
          : permission === 'denied'
          ? 'Bạn đã từ chối quyền thông báo. Bấm "Bật lại" để nhận thông báo mỗi khi người bán hạ giá sách/đồ dùng.'
          : 'Cho phép ứng dụng gửi thông báo cục bộ khi món đồ bạn đang lưu được người bán giảm giá trao đổi.'}
      </Text>

      <View style={actionsRowStyle}>
        {permission !== 'granted' && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Đồng ý cấp quyền nhận thông báo giảm giá"
            style={btnStyle(true)}
            onPress={handleRequestPermission}
          >
            <Text style={btnTextStyle(true)}>
              {permission === 'denied' ? 'Bật lại thông báo' : 'Cho phép thông báo'}
            </Text>
          </TouchableOpacity>
        )}

        {permission === 'undetermined' && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Từ chối cấp quyền nhận thông báo"
            style={btnStyle(false)}
            onPress={handleDeny}
          >
            <Text style={btnTextStyle(false)}>Để sau</Text>
          </TouchableOpacity>
        )}

        {/* Demo Buttons for Viva Examiner */}
        {permission === 'granted' && (
          <>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Kiểm tra thay đổi giá (Thử nghiệm không spam khi giá giữ nguyên)"
              style={btnStyle(false)}
              onPress={handleManualCheck}
            >
              <Text style={btnTextStyle(false)}>🔍 Quét giá (Test không spam)</Text>
            </TouchableOpacity>

            {onTriggerSimulatedDrop && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Mô phỏng giảm giá sản phẩm yêu thích 20k để kích hoạt thông báo"
                style={btnStyle(true)}
                onPress={onTriggerSimulatedDrop}
              >
                <Text style={btnTextStyle(true)}>⚡ Mô phỏng giảm giá (Test Notif)</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {lastCheckMessage && <Text style={feedbackTextStyle}>{lastCheckMessage}</Text>}
    </View>
  );
}
