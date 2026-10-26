import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { ScreenState } from '@/components/primitives/ScreenState';
import {
  useFavoritesStore,
  selectFavorites,
  selectIsFavoritesHydrated,
} from '@/store/favorites-store';
import { formatVND } from '@/lib/currency';
import { ScreenViewState } from '@/types/domain';

export default function FavoritesScreen() {
  const router = useRouter();
  const theme = useTheme();

  const favorites = useFavoritesStore(selectFavorites);
  const isHydrated = useFavoritesStore(selectIsFavoritesHydrated);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const hydrateFavorites = useFavoritesStore((state) => state.hydrateFavorites);

  useEffect(() => {
    if (!isHydrated) {
      void hydrateFavorites();
    }
  }, [isHydrated, hydrateFavorites]);

  const viewState: ScreenViewState = !isHydrated
    ? 'loading'
    : favorites.length === 0
    ? 'empty'
    : 'content';

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

  const itemTitleStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xxs,
  };

  const priceTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xxs,
  };

  const locationTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.mutedText,
  };

  const removeBtnStyle: ViewStyle = {
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.dangerBgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const removeBtnTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.danger,
    fontWeight: theme.typography.fontWeights.semibold,
  };

  return (
    <View style={containerStyle}>
      <ScreenState
        state={viewState}
        loadingMessage="Đang tải danh sách đồ dùng đã lưu..."
        emptyTitle="Chưa có sản phẩm yêu thích"
        emptyMessage="Bạn chưa lưu tin đăng nào. Hãy dạo quanh mục Sản phẩm để tìm món đồ phù hợp."
        emptyActionLabel="Khám phá chợ ngay"
        onEmptyAction={() => router.push('/(app)/(tabs)/')}
      >
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={listContentStyle}
          renderItem={({ item }) => (
            <View style={cardStyle}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Xem chi tiết sản phẩm yêu thích: ${item.title}`}
                style={{ flex: 1, marginRight: theme.spacing.sm }}
                onPress={() => router.push(`/(app)/listing/${item.id}`)}
              >
                <Text style={itemTitleStyle}>{item.title}</Text>
                <Text style={priceTextStyle}>{formatVND(item.priceVnd)}</Text>
                <Text style={locationTextStyle}>📍 {item.campusLocation}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Bỏ thích sản phẩm ${item.title}`}
                style={removeBtnStyle}
                onPress={() => void removeFavorite(item.id)}
              >
                <Text style={removeBtnTextStyle}>Bỏ lưu</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </ScreenState>
    </View>
  );
}
