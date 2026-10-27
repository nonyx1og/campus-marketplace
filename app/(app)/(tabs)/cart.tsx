import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Image,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/constants/theme';
import { ScreenState } from '@/components/primitives/ScreenState';
import { AppButton } from '@/components/primitives/AppButton';
import {
  useCartStore,
  useCartItems,
  selectIsCartHydrated,
  useSelectedDeliveryRuleId,
} from '@/store/cart-store';
import {
  CAMPUS_DELIVERY_RULES,
  findDeliveryRuleById,
  DORM_FREE_SHIPPING_THRESHOLD,
  CAMPUS_PICKUP_FREE_THRESHOLD,
} from '@/features/cart/deliveryRules';
import { calculateCheckoutSummary } from '@/features/cart/calculateCheckoutSummary';
import {
  validateCartAgainstStock,
  autoAdjustCartItems,
} from '@/features/cart/stockRules';
import { EnrichedCartItem } from '@/features/cart/types';
import { fetchListingById } from '@/lib/api/catalogue';
import { getCatalogueCache } from '@/lib/storage/catalogue-cache';
import { queryClient } from '@/lib/query-client';
import { formatVND } from '@/lib/currency';
import { ListingItem } from '@/types/listing';
import { Listing, ScreenViewState } from '@/types/domain';

export default function CartScreen() {
  const router = useRouter();
  const theme = useTheme();

  // Fine-grained Zustand store state & selectors
  const cartItems = useCartItems();
  const isHydrated = useCartStore(selectIsCartHydrated);
  const selectedDeliveryRuleId = useSelectedDeliveryRuleId();

  const hydrateCart = useCartStore((state) => state.hydrateCart);
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const setCartItems = useCartStore((state) => state.setCartItems);
  const setDeliveryRuleId = useCartStore((state) => state.setDeliveryRuleId);
  const clearCart = useCartStore((state) => state.clearCart);

  // Local UI & submission state
  const [demoStateOverride, setDemoStateOverride] = useState<ScreenViewState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore cart on initial mount
  useEffect(() => {
    if (!isHydrated) {
      void hydrateCart();
    }
  }, [isHydrated, hydrateCart]);

  // Extract memoized listing IDs to optimize query caching
  const cartItemIds = useMemo(
    () => cartItems.map((item) => item.listingId),
    [cartItems]
  );

  /**
   * Reconcile cart items against server data / local cache.
   * Ensures cart NEVER relies solely on stale listing objects.
   */
  const {
    data: freshListingsMap = new Map<string, ListingItem | Listing | null>(),
    isLoading: isReconciling,
    isError,
    refetch,
    isRefetching,
  } = useQuery<Map<string, ListingItem | Listing | null>>({
    queryKey: ['cart', 'stock-reconciliation', cartItemIds],
    queryFn: async (): Promise<Map<string, ListingItem | Listing | null>> => {
      const map = new Map<string, ListingItem | Listing | null>();
      if (cartItemIds.length === 0) return map;

      // Batch resolve listings safely from Query cache, catalogue cache, or API
      await Promise.all(
        cartItemIds.map(async (id) => {
          try {
            // 1. Check in-memory TanStack Query cache
            const queryData = queryClient.getQueryData<ListingItem>(['listing', id]);
            if (queryData) {
              map.set(id, queryData);
              return;
            }

            // 2. Check local catalogue persistence cache
            const localCache = await getCatalogueCache();
            const cachedItem = localCache?.items.find((item) => item.id === id);
            if (cachedItem) {
              map.set(id, cachedItem);
              return;
            }

            // 3. Fallback to API query
            const remoteItem = await fetchListingById(id);
            map.set(id, remoteItem);
          } catch {
            map.set(id, null);
          }
        })
      );

      return map;
    },
    enabled: isHydrated && cartItemIds.length > 0,
    staleTime: 30000,
  });

  // Reconcile cart items with fresh stock data
  const validationResult = useMemo(() => {
    return validateCartAgainstStock(cartItems, freshListingsMap);
  }, [cartItems, freshListingsMap]);

  // Calculate transparent checkout summary using integer minor units (VND)
  const currentDeliveryRule = useMemo(() => {
    return findDeliveryRuleById(selectedDeliveryRuleId);
  }, [selectedDeliveryRuleId]);

  const calculationItems = useMemo(() => {
    return validationResult.items.map((it) => ({
      priceMinor: it.unitPriceMinor,
      quantity: it.quantity,
    }));
  }, [validationResult.items]);

  const checkoutSummary = useMemo(() => {
    return calculateCheckoutSummary(calculationItems, currentDeliveryRule);
  }, [calculationItems, currentDeliveryRule]);

  // 4-state machine evaluation
  const currentViewState: ScreenViewState = (() => {
    if (demoStateOverride) return demoStateOverride;
    if (!isHydrated || (isReconciling && cartItems.length > 0 && freshListingsMap.size === 0)) {
      return 'loading';
    }
    if (isError) return 'error';
    if (cartItems.length === 0) return 'empty';
    return 'content';
  })();

  // Handlers for quantity adjustments with stock rules
  const handleIncrement = async (item: EnrichedCartItem) => {
    if (item.availableStock <= 0) {
      if (Platform.OS === 'web') {
        window.alert('Sản phẩm này hiện đã hết hàng trong trường.');
      } else {
        Alert.alert('Hết hàng', 'Sản phẩm này hiện đã hết hàng trong trường.');
      }
      return;
    }
    if (item.quantity >= item.availableStock) {
      if (Platform.OS === 'web') {
        window.alert(`Chỉ còn tối đa ${item.availableStock} sản phẩm sẵn có trong trường.`);
      } else {
        Alert.alert(
          'Đạt giới hạn tồn kho',
          `Chỉ còn tối đa ${item.availableStock} sản phẩm sẵn có trong trường.`
        );
      }
      return;
    }
    const res = await incrementQuantity(item.listingId, item.availableStock);
    if (!res.success && res.message) {
      if (Platform.OS === 'web') {
        window.alert(res.message);
      } else {
        Alert.alert('Thông báo', res.message);
      }
    }
  };

  const handleDecrement = async (item: EnrichedCartItem) => {
    if (item.quantity <= 1) {
      if (Platform.OS === 'web') {
        const confirmed = window.confirm(
          `Bạn có chắc chắn muốn bỏ "${item.listing?.title || 'sản phẩm'}" khỏi giỏ hàng không?`
        );
        if (confirmed) {
          void removeFromCart(item.listingId);
        }
        return;
      }
      Alert.alert(
        'Xác nhận xóa',
        `Bạn có chắc chắn muốn bỏ "${item.listing?.title || 'sản phẩm'}" khỏi giỏ hàng không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: () => void removeFromCart(item.listingId),
          },
        ]
      );
      return;
    }
    await decrementQuantity(item.listingId);
  };

  const handleRemove = (item: EnrichedCartItem) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Bỏ "${item.listing?.title || 'sản phẩm'}" khỏi giỏ hàng?`
      );
      if (confirmed) {
        void removeFromCart(item.listingId);
      }
      return;
    }
    Alert.alert(
      'Xóa sản phẩm',
      `Bỏ "${item.listing?.title || 'sản phẩm'}" khỏi giỏ hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => void removeFromCart(item.listingId),
        },
      ]
    );
  };

  const handleAutoAdjust = async () => {
    const adjusted = autoAdjustCartItems(cartItems, freshListingsMap, true);
    await setCartItems(adjusted);
    if (Platform.OS === 'web') {
      window.alert('Đã tự động cân bằng số lượng theo tồn kho thực tế và loại bỏ các sản phẩm không còn khả dụng.');
    } else {
      Alert.alert(
        'Đã điều chỉnh giỏ hàng',
        'Đã tự động cân bằng số lượng theo tồn kho thực tế và loại bỏ các sản phẩm không còn khả dụng.'
      );
    }
  };

  const handleConfirmCheckout = () => {
    if (!validationResult.canCheckout) {
      const msg =
        validationResult.errorSummary ||
        'Vui lòng kiểm tra lại giỏ hàng trước khi xác nhận giao dịch.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Không thể đặt hẹn', msg);
      }
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const successMsg = `Yêu cầu hẹn gặp nhận ${checkoutSummary.itemsCount} món đồ đã được gửi đến người bán trong trường.\n\n• Phương thức: ${currentDeliveryRule.name}\n• Tổng tiền thanh toán: ${formatVND(
        checkoutSummary.totalMinor
      )}\n\nVui lòng kiểm tra tin nhắn và chuẩn bị tiền mặt/chuyển khoản khi gặp trực tiếp!`;

      if (Platform.OS === 'web') {
        window.alert(`Hẹn giao dịch thành công!\n\n${successMsg}`);
        void clearCart();
        router.push('/(app)/(tabs)');
        return;
      }

      Alert.alert(
        'Hẹn giao dịch thành công!',
        successMsg,
        [
          {
            text: 'Đồng ý',
            onPress: async () => {
              await clearCart();
              router.push('/(app)/(tabs)');
            },
          },
        ]
      );
    }, 600);
  };

  // Styles strictly conforming to design tokens and WCAG AA touch targets
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const scrollContentStyle: ViewStyle = {
    padding: theme.spacing.screenPadding,
    paddingBottom: 40,
    gap: theme.spacing.md,
  };

  const stockWarningBannerStyle: ViewStyle = {
    backgroundColor: theme.colors.warningBgMuted,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  };

  const warningHeaderStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.warning,
  };

  const warningTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeights.xs,
  };

  const itemCardStyle = (status: string): ViewStyle => ({
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor:
      status === 'valid'
        ? theme.colors.borderSubtle
        : status === 'exceeds_stock'
        ? theme.colors.warning
        : theme.colors.danger,
    gap: theme.spacing.sm,
  });

  const itemRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  };

  const itemImageStyle: ImageStyle = {
    width: 64,
    height: 64,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSubtle,
  };

  const imagePlaceholderStyle: ViewStyle = {
    width: 64,
    height: 64,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const itemInfoStyle: ViewStyle = {
    flex: 1,
    gap: theme.spacing.xxs,
  };

  const itemTitleStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  };

  const itemPriceStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.primary,
  };

  const itemStockLabelStyle = (status: string): TextStyle => ({
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium,
    color:
      status === 'valid'
        ? theme.colors.mutedText
        : status === 'exceeds_stock'
        ? theme.colors.warning
        : theme.colors.danger,
  });

  const itemControlsRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  };

  const quantityGroupStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.xxs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  };

  const qtyButtonStyle: ViewStyle = {
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const qtyButtonTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  };

  const qtyNumberStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.sm,
    minWidth: 32,
    textAlign: 'center',
  };

  const deleteButtonStyle: ViewStyle = {
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.dangerBgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const deleteButtonTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.danger,
  };

  const itemSubtotalTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  };

  // Delivery rules section styles
  const deliverySectionStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    gap: theme.spacing.sm,
  };

  const sectionHeaderStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  };

  const deliveryOptionStyle = (isSelected: boolean): ViewStyle => ({
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
    backgroundColor: isSelected ? theme.colors.surfaceActive : theme.colors.surface,
    gap: theme.spacing.xxs,
    minHeight: theme.layout.minTouchTarget,
  });

  const deliveryOptionHeaderStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const deliveryOptionNameStyle = (isSelected: boolean): TextStyle => ({
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: isSelected ? theme.colors.primary : theme.colors.text,
    flex: 1,
  });

  const deliveryOptionFeeStyle = (isFree: boolean): TextStyle => ({
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: isFree ? theme.colors.success : theme.colors.text,
    marginLeft: theme.spacing.xs,
  });

  const deliveryOptionDescStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.mutedText,
  };

  // Summary section styles
  const summarySectionStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    gap: theme.spacing.xs,
  };

  const summaryRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxs,
  };

  const summaryLabelStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.mutedText,
  };

  const summaryValueStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  };

  const summaryDividerStyle: ViewStyle = {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
    marginVertical: theme.spacing.xs,
  };

  const totalLabelStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  };

  const totalValueStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  };

  const thresholdNoteStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.success,
    marginTop: theme.spacing.xxs,
  };

  return (
    <View style={containerStyle}>
      <ScreenState
        state={currentViewState}
        showStateSwitcher={true}
        onStateChange={setDemoStateOverride}
        onRetry={() => void refetch()}
        loadingMessage="Đang kiểm tra tồn kho và đối chiếu giỏ hàng sinh viên..."
        emptyTitle="Giỏ hàng trống"
        emptyMessage="Chưa có món hàng nào trong giỏ. Hãy dạo quanh Chợ Campus để tìm giáo trình và đồ dùng học tập giá tốt!"
        emptyActionLabel="Khám phá Chợ Campus"
        onEmptyAction={() => router.push('/(app)/(tabs)')}
        errorMessage="Không thể kết nối đối chiếu tồn kho từ máy chủ. Vui lòng thử lại."
      >
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Stock issues banner & Auto-adjust button */}
          {!validationResult.isValid && validationResult.errorSummary && (
            <View style={stockWarningBannerStyle}>
              <Text style={warningHeaderStyle}>⚠️ Thay đổi thông tin tồn kho</Text>
              <Text style={warningTextStyle}>{validationResult.errorSummary}</Text>
              <AppButton
                title="Tự động điều chỉnh theo tồn kho"
                variant="outline"
                size="sm"
                accessibilityLabel="Tự động cân bằng số lượng theo tồn kho và loại bỏ món hết hàng"
                onPress={() => void handleAutoAdjust()}
                style={{ marginTop: theme.spacing.xs }}
              />
            </View>
          )}

          {/* List of Cart Items */}
          {validationResult.items.map((item) => {
            const photoUrl =
              item.listing?.photoUri ||
              (item.listing as any)?.imageUrl ||
              (item.listing as any)?.imageUri;

            return (
              <View
                key={item.listingId}
                style={itemCardStyle(item.status)}
              >
                <View style={itemRowStyle}>
                  {photoUrl ? (
                    <Image
                      source={{ uri: photoUrl }}
                      style={itemImageStyle}
                      accessibilityLabel={`Ảnh sản phẩm ${item.listing?.title || 'đồ dùng'}`}
                    />
                  ) : (
                    <View style={imagePlaceholderStyle}>
                      <Text style={{ color: theme.colors.mutedText, fontSize: theme.typography.fontSizes.xs }}>
                        Không ảnh
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={itemInfoStyle}
                    accessibilityRole="button"
                    accessibilityLabel={`Xem chi tiết sản phẩm: ${item.listing?.title || item.listingId}`}
                    onPress={() => {
                      if (item.listing) {
                        router.push(`/(app)/listing/${item.listingId}`);
                      }
                    }}
                  >
                    <Text
                      numberOfLines={2}
                      style={itemTitleStyle}
                    >
                      {item.listing?.title || `Mã tin: ${item.listingId}`}
                    </Text>

                    <Text style={itemPriceStyle}>
                      {formatVND(item.unitPriceMinor)}
                    </Text>

                    <Text style={itemStockLabelStyle(item.status)}>
                      {item.status === 'valid'
                        ? `Còn lại: ${item.availableStock} món trong trường`
                        : item.errorMessage}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Controls row: Quantity Adjuster, Delete, Subtotal */}
                <View style={itemControlsRowStyle}>
                  <View style={quantityGroupStyle}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`Giảm số lượng sản phẩm ${item.listing?.title || ''}`}
                      style={qtyButtonStyle}
                      onPress={() => void handleDecrement(item)}
                    >
                      <Text style={qtyButtonTextStyle}>−</Text>
                    </TouchableOpacity>

                    <Text
                      accessibilityLabel={`Số lượng hiện tại: ${item.quantity}`}
                      style={qtyNumberStyle}
                    >
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`Tăng số lượng sản phẩm ${item.listing?.title || ''}`}
                      style={qtyButtonStyle}
                      onPress={() => void handleIncrement(item)}
                    >
                      <Text style={qtyButtonTextStyle}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={itemSubtotalTextStyle}>
                    = {formatVND(item.subtotalMinor)}
                  </Text>

                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Xóa sản phẩm ${item.listing?.title || ''} khỏi giỏ hàng`}
                    style={deleteButtonStyle}
                    onPress={() => handleRemove(item)}
                  >
                    <Text style={deleteButtonTextStyle}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Campus Delivery Rules Section */}
          <View style={deliverySectionStyle}>
            <Text style={sectionHeaderStyle}>Phương thức nhận đồ trong trường</Text>
            {CAMPUS_DELIVERY_RULES.map((rule) => {
              const isSelected = rule.id === selectedDeliveryRuleId;
              const fee = checkoutSummary.subtotalMinor > 0 && isSelected
                ? checkoutSummary.deliveryFeeMinor
                : rule.feeMinor;
              const isFree = fee === 0;

              return (
                <TouchableOpacity
                  key={rule.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${rule.name}, Phí: ${isFree ? 'Miễn phí' : formatVND(fee)}`}
                  style={deliveryOptionStyle(isSelected)}
                  onPress={() => void setDeliveryRuleId(rule.id)}
                >
                  <View style={deliveryOptionHeaderStyle}>
                    <Text style={deliveryOptionNameStyle(isSelected)}>
                      {isSelected ? '✓ ' : '○ '}
                      {rule.name}
                    </Text>
                    <Text style={deliveryOptionFeeStyle(isFree)}>
                      {isFree ? 'Miễn phí' : formatVND(fee)}
                    </Text>
                  </View>
                  <Text style={deliveryOptionDescStyle}>{rule.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Checkout Summary Section */}
          <View style={summarySectionStyle}>
            <Text style={sectionHeaderStyle}>Tổng kết đơn hẹn</Text>

            <View style={summaryRowStyle}>
              <Text style={summaryLabelStyle}>
                Tạm tính ({checkoutSummary.itemsCount} món):
              </Text>
              <Text style={summaryValueStyle}>
                {formatVND(checkoutSummary.subtotalMinor)}
              </Text>
            </View>

            <View style={summaryRowStyle}>
              <Text style={summaryLabelStyle}>
                Phí giao ({currentDeliveryRule.name.split('(')[0].trim()}):
              </Text>
              <Text
                style={{
                  ...summaryValueStyle,
                  color:
                    checkoutSummary.deliveryFeeMinor === 0
                      ? theme.colors.success
                      : theme.colors.text,
                }}
              >
                {checkoutSummary.deliveryFeeMinor === 0
                  ? 'Miễn phí'
                  : formatVND(checkoutSummary.deliveryFeeMinor)}
              </Text>
            </View>

            {/* Threshold info indicator */}
            {selectedDeliveryRuleId === 'dorm_delivery' && (
              <Text style={thresholdNoteStyle}>
                {checkoutSummary.subtotalMinor >= DORM_FREE_SHIPPING_THRESHOLD
                  ? '✓ Đã đạt điều kiện Miễn phí giao KTX (đơn từ 100.000đ)!'
                  : `Thêm ${formatVND(
                      DORM_FREE_SHIPPING_THRESHOLD - checkoutSummary.subtotalMinor
                    )} để được Miễn phí giao tận phòng KTX.`}
              </Text>
            )}

            {selectedDeliveryRuleId === 'campus_pickup' && (
              <Text style={thresholdNoteStyle}>
                {checkoutSummary.subtotalMinor >= CAMPUS_PICKUP_FREE_THRESHOLD
                  ? '✓ Đã đạt điều kiện Miễn phí tại Trạm đồ (đơn từ 50.000đ)!'
                  : `Thêm ${formatVND(
                      CAMPUS_PICKUP_FREE_THRESHOLD - checkoutSummary.subtotalMinor
                    )} để được Miễn phí tại Trạm đồ.`}
              </Text>
            )}

            <View style={summaryDividerStyle} />

            <View style={summaryRowStyle}>
              <Text style={totalLabelStyle}>Tổng thanh toán:</Text>
              <Text style={totalValueStyle}>
                {formatVND(checkoutSummary.totalMinor)}
              </Text>
            </View>

            {/* Action buttons */}
            <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
              <AppButton
                title={
                  isSubmitting
                    ? 'Đang gửi yêu cầu hẹn...'
                    : 'Xác nhận hẹn gặp giao dịch'
                }
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                disabled={!validationResult.canCheckout || isSubmitting}
                accessibilityLabel="Xác nhận hẹn gặp giao dịch sinh viên trong trường"
                onPress={handleConfirmCheckout}
              />

              <AppButton
                title="Xóa tất cả giỏ hàng"
                variant="ghost"
                size="sm"
                accessibilityLabel="Xóa toàn bộ các sản phẩm đang có trong giỏ hàng"
                onPress={() => {
                  Alert.alert(
                    'Xác nhận dọn giỏ hàng',
                    'Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?',
                    [
                      { text: 'Hủy', style: 'cancel' },
                      {
                        text: 'Dọn sạch',
                        style: 'destructive',
                        onPress: () => void clearCart(),
                      },
                    ]
                  );
                }}
              />
            </View>
          </View>
        </ScrollView>
      </ScreenState>
    </View>
  );
}
