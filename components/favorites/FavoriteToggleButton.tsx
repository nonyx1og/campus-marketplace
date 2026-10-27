import React from 'react';
import {
  TouchableOpacity,
  Text,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';
import { useFavoritesStore, useIsFavorite } from '@/store/favorites-store';

export interface FavoriteToggleButtonProps {
  listingId: string;
  listingTitle: string;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  onToggled?: (isFavorite: boolean) => void;
}

/**
 * Accessible Favorite Toggle Button component.
 *
 * Requirements satisfied:
 * - Subscribes to fine-grained `useIsFavorite(listingId)` selector (no unwanted re-renders).
 * - Minimum touch target >= 44x44 for WCAG AA compliance (`theme.layout.minTouchTarget`).
 * - Dynamic `accessibilityLabel` that updates when favorite state changes.
 * - Dynamic `accessibilityState={{ selected: isFavorite }}`.
 * - Stops event propagation so card navigation is not triggered when toggling in a card.
 * - Conforms to theme token system (no hard-coded hex colors).
 */
export const FavoriteToggleButton: React.FC<FavoriteToggleButtonProps> = ({
  listingId,
  listingTitle,
  variant = 'icon',
  style,
  onToggled,
}) => {
  const theme = useTheme();
  const isFavorite = useIsFavorite(listingId);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handlePress = async (e: GestureResponderEvent) => {
    // Prevent bubbling to parent TouchableOpacity (e.g. CatalogueCard)
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    await toggleFavorite(listingId);
    onToggled?.(!isFavorite);
  };

  const dynamicLabel = isFavorite
    ? `Bỏ lưu sản phẩm ${listingTitle} khỏi danh sách yêu thích`
    : `Lưu sản phẩm ${listingTitle} vào danh sách yêu thích`;

  if (variant === 'button') {
    const buttonStyle: ViewStyle = {
      minHeight: theme.layout.minTouchTarget,
      minWidth: theme.layout.minTouchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      backgroundColor: isFavorite ? theme.colors.dangerBgMuted : theme.colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: isFavorite ? theme.colors.danger : theme.colors.borderSubtle,
      gap: theme.spacing.xs,
    };

    const textStyle: TextStyle = {
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: theme.typography.fontWeights.semibold,
      color: isFavorite ? theme.colors.danger : theme.colors.text,
    };

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={dynamicLabel}
        accessibilityState={{ selected: isFavorite }}
        style={[buttonStyle, style]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={18}
          color={isFavorite ? theme.colors.danger : theme.colors.mutedText}
        />
        <Text style={textStyle}>{isFavorite ? 'Đã lưu' : 'Yêu thích'}</Text>
      </TouchableOpacity>
    );
  }

  // Circular icon variant (e.g. overlay on CatalogueCard)
  const iconButtonStyle: ViewStyle = {
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,
    width: theme.layout.minTouchTarget,
    height: theme.layout.minTouchTarget,
    borderRadius: theme.layout.minTouchTarget / 2,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isFavorite ? theme.colors.danger : theme.colors.borderSubtle,
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={dynamicLabel}
      accessibilityState={{ selected: isFavorite }}
      style={[iconButtonStyle, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={22}
        color={isFavorite ? theme.colors.danger : theme.colors.mutedText}
      />
    </TouchableOpacity>
  );
};

export default FavoriteToggleButton;
