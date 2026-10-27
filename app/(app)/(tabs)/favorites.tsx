import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/constants/theme';
import { ScreenState } from '@/components/primitives/ScreenState';
import {
  useFavoritesStore,
  useFavoriteIds,
  selectIsFavoritesHydrated,
} from '@/store/favorites-store';
import { fetchListingById } from '@/lib/api/catalogue';
import { getCatalogueCache } from '@/lib/storage/catalogue-cache';
import { queryClient } from '@/lib/query-client';
import { formatVND } from '@/lib/currency';
import { ListingItem } from '@/types/listing';
import { ScreenViewState } from '@/types/domain';
import { NotificationPermissionBanner } from '@/features/notifications/components/NotificationPermissionBanner';
import { checkAndNotifyFavoritePriceChanges } from '@/features/notifications/notificationService';

export type FavoriteListingStatus = 'available' | 'out_of_stock' | 'deleted';

export interface DerivedFavoriteItem {
  id: string;
  item: ListingItem | null;
  status: FavoriteListingStatus;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const theme = useTheme();

  // Fine-grained client Zustand store (minimal state: only favoriteIds)
  const favoriteIds = useFavoriteIds();
  const isHydrated = useFavoritesStore(selectIsFavoritesHydrated);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const hydrateFavorites = useFavoritesStore((state) => state.hydrateFavorites);

  // Demo review state switcher for examiners
  const [demoStateOverride, setDemoStateOverride] = useState<ScreenViewState | null>(null);

  // Restore favorites on mount
  useEffect(() => {
    if (!isHydrated) {
      void hydrateFavorites();
    }
  }, [isHydrated, hydrateFavorites]);

  /**
   * Safe derivation & querying of listing details for favoriteIds.
   * Resolves from:
   * 1. TanStack Query cache (`queryClient.getQueryData(['listing', id])`)
   * 2. Local catalogue persistence cache (`getCatalogueCache()`)
   * 3. Remote API / mock catalogue data (`fetchListingById(id)`)
   * 4. Gracefully detects and handles deleted or out-of-stock listings.
   */
  const {
    data: derivedFavorites = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<DerivedFavoriteItem[]>({
    queryKey: ['favorites', 'details', favoriteIds],
    queryFn: async (): Promise<DerivedFavoriteItem[]> => {
      if (favoriteIds.length === 0) return [];

      const resolved = await Promise.all(
        favoriteIds.map(async (id): Promise<DerivedFavoriteItem> => {
          try {
            // 1. Check TanStack Query cache first
            const queryDetail = queryClient.getQueryData<ListingItem>(['listing', id]);
            if (queryDetail) {
              const isAvail = (queryDetail.stock ?? 1) > 0;
              return {
                id,
                item: queryDetail,
                status: isAvail ? 'available' : 'out_of_stock',
              };
            }

            // 2. Check local catalogue cache
            const catalogueCache = await getCatalogueCache();
            const cachedItem = catalogueCache?.items.find((x) => x.id === id);
            if (cachedItem) {
              const isAvail = (cachedItem.stock ?? 1) > 0;
              return {
                id,
                item: cachedItem,
                status: isAvail ? 'available' : 'out_of_stock',
              };
            }

            // 3. Fetch from remote API or mock data
            const fetched = await fetchListingById(id);
            if (fetched) {
              const isAvail = (fetched.stock ?? 1) > 0;
              return {
                id,
                item: fetched,
                status: isAvail ? 'available' : 'out_of_stock',
              };
            }

            // Item not found on server/cache -> deleted
            return {
              id,
              item: null,
              status: 'deleted',
            };
          } catch {
            // Graceful error isolation per-item
            return {
              id,
              item: null,
              status: 'deleted',
            };
          }
        })
      );

      return resolved;
    },
    enabled: isHydrated && favoriteIds.length > 0,
  });

  // 4-State evaluation
  const viewState: ScreenViewState = (() => {
    if (demoStateOverride) return demoStateOverride;
    if (!isHydrated || (favoriteIds.length > 0 && isLoading && derivedFavorites.length === 0)) {
      return 'loading';
    }
    if (isError) {
      return 'error';
    }
    if (favoriteIds.length === 0 || (derivedFavorites.length === 0 && !isLoading)) {
      return 'empty';
    }
    return 'content';
  })();

  // Extract available listings for price drop tracking
  const availableListings = useMemo(
    () => derivedFavorites.map((d) => d.item).filter((x): x is ListingItem => x !== null),
    [derivedFavorites]
  );

  // Background price check when favorites data arrives
  useEffect(() => {
    if (availableListings.length > 0) {
      void checkAndNotifyFavoritePriceChanges(favoriteIds, availableListings);
    }
  }, [availableListings, favoriteIds]);

  const handleSimulatedPriceDrop = async () => {
    if (availableListings.length === 0) {
      Alert.alert('Chưa có sản phẩm', 'Vui lòng lưu ít nhất 1 sản phẩm còn hàng để thử nghiệm thông báo giảm giá.');
      return;
    }

    const target = availableListings[0];
    const currentPrice = target.priceVnd;
    const newPrice = Math.max(10000, currentPrice - 20000);

    // Apply simulated discount immutably
    const updatedTarget: ListingItem = {
      ...target,
      priceVnd: newPrice,
      priceMinor: newPrice,
    };
    const updatedListings = [updatedTarget, ...availableListings.slice(1)];

    // Trigger price change evaluation
    const notifs = await checkAndNotifyFavoritePriceChanges(favoriteIds, updatedListings);
    await refetch();
    if (notifs.length > 0) {
      Alert.alert(
        'Đã giảm giá thành công!',
        `Đã hạ giá "${target.title}" từ ${formatVND(currentPrice)} xuống ${formatVND(newPrice)}.\nThông báo giảm giá cục bộ đã được kích hoạt!`
      );
    }
  };

  const handleCardPress = (entry: DerivedFavoriteItem) => {
    if (entry.status === 'deleted' || !entry.item) {
      Alert.alert(
        'Sản phẩm không khả dụng',
        'Món đồ này đã bị người bán gỡ hoặc xoá khỏi sàn giao dịch. Bạn có thể bấm "Bỏ lưu" để dọn dẹp danh sách yêu thích.'
      );
      return;
    }
    router.push(`/(app)/listing/${entry.item.id}`);
  };

  const handleRemove = async (id: string) => {
    await removeFavorite(id);
  };

  // Styles strictly conforming to WCAG AA and theme tokens
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

  const imageThumbContainerStyle: ViewStyle = {
    width: 64,
    height: 64,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  };

  const imageThumbStyle: ImageStyle = {
    width: '100%',
    height: '100%',
  };

  const infoColStyle: ViewStyle = {
    flex: 1,
    marginRight: theme.spacing.sm,
  };

  const badgeRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xxs,
    gap: theme.spacing.xs,
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
    minHeight: theme.layout.minTouchTarget, // Mandatory >= 44x44
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
        showStateSwitcher={true}
        onStateChange={setDemoStateOverride}
        loadingMessage="Đang tải danh sách đồ dùng đã lưu..."
        emptyTitle="Chưa có sản phẩm yêu thích"
        emptyMessage="Bạn chưa lưu tin đăng nào. Hãy dạo quanh mục Sản phẩm để tìm món đồ phù hợp."
        emptyActionLabel="Khám phá chợ ngay"
        onEmptyAction={() => router.push('/(app)/(tabs)/')}
        errorTitle="Không thể tải danh sách yêu thích"
        errorMessage={
          (error as { message?: string })?.message ||
          'Đã xảy ra sự cố khi tải dữ liệu từ máy chủ. Vui lòng thử lại.'
        }
        onRetry={() => {
          void refetch();
        }}
      >
        <FlatList
          data={derivedFavorites}
          keyExtractor={(entry) => entry.id}
          contentContainerStyle={listContentStyle}
          ListHeaderComponent={
            <NotificationPermissionBanner
              favoriteIds={favoriteIds}
              derivedListings={availableListings}
              onTriggerSimulatedDrop={handleSimulatedPriceDrop}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={({ item: entry }) => {
            const isDeleted = entry.status === 'deleted' || !entry.item;
            const isOutOfStock = entry.status === 'out_of_stock';
            const item = entry.item;
            const photoUrl = item?.photoUri || item?.imageUrl;
            const title = item ? item.title : `Sản phẩm mã ${entry.id} (Đã bị gỡ)`;

            // Status Badge configuration
            const badgeBg = isDeleted
              ? theme.colors.surfaceSubtle
              : isOutOfStock
              ? theme.colors.dangerBgMuted
              : theme.colors.successBgMuted;

            const badgeTextColor = isDeleted
              ? theme.colors.mutedText
              : isOutOfStock
              ? theme.colors.danger
              : theme.colors.success;

            const badgeText = isDeleted
              ? 'Đã bị xoá'
              : isOutOfStock
              ? 'Hết hàng'
              : 'Còn hàng';

            return (
              <View style={cardStyle}>
                {/* Product Thumbnail */}
                <View style={imageThumbContainerStyle}>
                  {photoUrl ? (
                    <Image
                      source={{ uri: photoUrl }}
                      style={imageThumbStyle}
                      resizeMode="cover"
                      accessibilityLabel={`Ảnh sản phẩm: ${title}`}
                    />
                  ) : (
                    <Text style={{ fontSize: 24 }}>{isDeleted ? '🗑️' : '📦'}</Text>
                  )}
                </View>

                {/* Listing Details */}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={
                    isDeleted
                      ? `Sản phẩm đã bị gỡ mã ${entry.id}`
                      : `Xem chi tiết sản phẩm yêu thích: ${title}`
                  }
                  style={infoColStyle}
                  onPress={() => handleCardPress(entry)}
                  activeOpacity={isDeleted ? 1 : 0.7}
                >
                  <View style={badgeRowStyle}>
                    <View
                      style={{
                        backgroundColor: badgeBg,
                        paddingHorizontal: theme.spacing.xs,
                        paddingVertical: theme.spacing.xxs,
                        borderRadius: theme.radius.xs,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.typography.fontSizes.xs,
                          color: badgeTextColor,
                          fontWeight: theme.typography.fontWeights.semibold,
                        }}
                      >
                        {badgeText}
                      </Text>
                    </View>
                    {item?.category ? (
                      <Text
                        style={{
                          fontSize: theme.typography.fontSizes.xs,
                          color: theme.colors.mutedText,
                        }}
                      >
                        {item.category}
                      </Text>
                    ) : null}
                  </View>

                  <Text style={itemTitleStyle} numberOfLines={2}>
                    {title}
                  </Text>

                  {item ? (
                    <Text style={priceTextStyle}>{formatVND(item.priceVnd)}</Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: theme.typography.fontSizes.xs,
                        color: theme.colors.mutedText,
                        marginBottom: theme.spacing.xxs,
                      }}
                    >
                      Không còn khả dụng trên chợ sinh viên
                    </Text>
                  )}

                  {item?.campusLocation ? (
                    <Text style={locationTextStyle}>📍 {item.campusLocation}</Text>
                  ) : null}
                </TouchableOpacity>

                {/* Remove Favorite Button (Touch target >= 44x44) */}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Bỏ thích sản phẩm ${title}`}
                  style={removeBtnStyle}
                  onPress={() => void handleRemove(entry.id)}
                  activeOpacity={0.7}
                >
                  <Text style={removeBtnTextStyle}>Bỏ lưu</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </ScreenState>
    </View>
  );
}
