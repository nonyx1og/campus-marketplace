import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { ListingItem } from '@/types/listing';
import { formatVND } from '@/lib/currency';

export interface CatalogueCardProps {
  item: ListingItem;
}

export const CatalogueCard: React.FC<CatalogueCardProps> = ({ item }) => {
  const router = useRouter();
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);

  const isAvailable = (item.stock ?? 1) > 0;
  const stockText = isAvailable
    ? `Còn hàng: ${item.stock ?? 1}`
    : 'Hết hàng';

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

  const photoUrl = item.photoUri || item.imageUrl;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Sản phẩm: ${item.title}, Giá: ${formatVND(item.priceVnd)}, ${stockText}, Địa điểm: ${item.campusLocation}`}
      style={cardStyle}
      onPress={() => router.push(`/(app)/listing/${item.id}`)}
      activeOpacity={0.75}
    >
      {/* Product Image */}
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

      {/* Footer: Price & Campus Location */}
      <View style={footerRowStyle}>
        <Text style={priceStyle}>{formatVND(item.priceVnd)}</Text>
        <Text style={locationStyle}>📍 {item.campusLocation}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CatalogueCard;
