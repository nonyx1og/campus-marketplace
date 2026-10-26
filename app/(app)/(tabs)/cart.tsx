import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { ScreenStateView } from '@/components/common/ScreenStateView';
import { Button } from '@/components/common/Button';
import { ScreenViewState } from '@/types/listing';
import { formatVND } from '@/lib/currency';
import {
  useCartStore,
  selectCartItems,
  selectCartTotalVnd,
} from '@/store/cart-store';

export default function CartScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [viewState, setViewState] = useState<ScreenViewState>('content');
  const cartItems = useCartStore(selectCartItems);
  const totalVnd = useCartStore(selectCartTotalVnd);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  // Compute effective state
  const effectiveState: ScreenViewState =
    viewState === 'content' && cartItems.length === 0 ? 'empty' : viewState;

  const handleRetry = () => {
    setViewState('content');
  };

  const handleCheckout = () => {
    Alert.alert(
      'Hẹn giao dịch',
      'Đã gửi yêu cầu hẹn nhận đồ đến người bán trong khuôn viên trường! Vui lòng kiểm tra tin nhắn hẹn gặp.',
      [{ text: 'Đồng ý' }]
    );
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const listContentStyle: ViewStyle = {
    padding: theme.spacing.screenPadding,
    gap: theme.spacing.md,
  };

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const itemInfoStyle: ViewStyle = {
    flex: 1,
    marginRight: theme.spacing.md,
  };

  const itemTitleStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xxs,
  };

  const itemPriceStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.xxs,
  };

  const subtotalTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.primary,
  };

  const deleteBtnStyle: ViewStyle = {
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.dangerBgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const deleteBtnTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.danger,
    fontWeight: theme.typography.fontWeights.semibold,
  };

  const checkoutBarStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const totalLabelStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.mutedText,
  };

  const totalPriceStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  };

  const checkoutActionsStyle: ViewStyle = {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  };

  return (
    <View style={containerStyle}>
      <ScreenStateView
        state={effectiveState}
        onRetry={handleRetry}
        onStateChange={setViewState}
        loadingMessage="Đang kiểm tra giỏ hàng sinh viên..."
        emptyTitle="Giỏ hàng trống"
        emptyMessage="Chưa có món hàng nào được thêm. Hãy chọn mua các sản phẩm từ bạn bè cùng trường nhé!"
        errorMessage="Không thể kết nối đến hệ thống thanh toán. Vui lòng thử lại."
      >
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.listing.id}
          contentContainerStyle={listContentStyle}
          renderItem={({ item }) => (
            <View style={cardStyle}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Xem chi tiết sản phẩm: ${item.listing.title}`}
                style={itemInfoStyle}
                onPress={() => router.push(`/(app)/listing/${item.listing.id}`)}
              >
                <Text style={itemTitleStyle}>{item.listing.title}</Text>
                <Text style={itemPriceStyle}>
                  {formatVND(item.listing.priceVnd)} x {item.quantity}
                </Text>
                <Text style={subtotalTextStyle}>
                  Thành tiền:{' '}
                  {formatVND(item.listing.priceVnd * item.quantity)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Xóa sản phẩm ${item.listing.title} khỏi giỏ hàng`}
                style={deleteBtnStyle}
                onPress={() => removeFromCart(item.listing.id)}
              >
                <Text style={deleteBtnTextStyle}>Xóa</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {cartItems.length > 0 && (
          <View style={checkoutBarStyle}>
            <View>
              <Text style={totalLabelStyle}>Tổng cộng:</Text>
              <Text style={totalPriceStyle}>{formatVND(totalVnd)}</Text>
            </View>

            <View style={checkoutActionsStyle}>
              <Button
                title="Xóa tất cả"
                variant="outline"
                onPress={clearCart}
                accessibilityLabel="Xóa sạch toàn bộ giỏ hàng"
              />
              <Button
                title="Hẹn giao dịch"
                variant="primary"
                onPress={handleCheckout}
                accessibilityLabel="Xác nhận hẹn gặp giao dịch trong khuôn viên trường"
              />
            </View>
          </View>
        )}
      </ScreenStateView>
    </View>
  );
}
