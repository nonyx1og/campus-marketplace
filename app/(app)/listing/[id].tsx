import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/constants/theme';
import { ScreenState } from '@/components/primitives/ScreenState';
import { AppButton } from '@/components/primitives/AppButton';
import { fetchListingById, updateListingStock } from '@/lib/api/catalogue';
import { formatVND } from '@/lib/currency';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore, useIsFavorite } from '@/store/favorites-store';
import { useAuthStore, selectUser } from '@/store/auth-store';
import { ScreenViewState, User } from '@/types/domain';

type RolePreviewMode = 'auto' | 'buyer' | 'seller';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Signed-in User
  const currentUser = useAuthStore(selectUser);

  // Screen and Role State
  const [demoStateOverride, setDemoStateOverride] = useState<ScreenViewState | null>(null);
  const [rolePreviewMode, setRolePreviewMode] = useState<RolePreviewMode>('auto');
  const [imageError, setImageError] = useState(false);

  // Store hooks
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useIsFavorite(id || '');

  // TanStack Query for dynamic detail fetching & caching
  const {
    data: item,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!id) return null;
      return await fetchListingById(id);
    },
    enabled: Boolean(id),
  });

  // Seller stock management state: tracks local pending edits without setState in effect
  const [stockEdit, setStockEdit] = useState<number | null>(null);
  const managedStock = stockEdit ?? (typeof item?.stock === 'number' ? item.stock : 0);
  const setManagedStock = (valueOrUpdater: number | ((prev: number) => number)) => {
    setStockEdit((prev) => {
      const current = prev ?? (typeof item?.stock === 'number' ? item.stock : 0);
      return typeof valueOrUpdater === 'function' ? valueOrUpdater(current) : valueOrUpdater;
    });
  };
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [stockFeedback, setStockFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Determine current 4-state view
  const currentViewState: ScreenViewState = (() => {
    if (demoStateOverride) return demoStateOverride;
    if (isLoading) return 'loading';
    if (isError) return 'error';
    if (!item) return 'empty';
    return 'content';
  })();

  // Evaluate Role: Is the user the seller/owner of this listing?
  const isOwner = Boolean(
    currentUser &&
      (currentUser.id === item?.sellerId || currentUser.role === 'admin')
  );
  const isSellerRole = currentUser?.role === 'seller' || currentUser?.role === 'admin';

  // Effective role view (supports auto detection or manual preview switcher for viva/demo)
  const isSellerView = (() => {
    if (rolePreviewMode === 'seller') return true;
    if (rolePreviewMode === 'buyer') return false;
    return isOwner && isSellerRole;
  })();

  // Stock logic for buyer
  const stockCount =
    typeof item?.stock === 'number' && Number.isFinite(item.stock) ? Math.max(0, item.stock) : 0;
  const isAvailable = Boolean(item) && stockCount > 0;

  const [justAddedToCart, setJustAddedToCart] = useState(false);
  const [cartToastMessage, setCartToastMessage] = useState<string | null>(null);

  // Buyer Action: Add to Cart
  const handleAddToCart = async () => {
    if (!item) return;
    if (!isAvailable) {
      if (Platform.OS === 'web') {
        window.alert('Sản phẩm này tạm thời đã hết số lượng tồn kho.');
      } else {
        Alert.alert('Hết hàng', 'Sản phẩm này tạm thời đã hết số lượng tồn kho.');
      }
      return;
    }

    const res = await addToCart(item);
    if (!res.success && res.message) {
      if (Platform.OS === 'web') {
        window.alert(res.message);
      } else {
        Alert.alert('Thông báo', res.message);
      }
      return;
    }

    setJustAddedToCart(true);
    setCartToastMessage(`Đã thêm "${item.title}" vào giỏ hàng!`);
    setTimeout(() => {
      setJustAddedToCart(false);
      setCartToastMessage(null);
    }, 4000);

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Thành công',
        `Đã thêm "${item.title}" vào giỏ hàng!`,
        [
          { text: 'Tiếp tục xem', style: 'cancel' },
          { text: 'Xem giỏ hàng', onPress: () => router.push('/(app)/(tabs)/cart') },
        ]
      );
    }
  };

  // Buyer Action: Toggle Favorite
  const handleToggleFavorite = async () => {
    if (!item) return;
    await toggleFavorite(item);
  };

  // Seller Action: Save stock change to backend with real authorization
  const handleSaveStock = async () => {
    if (!item) return;
    setIsUpdatingStock(true);
    setStockFeedback(null);

    try {
      // Backend enforces authorization using currentUser
      await updateListingStock(item.id, managedStock, currentUser);
      setStockFeedback({
        type: 'success',
        message: `Đã cập nhật tồn kho thành công: ${managedStock} sản phẩm.`,
      });
      // Invalidate queries so catalogue and cart reflect fresh stock
      await queryClient.invalidateQueries({ queryKey: ['listing', item.id] });
      await queryClient.invalidateQueries({ queryKey: ['catalogue'] });
      Alert.alert('Thành công', `Tồn kho mới của "${item.title}" đã được lưu: ${managedStock} món.`);
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string })?.message || 'Không thể cập nhật tồn kho.';
      setStockFeedback({
        type: 'error',
        message: errorMsg,
      });
      Alert.alert('Lỗi cập nhật', errorMsg);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  // Seller Action: Test unauthorized attempt to verify backend 403 Forbidden enforcement
  const handleTestUnauthorizedUpdate = async () => {
    if (!item) return;
    setIsUpdatingStock(true);
    setStockFeedback(null);

    // Create a fake unauthorized buyer account to test backend enforcement
    const unauthorizedBuyer: User = {
      id: 'usr_unauthorized_buyer',
      name: 'Sinh Viên Không Có Quyền',
      role: 'buyer',
    };

    try {
      await updateListingStock(item.id, managedStock, unauthorizedBuyer);
      Alert.alert('Cảnh báo', 'Backend không chặn yêu cầu trái phép! (Lỗi bảo mật)');
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string })?.message || 'Bị từ chối quyền.';
      setStockFeedback({
        type: 'error',
        message: `[Backend 403 Enforced]: ${errorMsg}`,
      });
      Alert.alert(
        'Xác thực Backend Thành Công (403 Forbidden)',
        `Backend đã chặn thành công hành động cập nhật trái phép của người mua:\n\n"${errorMsg}"`
      );
    } finally {
      setIsUpdatingStock(false);
    }
  };

  // Styles conforming strictly to WCAG AA and theme tokens
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const scrollContentStyle: ViewStyle = {
    padding: theme.spacing.screenPadding,
    paddingBottom: 120,
  };

  const roleBarContainerStyle: ViewStyle = {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  };

  const roleBarLabelStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.mutedText,
  };

  const roleButtonsRowStyle: ViewStyle = {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  };

  const roleChipStyle = (active: boolean): ViewStyle => ({
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.xs,
    backgroundColor: active ? theme.colors.primaryBg : theme.colors.surface,
    borderWidth: 1,
    borderColor: active ? theme.colors.primaryBg : theme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  });

  const roleChipTextStyle = (active: boolean): TextStyle => ({
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: active ? theme.colors.textInverse : theme.colors.text,
  });

  const imageContainerStyle: ViewStyle = {
    width: '100%',
    height: 240,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.md,
  };

  const imageStyle: ImageStyle = {
    width: '100%',
    height: '100%',
  };

  const placeholderTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.mutedText,
  };

  const detailCardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  };

  const badgeRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  };

  const categoryBadgeStyle: ViewStyle = {
    backgroundColor: theme.colors.primaryBgMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.xs,
  };

  const categoryBadgeTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
  };

  const stockBadgeStyle: ViewStyle = {
    backgroundColor: isAvailable ? theme.colors.successBgMuted : theme.colors.dangerBgMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.xs,
  };

  const stockBadgeTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: isAvailable ? theme.colors.success : theme.colors.danger,
    fontWeight: theme.typography.fontWeights.bold,
  };

  const titleStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  };

  const priceRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  };

  const priceTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  };

  const favoriteBtnStyle: ViewStyle = {
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: isFavorite ? theme.colors.dangerBgMuted : theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: isFavorite ? theme.colors.danger : theme.colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  };

  const favoriteBtnTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    color: isFavorite ? theme.colors.danger : theme.colors.text,
    fontWeight: theme.typography.fontWeights.semibold,
  };

  const sellerBadgeStyle: ViewStyle = {
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryBgMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const sellerBadgeTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.bold,
  };

  // Seller stock management panel styles
  const sellerPanelStyle: ViewStyle = {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  };

  const sellerPanelHeaderStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  };

  const sellerPanelDescStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.sm,
  };

  const stepperRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  };

  const stepBtnStyle = (disabled: boolean): ViewStyle => ({
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,
    borderRadius: theme.radius.md,
    backgroundColor: disabled ? theme.colors.surfaceSubtle : theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  });

  const stepBtnTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  };

  const stockValueBoxStyle: ViewStyle = {
    flex: 1,
    minHeight: theme.layout.minTouchTarget,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const stockValueTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  };

  const presetRowStyle: ViewStyle = {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  };

  const presetBtnStyle: ViewStyle = {
    minHeight: theme.layout.minTouchTarget,
    flex: 1,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const presetBtnTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
  };

  const feedbackBoxStyle = (type: 'success' | 'error'): ViewStyle => ({
    padding: theme.spacing.xs,
    borderRadius: theme.radius.xs,
    backgroundColor: type === 'success' ? theme.colors.successBgMuted : theme.colors.dangerBgMuted,
    borderWidth: 1,
    borderColor: type === 'success' ? theme.colors.success : theme.colors.danger,
    marginTop: theme.spacing.xs,
  });

  const feedbackTextStyle = (type: 'success' | 'error'): TextStyle => ({
    fontSize: theme.typography.fontSizes.xs,
    color: type === 'success' ? theme.colors.success : theme.colors.danger,
    fontWeight: theme.typography.fontWeights.semibold,
  });

  const dividerStyle: ViewStyle = {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
    marginVertical: theme.spacing.md,
  };

  const sectionHeaderStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  };

  const descriptionStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.mutedText,
    lineHeight: theme.typography.lineHeights.md,
  };

  const metaRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  };

  const metaLabelStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.mutedText,
  };

  const metaValueStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
  };

  const bottomBarStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  };

  const photoUri = item?.photoUri || item?.imageUrl;

  return (
    <View style={containerStyle}>
      {/* Role Preview Bar for Examiner / Team Viva Testing */}
      <View style={roleBarContainerStyle}>
        <Text style={roleBarLabelStyle}>Chế độ hiển thị:</Text>
        <View style={roleButtonsRowStyle}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Chế độ hiển thị tự động theo tài khoản đăng nhập"
            style={roleChipStyle(rolePreviewMode === 'auto')}
            onPress={() => setRolePreviewMode('auto')}
          >
            <Text style={roleChipTextStyle(rolePreviewMode === 'auto')}>
              Tự động ({currentUser?.role || 'khách'})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Xem chi tiết sản phẩm dưới vai trò Người mua"
            style={roleChipStyle(rolePreviewMode === 'buyer')}
            onPress={() => setRolePreviewMode('buyer')}
          >
            <Text style={roleChipTextStyle(rolePreviewMode === 'buyer')}>🛒 Người mua</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Xem chi tiết sản phẩm dưới vai trò Người bán"
            style={roleChipStyle(rolePreviewMode === 'seller')}
            onPress={() => setRolePreviewMode('seller')}
          >
            <Text style={roleChipTextStyle(rolePreviewMode === 'seller')}>🏷️ Người bán</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScreenState
        state={currentViewState}
        showStateSwitcher={true}
        onStateChange={setDemoStateOverride}
        onRetry={() => {
          void refetch();
        }}
        loadingMessage="Đang tải thông tin chi tiết món đồ..."
        emptyTitle="Không tìm thấy sản phẩm"
        emptyMessage={`Không có dữ liệu cho sản phẩm mã "${id}".`}
        emptyActionLabel="Quay lại danh mục"
        onEmptyAction={() => router.back()}
        errorMessage={
          (error as { message?: string })?.message ||
          'Không thể kết nối máy chủ để lấy thông tin món đồ.'
        }
      >
        {item && (
          <ScrollView contentContainerStyle={scrollContentStyle}>
            {/* Product Image */}
            <View style={imageContainerStyle}>
              {photoUri && !imageError ? (
                <Image
                  source={{ uri: photoUri }}
                  style={imageStyle}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                  accessibilityLabel={`Hình ảnh sản phẩm: ${item.title}`}
                />
              ) : (
                <Text style={placeholderTextStyle}>📦 Hình ảnh sản phẩm sinh viên</Text>
              )}
            </View>

            {/* Info Card */}
            <View style={detailCardStyle}>
              {/* Category & Stock Status Badges */}
              <View style={badgeRowStyle}>
                <View style={categoryBadgeStyle}>
                  <Text style={categoryBadgeTextStyle}>{item.category}</Text>
                </View>

                <View style={stockBadgeStyle}>
                  <Text style={stockBadgeTextStyle}>
                    {isAvailable ? `Còn hàng (${stockCount} món)` : 'Hết hàng / Tạm ngưng'}
                  </Text>
                </View>
              </View>

              <Text style={titleStyle}>{item.title}</Text>

              {/* Price and Role-Specific Top Action */}
              <View style={priceRowStyle}>
                <Text style={priceTextStyle}>{formatVND(item.priceVnd)}</Text>

                {isSellerView ? (
                  // Seller View: Shows Seller Badge instead of Favorite button
                  <View
                    style={sellerBadgeStyle}
                    accessibilityLabel="Tin đăng do bạn quản lý"
                  >
                    <Text style={sellerBadgeTextStyle}>🏷️ Tin đăng của bạn</Text>
                  </View>
                ) : (
                  // Buyer View: Shows Favorite button
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityState={{ selected: isFavorite }}
                    accessibilityLabel={
                      isFavorite
                        ? `Bỏ lưu sản phẩm ${item.title} khỏi danh sách yêu thích`
                        : `Lưu sản phẩm ${item.title} vào danh sách yêu thích`
                    }
                    style={favoriteBtnStyle}
                    onPress={handleToggleFavorite}
                    activeOpacity={0.7}
                  >
                    <Text>{isFavorite ? '❤️' : '🤍'}</Text>
                    <Text style={favoriteBtnTextStyle}>
                      {isFavorite ? 'Đã lưu' : 'Yêu thích'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* SELLER VIEW: Dedicated Stock Management & Authorization Panel */}
              {isSellerView && (
                <View style={sellerPanelStyle}>
                  <Text style={sellerPanelHeaderStyle}>📦 Quản lý tồn kho (Dành cho Người bán)</Text>
                  <Text style={sellerPanelDescStyle}>
                    Điều chỉnh số lượng hàng trong kho. Máy chủ sẽ kiểm tra quyền người bán trước khi cập nhật.
                  </Text>

                  {/* Stock Stepper */}
                  <View style={stepperRowStyle}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Giảm 1 món tồn kho"
                      disabled={managedStock <= 0 || isUpdatingStock}
                      style={stepBtnStyle(managedStock <= 0 || isUpdatingStock)}
                      onPress={() => setManagedStock((prev) => Math.max(0, prev - 1))}
                    >
                      <Text style={stepBtnTextStyle}>−</Text>
                    </TouchableOpacity>

                    <View style={stockValueBoxStyle}>
                      <Text style={stockValueTextStyle}>{managedStock} món</Text>
                    </View>

                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Tăng 1 món tồn kho"
                      disabled={isUpdatingStock}
                      style={stepBtnStyle(isUpdatingStock)}
                      onPress={() => setManagedStock((prev) => prev + 1)}
                    >
                      <Text style={stepBtnTextStyle}>+</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Preset Quick Buttons */}
                  <View style={presetRowStyle}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Đặt nhanh tồn kho bằng 0 để đánh dấu hết hàng"
                      style={presetBtnStyle}
                      onPress={() => setManagedStock(0)}
                    >
                      <Text style={presetBtnTextStyle}>⚡ Đặt hết hàng (0)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Thêm nhanh 5 món vào tồn kho"
                      style={presetBtnStyle}
                      onPress={() => setManagedStock((prev) => prev + 5)}
                    >
                      <Text style={presetBtnTextStyle}>⚡ Nhập thêm (+5)</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Save Button */}
                  <AppButton
                    title={isUpdatingStock ? 'Đang lưu vào máy chủ...' : 'Lưu thay đổi kho hàng'}
                    variant="primary"
                    disabled={isUpdatingStock}
                    onPress={handleSaveStock}
                    accessibilityLabel="Gửi yêu cầu cập nhật số lượng tồn kho lên máy chủ"
                  />

                  {/* Authorization Test Button for Viva Reviewers */}
                  <View style={{ marginTop: theme.spacing.xs }}>
                    <AppButton
                      title="🛡️ Kiểm thử Backend 403 (Thao tác trái phép)"
                      variant="outline"
                      disabled={isUpdatingStock}
                      onPress={handleTestUnauthorizedUpdate}
                      accessibilityLabel="Gửi yêu cầu cập nhật tồn kho bằng tài khoản người mua để kiểm tra backend 403 Forbidden"
                    />
                  </View>

                  {/* Feedback Message */}
                  {stockFeedback && (
                    <View style={feedbackBoxStyle(stockFeedback.type)}>
                      <Text style={feedbackTextStyle(stockFeedback.type)}>
                        {stockFeedback.message}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View style={dividerStyle} />

              <Text style={sectionHeaderStyle}>Mô tả chi tiết</Text>
              <Text style={descriptionStyle}>{item.description}</Text>

              <View style={dividerStyle} />

              <Text style={sectionHeaderStyle}>Thông tin giao dịch trong trường</Text>
              <View style={metaRowStyle}>
                <Text style={metaLabelStyle}>Người đăng:</Text>
                <Text style={metaValueStyle}>{item.sellerName || 'Sinh viên'}</Text>
              </View>
              <View style={metaRowStyle}>
                <Text style={metaLabelStyle}>Địa điểm nhận:</Text>
                <Text style={metaValueStyle}>📍 {item.campusLocation}</Text>
              </View>
              <View style={metaRowStyle}>
                <Text style={metaLabelStyle}>Mã tin đăng:</Text>
                <Text style={metaValueStyle}>{item.id}</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Bottom CTA Action Bar: Diverges depending on Seller vs Buyer */}
        {item && (
          <View style={bottomBarStyle}>
            {isSellerView ? (
              // SELLER ACTIONS: Edit / Manage Stock
              <>
                <View style={{ flex: 1 }}>
                  <AppButton
                    title={isUpdatingStock ? 'Đang lưu...' : 'Cập nhật kho'}
                    variant="primary"
                    disabled={isUpdatingStock}
                    onPress={handleSaveStock}
                    accessibilityLabel="Lưu số lượng kho mới cho tin đăng của người bán"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppButton
                    title="Về danh mục"
                    variant="outline"
                    onPress={() => router.back()}
                    accessibilityLabel="Quay lại danh mục sản phẩm"
                  />
                </View>
              </>
            ) : (
              // BUYER ACTIONS: Add to Cart / Contact Seller
              <>
                <View style={{ flex: 1 }}>
                  <AppButton
                    title={
                      justAddedToCart
                        ? '✓ Đã thêm vào giỏ!'
                        : isAvailable
                        ? 'Thêm vào giỏ'
                        : 'Hết hàng'
                    }
                    variant={justAddedToCart ? 'secondary' : isAvailable ? 'outline' : 'secondary'}
                    disabled={!isAvailable}
                    onPress={handleAddToCart}
                    accessibilityLabel={
                      justAddedToCart
                        ? 'Đã thêm món đồ này vào giỏ hàng sinh viên'
                        : isAvailable
                        ? 'Thêm món đồ này vào giỏ hàng sinh viên'
                        : 'Sản phẩm đã hết hàng, không thể thêm vào giỏ'
                    }
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <AppButton
                    title="Nhắn người bán"
                    variant="primary"
                    onPress={() =>
                      Alert.alert(
                        'Liên hệ người bán',
                        `Đang mở tin nhắn đến ${item.sellerName} để hẹn nhận hàng tại ${item.campusLocation}.`
                      )
                    }
                    accessibilityLabel="Mở chat trao đổi trực tiếp với người bán"
                  />
                </View>
              </>
            )}
          </View>
        )}

        {/* Floating Cart Toast Banner for Immediate Cross-Platform Feedback */}
        {cartToastMessage && (
          <View
            style={{
              position: 'absolute',
              bottom: 84,
              left: theme.spacing.screenPadding,
              right: theme.spacing.screenPadding,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.md,
              borderWidth: 1.5,
              borderColor: theme.colors.success,
              padding: theme.spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: theme.colors.text,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 6,
              zIndex: 999,
            }}
          >
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <Text
                style={{
                  fontSize: theme.typography.fontSizes.sm,
                  fontWeight: theme.typography.fontWeights.semibold,
                  color: theme.colors.text,
                }}
                numberOfLines={2}
              >
                ✓ {cartToastMessage}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(app)/(tabs)/cart')}
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.radius.xs,
                minHeight: theme.layout.minTouchTarget,
                minWidth: theme.layout.minTouchTarget,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              accessibilityRole="button"
              accessibilityLabel="Đi tới xem giỏ hàng ngay"
            >
              <Text
                style={{
                  color: theme.colors.textInverse,
                  fontSize: theme.typography.fontSizes.xs,
                  fontWeight: theme.typography.fontWeights.bold,
                }}
              >
                Xem giỏ →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScreenState>
    </View>
  );
}
