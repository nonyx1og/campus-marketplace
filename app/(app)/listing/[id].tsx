import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScreenStateView } from '@/components/common/ScreenStateView';
import { Button } from '@/components/common/Button';
import { Tokens } from '@/constants/tokens';
import { ListingItem, ScreenViewState } from '@/types/listing';
import { formatVND } from '@/lib/currency';
import { useCartStore } from '@/store/cart-store';

const MOCK_CATALOGUE_MAP: Record<string, ListingItem> = {
  'prod-101': {
    id: 'prod-101',
    title: 'Giáo trình Giải tích 1 & 2 (Kèm bài tập)',
    description:
      'Sách còn mới 95%, có ghi chú các dạng đề thi cuối kỳ hay ra. Tặng kèm tập photo bài giải chi tiết các năm trước.',
    priceVnd: 75000,
    category: 'Sách giáo trình',
    sellerId: 'usr-002',
    sellerName: 'Lê Hoàng Nam (K66 - CNTT)',
    campusLocation: 'Khu A - Toà Nhà Thư Viện',
    createdAt: '2026-10-24T10:00:00Z',
  },
  'prod-102': {
    id: 'prod-102',
    title: 'Máy tính Casio fx-580VN X',
    description:
      'Máy dùng tốt mọi chức năng, còn tem bảo hành chính hãng Bitex. Pin còn dùng tốt, kèm nắp bảo vệ zin.',
    priceVnd: 420000,
    category: 'Thiết bị học tập',
    sellerId: 'usr-003',
    sellerName: 'Trần Thị Mai (K65 - Điện Tử)',
    campusLocation: 'Khu B - Ký túc xá B4',
    createdAt: '2026-10-23T14:30:00Z',
  },
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [demoStateOverride, setDemoStateOverride] = useState<ScreenViewState | null>(null);
  const addToCart = useCartStore((state) => state.addToCart);

  // TanStack Query for dynamic detail fetching & caching
  const {
    data: item,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['listing', id],
    queryFn: async (): Promise<ListingItem | null> => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return id && MOCK_CATALOGUE_MAP[id] ? MOCK_CATALOGUE_MAP[id] : null;
    },
  });

  const currentViewState: ScreenViewState = (() => {
    if (demoStateOverride) return demoStateOverride;
    if (isLoading) return 'loading';
    if (isError) return 'error';
    if (!item) return 'empty';
    return 'content';
  })();

  const handleAddToCart = () => {
    if (!item) return;
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

  return (
    <View style={styles.container}>
      <ScreenStateView
        state={currentViewState}
        onRetry={() => {
          void refetch();
        }}
        onStateChange={setDemoStateOverride}
        loadingMessage="Đang tải thông tin chi tiết sản phẩm..."
        emptyTitle="Không tìm thấy sản phẩm"
        emptyMessage={`Không có dữ liệu cho sản phẩm mang mã "${id}".`}
        errorMessage="Không thể kết nối đến máy chủ để lấy thông tin món đồ."
      >
        {item && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Image Placeholder */}
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>📦</Text>
              <Text style={styles.imagePlaceholderText}>Hình ảnh sản phẩm sinh viên</Text>
            </View>

            {/* Info Card */}
            <View style={styles.detailCard}>
              <View style={styles.badgeRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
                <Text style={styles.dateText}>Mã tin: {item.id}</Text>
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.price}>{formatVND(item.priceVnd)}</Text>

              <View style={styles.divider} />

              <Text style={styles.sectionHeader}>Mô tả chi tiết</Text>
              <Text style={styles.description}>{item.description}</Text>

              <View style={styles.divider} />

              <Text style={styles.sectionHeader}>Thông tin giao dịch trong trường</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Người đăng:</Text>
                <Text style={styles.metaValue}>{item.sellerName}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Địa điểm nhận:</Text>
                <Text style={styles.metaValue}>📍 {item.campusLocation}</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Bottom CTA Action Bar */}
        {item && (
          <View style={styles.bottomBar}>
            <Button
              title="Thêm vào giỏ hàng"
              variant="outline"
              onPress={handleAddToCart}
              accessibilityLabel="Thêm món đồ này vào giỏ hàng sinh viên"
              style={styles.actionBtnHalf}
            />
            <Button
              title="Nhắn người bán"
              variant="primary"
              onPress={() => Alert.alert('Thông báo', 'Đang kết nối hội thoại với người bán...')}
              accessibilityLabel="Mở chat trao đổi trực tiếp với người bán"
              style={styles.actionBtnHalf}
            />
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
  scrollContent: {
    padding: Tokens.spacing.screenPadding,
    paddingBottom: 80,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: Tokens.colors.surfaceSubtle,
    borderRadius: Tokens.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Tokens.colors.borderSubtle,
    marginBottom: Tokens.spacing.md,
  },
  imagePlaceholderIcon: {
    fontSize: 48,
    marginBottom: Tokens.spacing.xs,
  },
  imagePlaceholderText: {
    fontSize: Tokens.typography.fontSizes.sm,
    color: Tokens.colors.textMuted,
  },
  detailCard: {
    backgroundColor: Tokens.colors.surface,
    borderRadius: Tokens.borderRadius.lg,
    padding: Tokens.spacing.lg,
    borderWidth: 1,
    borderColor: Tokens.colors.borderSubtle,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Tokens.spacing.xs,
  },
  categoryBadge: {
    backgroundColor: Tokens.colors.primaryLight,
    paddingHorizontal: Tokens.spacing.xs,
    paddingVertical: Tokens.spacing.xxs,
    borderRadius: Tokens.borderRadius.xs,
  },
  categoryBadgeText: {
    fontSize: Tokens.typography.fontSizes.xs,
    color: Tokens.colors.primaryDark,
    fontWeight: Tokens.typography.fontWeights.medium,
  },
  dateText: {
    fontSize: Tokens.typography.fontSizes.xs,
    color: Tokens.colors.textMuted,
  },
  title: {
    fontSize: Tokens.typography.fontSizes.xl,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.textPrimary,
    marginBottom: Tokens.spacing.xs,
  },
  price: {
    fontSize: Tokens.typography.fontSizes.xxl,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.primary,
    marginBottom: Tokens.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Tokens.colors.borderSubtle,
    marginVertical: Tokens.spacing.md,
  },
  sectionHeader: {
    fontSize: Tokens.typography.fontSizes.md,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.textPrimary,
    marginBottom: Tokens.spacing.xs,
  },
  description: {
    fontSize: Tokens.typography.fontSizes.sm,
    color: Tokens.colors.textSecondary,
    lineHeight: Tokens.typography.lineHeights.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing.xs,
  },
  metaLabel: {
    fontSize: Tokens.typography.fontSizes.sm,
    color: Tokens.colors.textMuted,
  },
  metaValue: {
    fontSize: Tokens.typography.fontSizes.sm,
    fontWeight: Tokens.typography.fontWeights.medium,
    color: Tokens.colors.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Tokens.colors.surface,
    padding: Tokens.spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: Tokens.colors.borderSubtle,
    flexDirection: 'row',
    gap: Tokens.spacing.sm,
  },
  actionBtnHalf: {
    flex: 1,
  },
});
