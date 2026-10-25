import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ScreenStateView } from '@/components/common/ScreenStateView';
import { Button } from '@/components/common/Button';
import { Tokens } from '@/constants/tokens';
import { ScreenViewState } from '@/types/listing';
import { formatVND } from '@/lib/currency';
import {
  useCartStore,
  selectCartItems,
  selectCartTotalVnd,
} from '@/store/cart-store';

export default function CartScreen() {
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

  return (
    <View style={styles.container}>
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
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.listing.title}</Text>
                <Text style={styles.itemPrice}>
                  {formatVND(item.listing.priceVnd)} x {item.quantity}
                </Text>
                <Text style={styles.subtotalText}>
                  Thành tiền:{' '}
                  {formatVND(item.listing.priceVnd * item.quantity)}
                </Text>
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Xóa sản phẩm ${item.listing.title} khỏi giỏ hàng`}
                style={styles.deleteBtn}
                onPress={() => removeFromCart(item.listing.id)}
              >
                <Text style={styles.deleteBtnText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {cartItems.length > 0 && (
          <View style={styles.checkoutBar}>
            <View>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalPrice}>{formatVND(totalVnd)}</Text>
            </View>

            <View style={styles.checkoutActions}>
              <Button
                title="Xóa tất cả"
                variant="outline"
                onPress={clearCart}
                accessibilityLabel="Xóa sạch toàn bộ giỏ hàng"
                style={styles.clearBtn}
              />
              <Button
                title="Hẹn giao dịch"
                variant="primary"
                onPress={() => alert('Đã gửi yêu cầu hẹn nhận đồ đến người bán!')}
                accessibilityLabel="Xác nhận hẹn gặp giao dịch trong khuôn viên trường"
              />
            </View>
          </View>
        )}
      </ScreenStateView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.background,
  },
  listContent: {
    padding: Tokens.spacing.screenPadding,
    gap: Tokens.spacing.md,
  },
  card: {
    backgroundColor: Tokens.colors.surface,
    borderRadius: Tokens.borderRadius.lg,
    padding: Tokens.spacing.md,
    borderWidth: 1,
    borderColor: Tokens.colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    marginRight: Tokens.spacing.md,
  },
  itemTitle: {
    fontSize: Tokens.typography.fontSizes.md,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.textPrimary,
    marginBottom: Tokens.spacing.xxs,
  },
  itemPrice: {
    fontSize: Tokens.typography.fontSizes.sm,
    color: Tokens.colors.textSecondary,
    marginBottom: Tokens.spacing.xxs,
  },
  subtotalText: {
    fontSize: Tokens.typography.fontSizes.sm,
    fontWeight: Tokens.typography.fontWeights.semibold,
    color: Tokens.colors.primary,
  },
  deleteBtn: {
    minHeight: Tokens.layout.minTouchTarget,
    minWidth: Tokens.layout.minTouchTarget,
    paddingHorizontal: Tokens.spacing.sm,
    borderRadius: Tokens.borderRadius.md,
    backgroundColor: Tokens.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Tokens.colors.borderSubtle,
  },
  deleteBtnText: {
    fontSize: Tokens.typography.fontSizes.xs,
    color: Tokens.colors.error,
    fontWeight: Tokens.typography.fontWeights.semibold,
  },
  checkoutBar: {
    backgroundColor: Tokens.colors.surface,
    padding: Tokens.spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: Tokens.colors.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: Tokens.typography.fontSizes.xs,
    color: Tokens.colors.textMuted,
  },
  totalPrice: {
    fontSize: Tokens.typography.fontSizes.lg,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.primary,
  },
  checkoutActions: {
    flexDirection: 'row',
    gap: Tokens.spacing.xs,
  },
  clearBtn: {
    paddingHorizontal: Tokens.spacing.sm,
  },
});
