import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ImageStyle,
  GestureResponderEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { ListingItem } from '@/types/listing';
import { formatVND } from '@/lib/currency';
import { FavoriteToggleButton } from '@/components/favorites';
import { useCartStore } from '@/store/cart-store';

export interface CatalogueCardProps {
  item: ListingItem;
}

export const CatalogueCard: React.FC<CatalogueCardProps> = ({ item }) => {
  const router = useRouter();
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const isAvailable = (item.stock ?? 1) > 0;
  const stockText = isAvailable
    ? `Còn hàng: ${item.stock ?? 1}`
    : 'Hết hàng';

  const handleQuickAddToCart = async (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    await addToCart(item);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.md,
  };

  const imageContainerStyle: ViewStyle = {
    width: '100%',
    height: 180,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceSubtle,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  };

  const favoriteOverlayStyle: ViewStyle = {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    zIndex: 10,
  };

  const imageStyle: ImageStyle = {
    width: '100%',
    height: '100%',
  };

  const fallbackTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.mutedText,
  };

  const headerRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  };

  const categoryBadgeStyle: ViewStyle = {
    backgroundColor: theme.colors.primaryBgMuted,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.xs,
  };

  const categoryTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  };

  const stockBadgeStyle: ViewStyle = {
    backgroundColor: isAvailable
      ? theme.colors.successBgMuted
      : theme.colors.dangerBgMuted,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.xs,
  };

  const stockTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: isAvailable ? theme.colors.success : theme.colors.danger,
    fontWeight: theme.typography.fontWeights.semibold,
  };

  const titleStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xxs,
  };

  const descriptionStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.sm,
  };

  const footerRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    paddingTop: theme.spacing.xs,
  };

  const priceStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  };

  const locationStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.mutedText,
  };

  const quickAddBtnStyle: ViewStyle = {
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.sm,
    backgroundColor: justAdded
      ? theme.colors.successBgMuted
      : isAvailable
      ? theme.colors.surfaceSubtle
      : theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: justAdded
      ? theme.colors.success
      : isAvailable
      ? theme.colors.primary
      : theme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const quickAddTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    color: justAdded
      ? theme.colors.success
      : isAvailable
      ? theme.colors.primary
      : theme.colors.mutedText,
  };

  const photoUrl = item.photoUri || item.imageUrl;

  return (
    <TouchableOpacity
      accessibilityRole="link"
      accessibilityLabel={`Sản phẩm: ${item.title}, Giá: ${formatVND(item.priceVnd)}, ${stockText}, Địa điểm: ${item.campusLocation}`}
      style={cardStyle}
      onPress={() => router.push(`/(app)/listing/${item.id}`)}
      activeOpacity={0.75}
    >
      {/* Product Image & Favorite Toggle */}
      <View style={imageContainerStyle}>
        {photoUrl && !imageError ? (
          <Image
            source={{ uri: photoUrl }}
            style={imageStyle}
            resizeMode="cover"
            onError={() => setImageError(true)}
            accessibilityLabel={`Ảnh sản phẩm: ${item.title}`}
          />
        ) : (
          <Text style={fallbackTextStyle}>📦 Ảnh minh họa</Text>
        )}

        <View style={favoriteOverlayStyle}>
          <FavoriteToggleButton listingId={item.id} listingTitle={item.title} />
        </View>
      </View>

      {/* Badges: Category & Stock/Availability */}
      <View style={headerRowStyle}>
        <View style={categoryBadgeStyle}>
          <Text style={categoryTextStyle}>{item.category}</Text>
        </View>

        <View style={stockBadgeStyle}>
          <Text style={stockTextStyle}>{stockText}</Text>
        </View>
      </View>

      {/* Title & Description */}
      <Text style={titleStyle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={descriptionStyle} numberOfLines={2}>
        {item.description}
      </Text>

      {/* Footer: Price, Campus Location & Quick Add Button */}
      <View style={footerRowStyle}>
        <View style={{ flex: 1, paddingRight: theme.spacing.xs }}>
          <Text style={priceStyle}>{formatVND(item.priceVnd)}</Text>
          <Text style={locationStyle}>📍 {item.campusLocation}</Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            isAvailable
              ? `Thêm nhanh ${item.title} vào giỏ hàng`
              : `Sản phẩm ${item.title} đã hết hàng`
          }
          onPress={handleQuickAddToCart}
          disabled={!isAvailable}
          style={quickAddBtnStyle}
          activeOpacity={0.7}
        >
          <Text style={quickAddTextStyle}>
            {justAdded ? '✓ Đã thêm' : isAvailable ? '+ Giỏ' : 'Hết'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};


export default CatalogueCard;
