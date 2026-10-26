import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/constants/theme';
import { ScreenState } from '@/components/primitives/ScreenState';
import { AppButton } from '@/components/primitives/AppButton';
import { fetchListingById } from '@/lib/api/catalogue';
import { formatVND } from '@/lib/currency';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore, selectIsFavorite } from '@/store/favorites-store';
import { ScreenViewState } from '@/types/domain';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [demoStateOverride, setDemoStateOverride] = useState<ScreenViewState | null>(null);
  const [imageError, setImageError] = useState(false);

  // Store hooks
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore(selectIsFavorite(id || ''));

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

  // Determine current 4-state view
  const currentViewState: ScreenViewState = (() => {
    if (demoStateOverride) return demoStateOverride;
    if (isLoading) return 'loading';
    if (isError) return 'error';
    if (!item) return 'empty';
    return 'content';
  })();

  const isAvailable = Boolean(item && (item.stock ?? 1) > 0);
  const stockCount = item?.stock ?? 1;

  const handleAddToCart = () => {
    if (!item) return;
    if (!isAvailable) {
      Alert.alert('Hết hàng', 'Sản phẩm này tạm thời đã hết số lượng tồn kho.');
      return;
    }

    addToCart(item);
    Alert.alert(
      'Thành công',
      `Đã thêm "${item.title}" vào giỏ hàng!`,
      [
        { text: 'Tiếp tục xem', style: 'cancel' },
        { text: 'Xem giỏ hàng', onPress: () => router.push('/(app)/(tabs)/cart') },
      ]
    );
  };

  const handleToggleFavorite = async () => {
    if (!item) return;
    await toggleFavorite(item);
  };

  // Styles conforming strictly to WCAG AA and theme tokens
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const scrollContentStyle: ViewStyle = {
    padding: theme.spacing.screenPadding,
    paddingBottom: 110,
  };

  const imageContainerStyle: ViewStyle = {
    width: '100%',
    height: 260,
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

              {/* Price and Favorite Button */}
              <View style={priceRowStyle}>
                <Text style={priceTextStyle}>{formatVND(item.priceVnd)}</Text>

                <TouchableOpacity
                  accessibilityRole="button"
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
              </View>

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

        {/* Bottom CTA Action Bar */}
        {item && (
          <View style={bottomBarStyle}>
            <View style={{ flex: 1 }}>
              <AppButton
                title={isAvailable ? 'Thêm vào giỏ' : 'Hết hàng'}
                variant={isAvailable ? 'outline' : 'secondary'}
                disabled={!isAvailable}
                onPress={handleAddToCart}
                accessibilityLabel={
                  isAvailable
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
          </View>
        )}
      </ScreenState>
    </View>
  );
}
