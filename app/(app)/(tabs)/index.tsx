import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { ScreenState } from '@/components/primitives/ScreenState';
import { AppButton } from '@/components/primitives/AppButton';
import { useAuthStore, selectSignOut, selectUser } from '@/store/auth-store';
import {
  useCatalogueStore,
  selectSearchQuery,
  selectSelectedCategory,
  selectCataloguePage,
  selectCataloguePageSize,
  selectIsSimulatedOffline,
  selectDemoStateOverride,
  selectSetSearchQuery,
  selectSetSelectedCategory,
  selectSetCataloguePage,
  selectSetSimulatedOffline,
  selectSetDemoStateOverride,
  selectResetFilters,
} from '@/store/catalogue-store';
import { useCatalogueQuery } from '@/features/catalogue/useCatalogueQuery';
import { CatalogueCard } from '@/features/catalogue/components/CatalogueCard';
import { CatalogueSkeleton } from '@/features/catalogue/components/CatalogueSkeleton';
import { OfflineBanner } from '@/features/catalogue/components/OfflineBanner';
import { clearCatalogueCache } from '@/lib/storage/catalogue-cache';
import { ScreenViewState } from '@/types/domain';
import { ListingItem } from '@/types/listing';

const CATEGORIES = [
  'Tất cả',
  'Sách giáo trình',
  'Thiết bị học tập',
  'Đồ dùng phòng trọ',
  'Thể thao & Giải trí',
];

export default function CatalogueScreen() {
  const router = useRouter();
  const theme = useTheme();

  // Auth User & Actions
  const user = useAuthStore(selectUser);
  const signOut = useAuthStore(selectSignOut);

  // Client State from Zustand (Search, Filter, Pagination, Offline Demo Toggle)
  const searchQuery = useCatalogueStore(selectSearchQuery);
  const selectedCategory = useCatalogueStore(selectSelectedCategory);
  const page = useCatalogueStore(selectCataloguePage);
  const pageSize = useCatalogueStore(selectCataloguePageSize);
  const isSimulatedOffline = useCatalogueStore(selectIsSimulatedOffline);
  const demoStateOverride = useCatalogueStore(selectDemoStateOverride);

  const setSearchQuery = useCatalogueStore(selectSetSearchQuery);
  const setSelectedCategory = useCatalogueStore(selectSetSelectedCategory);
  const setPage = useCatalogueStore(selectSetCataloguePage);
  const setSimulatedOffline = useCatalogueStore(selectSetSimulatedOffline);
  const setDemoStateOverride = useCatalogueStore(selectSetDemoStateOverride);
  const resetFilters = useCatalogueStore(selectResetFilters);

  // Server State from TanStack Query
  const {
    listings,
    total,
    hasMore,
    lastUpdated,
    isFromCache,
    isOffline,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useCatalogueQuery({
    page,
    limit: pageSize,
    category: selectedCategory,
    search: searchQuery,
  });

  // Calculate 4-State UI
  const currentViewState: ScreenViewState = useMemo(() => {
    if (demoStateOverride) return demoStateOverride;
    if (isLoading && listings.length === 0) return 'loading';
    if (isError && listings.length === 0) return 'error';
    if (listings.length === 0) return 'empty';
    return 'content';
  }, [demoStateOverride, isLoading, isError, listings.length]);

  const handleRetry = () => {
    setDemoStateOverride(null);
    void refetch();
  };

  const handleClearCacheForDemo = async () => {
    await clearCatalogueCache();
    void refetch();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // --- Dynamic Styles using Theme Tokens (No hex colors!) ---
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const topBarStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  };

  const welcomeTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.mutedText,
  };

  const userNameStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  };

  const headerActionsStyle: ViewStyle = {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  };

  const postBtnStyle: ViewStyle = {
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.md,
  };

  const logoutBtnStyle: ViewStyle = {
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.sm,
  };

  const demoBarContainerStyle: ViewStyle = {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.xxs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  };

  const demoBarLabelStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.mutedText,
  };

  const demoButtonsRowStyle: ViewStyle = {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  };

  const demoChipStyle = (active: boolean): ViewStyle => ({
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.xs,
    backgroundColor: active ? theme.colors.warning : theme.colors.surface,
    borderWidth: 1,
    borderColor: active ? theme.colors.warning : theme.colors.borderSubtle,
  });

  const demoChipTextStyle = (active: boolean): TextStyle => ({
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: active ? theme.colors.textInverse : theme.colors.text,
  });

  const searchSectionStyle: ViewStyle = {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  };

  const searchInputStyle: TextStyle = {
    minHeight: theme.layout.minTouchTarget,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  };

  const categoryContainerStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  };

  const categoryListContentStyle: ViewStyle = {
    paddingHorizontal: theme.spacing.screenPadding,
    gap: theme.spacing.xs,
  };

  const categoryChipStyle = (isSelected: boolean): ViewStyle => ({
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    backgroundColor: isSelected ? theme.colors.primaryBg : theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isSelected ? theme.colors.primaryBg : theme.colors.borderSubtle,
  });

  const categoryChipTextStyle = (isSelected: boolean): TextStyle => ({
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: isSelected ? theme.typography.fontWeights.bold : theme.typography.fontWeights.medium,
    color: isSelected ? theme.colors.textInverse : theme.colors.mutedText,
  });

  const listContentStyle: ViewStyle = {
    padding: theme.spacing.screenPadding,
  };

  const paginationContainerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    marginTop: theme.spacing.sm,
  };

  const pageInfoTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.mutedText,
  };

  const paginationBtnStyle = (disabled: boolean): ViewStyle => ({
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: disabled ? theme.colors.surfaceSubtle : theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
  });

  const paginationBtnTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  };

  const renderHeader = () => {
    return (
      <View>
        {/* Offline Banner when serving cached data or simulated offline */}
        {isOffline && (
          <OfflineBanner
            lastUpdated={lastUpdated}
            onRetry={handleRetry}
            isRetrying={isRefetching}
          />
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (listings.length === 0) return null;

    return (
      <View style={paginationContainerStyle}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Trang trước"
          style={paginationBtnStyle(page <= 1)}
          onPress={() => setPage(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          <Text style={paginationBtnTextStyle}>‹ Trang trước</Text>
        </TouchableOpacity>

        <Text style={pageInfoTextStyle}>
          Trang {page} / {totalPages} ({total} sản phẩm)
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Trang sau"
          style={paginationBtnStyle(!hasMore && page >= totalPages)}
          onPress={() => setPage(page + 1)}
          disabled={!hasMore && page >= totalPages}
        >
          <Text style={paginationBtnTextStyle}>Trang sau ›</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={containerStyle}>
      {/* Top Header Bar */}
      <View style={topBarStyle}>
        <View>
          <Text style={welcomeTextStyle}>Xin chào,</Text>
          <Text style={userNameStyle}>{user?.fullName || 'Sinh viên'}</Text>
        </View>

        <View style={headerActionsStyle}>
          <AppButton
            title="+ Đăng tin"
            variant="primary"
            onPress={() => router.push('/(app)/modal/create-listing')}
            accessibilityLabel="Mở cửa sổ đăng tin rao vặt sinh viên mới"
            style={postBtnStyle}
          />
          <AppButton
            title="Đăng xuất"
            variant="outline"
            onPress={signOut}
            accessibilityLabel="Đăng xuất khỏi tài khoản"
            style={logoutBtnStyle}
          />
        </View>
      </View>

      {/* Demo Controls Bar: Simulation Switchers for Examination & Presentation */}
      <View style={demoBarContainerStyle}>
        <Text style={demoBarLabelStyle}>Mô phỏng Demo:</Text>
        <View style={demoButtonsRowStyle}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Bật tắt chế độ mô phỏng ngoại tuyến"
            style={demoChipStyle(isSimulatedOffline)}
            onPress={() => {
              const nextVal = !isSimulatedOffline;
              setSimulatedOffline(nextVal);
              void refetch();
            }}
          >
            <Text style={demoChipTextStyle(isSimulatedOffline)}>
              {isSimulatedOffline ? '⚡ Ngoại tuyến: BẬT' : '🌐 Ngoại tuyến: TẮT'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Xóa bộ nhớ đệm cache cục bộ"
            style={demoChipStyle(false)}
            onPress={handleClearCacheForDemo}
          >
            <Text style={demoChipTextStyle(false)}>🗑 Xóa Cache</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={searchSectionStyle}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm sách, máy tính, bàn học, đồ dùng..."
          placeholderTextColor={theme.colors.mutedText}
          style={searchInputStyle}
          accessibilityRole="search"
          accessibilityLabel="Ô tìm kiếm sản phẩm catalogue trong trường"
        />
      </View>

      {/* Category Horizontal Filter Chips */}
      <View style={categoryContainerStyle}>
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
                style={categoryChipStyle(isSelected)}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={categoryChipTextStyle(isSelected)}>{cat}</Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={categoryListContentStyle}
        />
      </View>

      {/* 4-State Container: Loading, Empty, Error, Content */}
      <ScreenState
        state={currentViewState}
        onRetry={handleRetry}
        retryLabel="Thử lại"
        loadingMessage="Đang tải danh sách đồ dùng sinh viên..."
        emptyTitle="Không tìm thấy sản phẩm"
        emptyMessage={
          searchQuery
            ? `Không có sản phẩm nào phù hợp với từ khóa "${searchQuery}". Hãy thử tìm kiếm từ khác.`
            : 'Chưa có sản phẩm nào trong danh mục này.'
        }
        emptyActionLabel="Xóa bộ lọc"
        onEmptyAction={resetFilters}
        errorTitle="Không thể kết nối"
        errorMessage={
          error?.message ||
          'Không thể kết nối đến máy chủ và chưa có bản lưu catalogue offline. Vui lòng kiểm tra mạng và thử lại.'
        }
        showStateSwitcher
        onStateChange={setDemoStateOverride}
      >
        {isLoading && listings.length === 0 ? (
          <View style={listContentStyle}>
            <CatalogueSkeleton count={3} />
          </View>
        ) : (
          <FlatList
            data={listings}
            keyExtractor={(item: ListingItem) => item.id}
            renderItem={({ item }) => <CatalogueCard item={item} />}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            contentContainerStyle={listContentStyle}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => {
                  void refetch();
                }}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}
      </ScreenState>
    </View>
  );
}
