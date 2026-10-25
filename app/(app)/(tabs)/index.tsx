import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScreenStateView } from '@/components/common/ScreenStateView';
import { Button } from '@/components/common/Button';
import { Tokens } from '@/constants/tokens';
import { ListingItem, ScreenViewState } from '@/types/listing';
import { formatVND } from '@/lib/currency';
import { useAuthStore, selectSignOut, selectUser } from '@/store/auth-store';

// Mock initial dataset for offline catalogue demo
const MOCK_CATALOGUE_ITEMS: ListingItem[] = [
  {
    id: 'prod-101',
    title: 'Giáo trình Giải tích 1 & 2 (Kèm bài tập)',
    description: 'Sách còn mới 95%, có ghi chú các dạng đề thi cuối kỳ hay ra.',
    priceVnd: 75000, // Integer in VND
    category: 'Sách giáo trình',
    sellerId: 'usr-002',
    sellerName: 'Lê Hoàng Nam',
    campusLocation: 'Khu A - Toà Nhà Thư Viện',
    createdAt: '2026-10-24T10:00:00Z',
  },
  {
    id: 'prod-102',
    title: 'Máy tính Casio fx-580VN X',
    description: 'Máy dùng tốt mọi chức năng, còn tem bảo hành chính hãng Bitex.',
    priceVnd: 420000, // Integer in VND
    category: 'Thiết bị học tập',
    sellerId: 'usr-003',
    sellerName: 'Trần Thị Mai',
    campusLocation: 'Khu B - Ký túc xá B4',
    createdAt: '2026-10-23T14:30:00Z',
  },
  {
    id: 'prod-103',
    title: 'Bàn học gấp gọn sinh viên chân sắt',
    description: 'Bàn chân sắt chịu lực tốt, mặt gỗ chống nước, tiện mang đi lại.',
    priceVnd: 90000, // Integer in VND
    category: 'Đồ dùng phòng trọ',
    sellerId: 'usr-004',
    sellerName: 'Võ Minh Quân',
    campusLocation: 'Cổng phụ KTX Khu A',
    createdAt: '2026-10-22T08:15:00Z',
  },
  {
    id: 'prod-104',
    title: 'Bộ vợt cầu lông Yonex Carbon kèm túi',
    description: 'Đã căng cước 10.5kg, phù hợp đánh giải sinh viên và thể dục.',
    priceVnd: 280000, // Integer in VND
    category: 'Thể thao & Giải trí',
    sellerId: 'usr-005',
    sellerName: 'Nguyễn Đăng Khoa',
    campusLocation: 'Nhà thi đấu trường',
    createdAt: '2026-10-21T18:00:00Z',
  },
];

const CATEGORIES = ['Tất cả', 'Sách giáo trình', 'Thiết bị học tập', 'Đồ dùng phòng trọ', 'Thể thao & Giải trí'];

export default function CatalogueScreen() {
  const router = useRouter();
  const user = useAuthStore(selectUser);
  const signOut = useAuthStore(selectSignOut);

  // Search input and Category selection (User inputs)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Interactive review state override (for examiner testing of 4 states)
  const [demoStateOverride, setDemoStateOverride] = useState<ScreenViewState | null>(null);

  // TanStack Query for Server State & Cache
  const {
    data: catalogueData = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['catalogue', 'listings'],
    queryFn: async (): Promise<ListingItem[]> => {
      // Simulate network request with resilient cache
      await new Promise((resolve) => setTimeout(resolve, 600));
      return MOCK_CATALOGUE_ITEMS;
    },
  });

  // RULE 6: Dữ liệu tìm kiếm/lọc không phải state riêng; tính toán trực tiếp từ source data và input
  const filteredListings = useMemo(() => {
    return catalogueData.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === 'Tất cả' || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [catalogueData, searchQuery, selectedCategory]);

  // Determine active view state
  const currentViewState: ScreenViewState = useMemo(() => {
    if (demoStateOverride) return demoStateOverride;
    if (isLoading) return 'loading';
    if (isError) return 'error';
    if (filteredListings.length === 0) return 'empty';
    return 'content';
  }, [demoStateOverride, isLoading, isError, filteredListings.length]);

  const handleRetry = () => {
    setDemoStateOverride(null);
    refetch();
  };

  const renderItem = ({ item }: { item: ListingItem }) => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Xem chi tiết sản phẩm: ${item.title}, giá: ${formatVND(item.priceVnd)}`}
      style={styles.card}
      onPress={() => router.push(`/(app)/listing/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
        <Text style={styles.locationText}>📍 {item.campusLocation}</Text>
      </View>

      <Text style={styles.itemTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.itemDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.priceText}>{formatVND(item.priceVnd)}</Text>
        <Text style={styles.sellerText}>Người bán: {item.sellerName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top action bar: User welcome, Create Modal trigger, Logout */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Xin chào,</Text>
          <Text style={styles.userName}>{user?.fullName || 'Sinh viên'}</Text>
        </View>
        <View style={styles.headerActions}>
          <Button
            title="+ Đăng tin"
            variant="primary"
            onPress={() => router.push('/(app)/modal/create-listing')}
            accessibilityLabel="Mở cửa sổ đăng tin rao vặt sinh viên mới"
            style={styles.postBtn}
          />
          <Button
            title="Đăng xuất"
            variant="secondary"
            onPress={signOut}
            accessibilityLabel="Đăng xuất khỏi tài khoản"
            style={styles.logoutBtn}
          />
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm sách, máy tính, đồ dùng..."
          placeholderTextColor={Tokens.colors.textMuted}
          style={styles.searchInput}
          accessibilityRole="search"
          accessibilityLabel="Ô tìm kiếm sản phẩm trong campus"
        />
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(cat) => cat}
          renderItem={({ item: cat }) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Lọc theo danh mục: ${cat}`}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* 4-State Container */}
      <ScreenStateView
        state={currentViewState}
        onRetry={handleRetry}
        onStateChange={setDemoStateOverride}
        loadingMessage="Đang tải danh sách đồ dùng sinh viên..."
        emptyTitle="Không tìm thấy sản phẩm"
        emptyMessage={
          searchQuery
            ? `Không có kết quả nào phù hợp với từ khóa "${searchQuery}". Hãy thử tìm kiếm từ khác.`
            : 'Chưa có sản phẩm nào trong danh mục này.'
        }
        errorMessage="Không thể kết nối đến máy chủ Marketplace. Vui lòng kiểm tra mạng."
      >
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              tintColor={Tokens.colors.primary}
            />
          }
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
  topBar: {
    backgroundColor: Tokens.colors.surface,
    paddingHorizontal: Tokens.spacing.screenPadding,
    paddingVertical: Tokens.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Tokens.colors.borderSubtle,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: Tokens.typography.fontSizes.xs,
    color: Tokens.colors.textMuted,
  },
  userName: {
    fontSize: Tokens.typography.fontSizes.sm,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Tokens.spacing.xs,
  },
  postBtn: {
    paddingHorizontal: Tokens.spacing.sm,
  },
  logoutBtn: {
    paddingHorizontal: Tokens.spacing.sm,
  },
  searchSection: {
    paddingHorizontal: Tokens.spacing.screenPadding,
    paddingTop: Tokens.spacing.sm,
    backgroundColor: Tokens.colors.surface,
  },
  searchInput: {
    minHeight: Tokens.layout.minTouchTarget,
    backgroundColor: Tokens.colors.surfaceSubtle,
    borderRadius: Tokens.borderRadius.md,
    paddingHorizontal: Tokens.spacing.md,
    fontSize: Tokens.typography.fontSizes.sm,
    color: Tokens.colors.textPrimary,
    borderWidth: 1,
    borderColor: Tokens.colors.borderSubtle,
  },
  categoryContainer: {
    backgroundColor: Tokens.colors.surface,
    paddingVertical: Tokens.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Tokens.colors.borderSubtle,
  },
  categoryList: {
    paddingHorizontal: Tokens.spacing.screenPadding,
    gap: Tokens.spacing.xs,
  },
  categoryChip: {
    minHeight: Tokens.layout.minTouchTarget,
    paddingHorizontal: Tokens.spacing.md,
    borderRadius: Tokens.borderRadius.pill,
    backgroundColor: Tokens.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Tokens.colors.borderSubtle,
  },
  categoryChipActive: {
    backgroundColor: Tokens.colors.primary,
    borderColor: Tokens.colors.primary,
  },
  categoryChipText: {
    fontSize: Tokens.typography.fontSizes.xs,
    fontWeight: Tokens.typography.fontWeights.medium,
    color: Tokens.colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Tokens.colors.textInverse,
    fontWeight: Tokens.typography.fontWeights.bold,
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
  },
  cardHeader: {
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
  locationText: {
    fontSize: Tokens.typography.fontSizes.xs,
    color: Tokens.colors.textMuted,
  },
  itemTitle: {
    fontSize: Tokens.typography.fontSizes.md,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.textPrimary,
    marginBottom: Tokens.spacing.xxs,
  },
  itemDescription: {
    fontSize: Tokens.typography.fontSizes.sm,
    color: Tokens.colors.textSecondary,
    marginBottom: Tokens.spacing.sm,
    lineHeight: Tokens.typography.lineHeights.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Tokens.colors.surfaceSubtle,
    paddingTop: Tokens.spacing.xs,
  },
  priceText: {
    fontSize: Tokens.typography.fontSizes.lg,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.primary,
  },
  sellerText: {
    fontSize: Tokens.typography.fontSizes.xs,
    color: Tokens.colors.textMuted,
  },
});
