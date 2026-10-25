import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenStateView } from '@/components/common/ScreenStateView';
import { Tokens } from '@/constants/tokens';
import { ListingItem, ScreenViewState } from '@/types/listing';
import { formatVND } from '@/lib/currency';

const MOCK_FAVORITES: ListingItem[] = [
  {
    id: 'prod-101',
    title: 'Giáo trình Giải tích 1 & 2 (Kèm bài tập)',
    description: 'Sách còn mới 95%, có ghi chú các dạng đề thi cuối kỳ hay ra.',
    priceVnd: 75000,
    category: 'Sách giáo trình',
    sellerId: 'usr-002',
    sellerName: 'Lê Hoàng Nam',
    campusLocation: 'Khu A - Toà Nhà Thư Viện',
    createdAt: '2026-10-24T10:00:00Z',
  },
];

export default function FavoritesScreen() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ScreenViewState>('content');
  const [favorites, setFavorites] = useState<ListingItem[]>(MOCK_FAVORITES);

  const handleRetry = () => {
    setViewState('content');
    setFavorites(MOCK_FAVORITES);
  };

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((item) => item.id !== id);
    setFavorites(updated);
    if (updated.length === 0) {
      setViewState('empty');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenStateView
        state={viewState}
        onRetry={handleRetry}
        onStateChange={setViewState}
        loadingMessage="Đang tải danh sách đồ dùng đã lưu..."
        emptyTitle="Chưa có sản phẩm yêu thích"
        emptyMessage="Bạn chưa lưu tin đăng nào. Hãy dạo quanh mục Sản phẩm để tìm món đồ phù hợp."
        errorMessage="Không thể tải danh sách yêu thích. Vui lòng thử lại."
      >
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Xem chi tiết sản phẩm yêu thích: ${item.title}`}
                style={styles.cardContent}
                onPress={() => router.push(`/(app)/listing/${item.id}`)}
              >
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.priceText}>{formatVND(item.priceVnd)}</Text>
                <Text style={styles.locationText}>📍 {item.campusLocation}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Bỏ thích sản phẩm ${item.title}`}
                style={styles.removeBtn}
                onPress={() => removeFavorite(item.id)}
              >
                <Text style={styles.removeBtnText}>Bỏ lưu</Text>
              </TouchableOpacity>
            </View>
          )}
        />
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
  cardContent: {
    flex: 1,
    marginRight: Tokens.spacing.sm,
  },
  itemTitle: {
    fontSize: Tokens.typography.fontSizes.md,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.textPrimary,
    marginBottom: Tokens.spacing.xxs,
  },
  priceText: {
    fontSize: Tokens.typography.fontSizes.md,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.primary,
    marginBottom: Tokens.spacing.xxs,
  },
  locationText: {
    fontSize: Tokens.typography.fontSizes.xs,
    color: Tokens.colors.textMuted,
  },
  removeBtn: {
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
  removeBtnText: {
    fontSize: Tokens.typography.fontSizes.xs,
    color: Tokens.colors.error,
    fontWeight: Tokens.typography.fontWeights.semibold,
  },
});
