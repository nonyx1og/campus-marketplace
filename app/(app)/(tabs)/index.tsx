import React, { useMemo, useState } from 'react';
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
import { useThemeContext } from '@/constants/theme';
import { ScreenState } from '@/components/primitives/ScreenState';
import { EmptyState } from '@/components/primitives/EmptyState';
import { AppButton } from '@/components/primitives/AppButton';
import { useAuthStore, selectSignOut, selectUser } from '@/store/auth-store';
import {
  useCatalogueStore,
  selectSearchQuery,
  selectSelectedCategory,
  selectIsSimulatedOffline,
  selectDemoStateOverride,
  selectSetSearchQuery,
  selectSetSelectedCategory,
  selectSetSimulatedOffline,
  selectSetDemoStateOverride,
  selectResetFilters,
} from '@/store/catalogue-store';
import { useCatalogueQuery } from '@/features/catalogue/useCatalogueQuery';
import { filterListings } from '@/features/catalogue/filterListings';
import { CatalogueCard } from '@/features/catalogue/components/CatalogueCard';
import { CatalogueSkeleton } from '@/features/catalogue/components/CatalogueSkeleton';
import { OfflineBanner } from '@/features/catalogue/components/OfflineBanner';
import { CatalogueHeaderFreshness } from '@/features/catalogue/components/CatalogueHeaderFreshness';
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
  const { theme, toggleTheme } = useThemeContext();

  // Auth User & Actions
  const user = useAuthStore(selectUser);
  const signOut = useAuthStore(selectSignOut);

  // Client State from Zustand (Only pure user inputs: search text, selected category, demo flags)
  // Absolutely NO filteredListings or searchResults stored in state!
  const searchQuery = useCatalogueStore(selectSearchQuery);
  const selectedCategory = useCatalogueStore(selectSelectedCategory);
  const isSimulatedOffline = useCatalogueStore(selectIsSimulatedOffline);
  const demoStateOverride = useCatalogueStore(selectDemoStateOverride);

  const setSearchQuery = useCatalogueStore(selectSetSearchQuery);
  const setSelectedCategory = useCatalogueStore(selectSetSelectedCategory);
  const setSimulatedOffline = useCatalogueStore(selectSetSimulatedOffline);
  const setDemoStateOverride = useCatalogueStore(selectSetDemoStateOverride);
  const resetFilters = useCatalogueStore(selectResetFilters);

  // Server State from TanStack Query (Catalogue source data)
  const {
    listings: sourceListings,
    lastUpdated,
    isOffline,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useCatalogueQuery({
    page: 1,
    limit: 50,
  });

  // Purely computed in render from listings + searchText + selectedCategory
  // Never stored in useState or Zustand store!
  const filteredListings = useMemo(
    () => filterListings(sourceListings, searchQuery, selectedCategory),
    [sourceListings, searchQuery, selectedCategory]
  );

  // Calculate 4-State UI for the overall screen
  // - 'loading': when initially fetching and no source data
  // - 'error': when fetch failed and no source/cached data
  // - 'empty': when the source catalogue itself has 0 items
  // - 'content': when catalogue has data (filtered results are rendered within content)
  const currentViewState: ScreenViewState = useMemo(() => {
    if (demoStateOverride) return demoStateOverride;
    if (isLoading && sourceListings.length === 0) return 'loading';
    if (isError && sourceListings.length === 0) return 'error';
    if (sourceListings.length === 0) return 'empty';
    return 'content';
  }, [demoStateOverride, isLoading, isError, sourceListings.length]);

  // Pull-to-refresh state & error preservation
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [customRefreshTime, setCustomRefreshTime] = useState<string | null>(null);

  // Derived effective last updated timestamp without cascading setState in effect
  const effectiveLastUpdated = customRefreshTime ?? lastUpdated;

  const handlePullToRefresh = async () => {
    setIsPullRefreshing(true);
    setRefreshError(null);
    try {
      await refetch();
      // On successful fetch: update timestamp and clear errors
      const nowIso = new Date().toISOString();
      setCustomRefreshTime(nowIso);
    } catch (err: unknown) {
      // PROMPT 9 RULE: Refresh error MUST NOT wipe currently displayed cache!
      const errorMsg =
        (err as { message?: string })?.message ||
        'Không thể làm mới danh mục lúc này. Vẫn bảo toàn toàn bộ sản phẩm đã lưu.';
      setRefreshError(errorMsg);
    } finally {
      setIsPullRefreshing(false);
    }
  };

  const handleRetry = () => {
    setDemoStateOverride(null);
    void handlePullToRefresh();
  };

  const handleClearCacheForDemo = async () => {
    await clearCatalogueCache();
    setCustomRefreshTime(null);
    void refetch();
  };

  const isFilterActive =
    searchQuery.trim().length > 0 || (selectedCategory !== 'Tất cả' && selectedCategory.trim().length > 0);

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
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.xs,
    backgroundColor: active ? theme.colors.warning : theme.colors.surface,
    borderWidth: 1,
    borderColor: active ? theme.colors.warning : theme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  });

  const demoChipTextStyle = (active: boolean): TextStyle => ({
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: active ? theme.colors.textInverse : theme.colors.text,
  });

  // Search input styles
  const searchSectionStyle: ViewStyle = {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
  };

  const searchInputWrapperStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    paddingHorizontal: theme.spacing.sm,
    minHeight: theme.layout.minTouchTarget, // Mandatory >= 44x44
  };

  const searchIconStyle: TextStyle = {
    fontSize: 16,
    marginRight: theme.spacing.xs,
    color: theme.colors.mutedText,
  };

  const searchInputStyle: TextStyle = {
    flex: 1,
    minHeight: theme.layout.minTouchTarget,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    paddingVertical: 0,
  };

  const clearSearchBtnStyle: ViewStyle = {
    minWidth: theme.layout.minTouchTarget, // Mandatory >= 44x44
    minHeight: theme.layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const clearSearchTextStyle: TextStyle = {
    fontSize: 14,
    color: theme.colors.mutedText,
    fontWeight: theme.typography.fontWeights.bold,
  };

  // Category chips styles
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
    minHeight: theme.layout.minTouchTarget, // Mandatory >= 44x44
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    backgroundColor: isSelected ? theme.colors.primaryBg : theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isSelected ? theme.colors.primaryBg : theme.colors.borderSubtle,
  });

  const chipInnerRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const checkIconStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textInverse,
    marginRight: 4,
  };

  const categoryChipTextStyle = (isSelected: boolean): TextStyle => ({
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: isSelected ? theme.typography.fontWeights.bold : theme.typography.fontWeights.medium,
    color: isSelected ? theme.colors.textInverse : theme.colors.mutedText,
  });

  const resultMetaRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.background,
  };

  const resultCountTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.mutedText,
  };

  const clearFilterBtnStyle: ViewStyle = {
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const clearFilterTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
  };

  const listContentStyle: ViewStyle = {
    padding: theme.spacing.screenPadding,
  };

  const emptyIconTextStyle: TextStyle = {
    fontSize: 28,
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

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Chuyển đổi giao diện Sáng hoặc Tối"
            style={demoChipStyle(false)}
            onPress={toggleTheme}
          >
            <Text style={demoChipTextStyle(false)}>
              {theme.mode === 'dark' ? '☀️ Sáng' : '🌙 Tối'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Control */}
      <View style={searchSectionStyle}>
        <View style={searchInputWrapperStyle}>
          <Text style={searchIconStyle} accessibilityElementsHidden>
            🔍
          </Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm sách, máy tính, bàn học, đồ dùng..."
            placeholderTextColor={theme.colors.mutedText}
            style={searchInputStyle}
            accessibilityRole="search"
            accessibilityLabel="Ô tìm kiếm sản phẩm catalogue trong trường"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Xóa từ khóa tìm kiếm"
              style={clearSearchBtnStyle}
              onPress={() => setSearchQuery('')}
            >
              <Text style={clearSearchTextStyle}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
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
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Danh mục ${cat}${isSelected ? ', đang chọn' : ''}`}
                style={categoryChipStyle(isSelected)}
                onPress={() => setSelectedCategory(cat)}
              >
                <View style={chipInnerRowStyle}>
                  {isSelected && <Text style={checkIconStyle}>✓</Text>}
                  <Text style={categoryChipTextStyle(isSelected)}>{cat}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={categoryListContentStyle}
        />
      </View>

      {/* Results Meta Info Bar */}
      {isFilterActive && (
        <View style={resultMetaRowStyle}>
          <Text style={resultCountTextStyle}>
            Kết quả: {filteredListings.length} / {sourceListings.length} sản phẩm
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Xóa toàn bộ bộ lọc tìm kiếm và danh mục"
            style={clearFilterBtnStyle}
            onPress={resetFilters}
          >
            <Text style={clearFilterTextStyle}>✕ Xóa bộ lọc</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4-State Container: Loading, Empty, Error, Content */}
      <ScreenState
        state={currentViewState}
        onRetry={handleRetry}
        retryLabel="Thử lại"
        loadingMessage="Đang tải danh sách đồ dùng sinh viên..."
        emptyTitle="Catalogue chưa có sản phẩm"
        emptyMessage="Hiện tại chưa có sản phẩm nào được đăng bán trên Campus Marketplace. Hãy quay lại sau!"
        emptyActionLabel="Làm mới"
        onEmptyAction={handleRetry}
        errorTitle="Không thể kết nối"
        errorMessage={
          error?.message ||
          'Không thể kết nối đến máy chủ và chưa có bản lưu catalogue offline. Vui lòng kiểm tra mạng và thử lại.'
        }
        showStateSwitcher
        onStateChange={setDemoStateOverride}
      >
        {isLoading && sourceListings.length === 0 ? (
          <View style={listContentStyle}>
            <CatalogueSkeleton count={3} />
          </View>
        ) : filteredListings.length === 0 ? (
          /* Empty state RIÊNG khi có catalogue nhưng không có kết quả phù hợp */
          <EmptyState
            icon={<Text style={emptyIconTextStyle}>🔍</Text>}
            title="Không tìm thấy sản phẩm phù hợp"
            message={
              searchQuery.trim() && selectedCategory !== 'Tất cả'
                ? `Không có sản phẩm nào thuộc danh mục "${selectedCategory}" khớp với từ khóa "${searchQuery.trim()}". Hãy thử từ khóa khác hoặc xóa bộ lọc.`
                : searchQuery.trim()
                ? `Không có sản phẩm nào khớp với từ khóa "${searchQuery.trim()}". Hãy thử từ khóa khác hoặc xóa bộ lọc.`
                : `Hiện tại chưa có sản phẩm nào trong danh mục "${selectedCategory}". Hãy chọn danh mục khác hoặc xóa bộ lọc.`
            }
            actionLabel="Xóa bộ lọc"
            onAction={resetFilters}
            accessibilityLabel={`Không tìm thấy kết quả phù hợp cho tìm kiếm ${searchQuery}. Nhấn nút để xóa bộ lọc.`}
          />
        ) : (
          <FlatList
            data={filteredListings}
            keyExtractor={(item: ListingItem) => item.id}
            renderItem={({ item }) => <CatalogueCard item={item} />}
            ListHeaderComponent={
              <>
                {isOffline && (
                  <OfflineBanner
                    lastUpdated={effectiveLastUpdated}
                    onRetry={handleRetry}
                    isRetrying={isRefetching || isPullRefreshing}
                  />
                )}
                <CatalogueHeaderFreshness
                  lastUpdated={effectiveLastUpdated}
                  isRefetching={isRefetching || isPullRefreshing}
                  refreshError={refreshError}
                  itemCount={filteredListings.length}
                  onDismissError={() => setRefreshError(null)}
                  onRetry={handlePullToRefresh}
                />
              </>
            }
            contentContainerStyle={listContentStyle}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching || isPullRefreshing}
                onRefresh={handlePullToRefresh}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}
      </ScreenState>
    </View>
  );
}
