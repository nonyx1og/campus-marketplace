import { apiClient } from './client';
import { apiConfig, isRemoteApiConfigured } from './config';
import { ListingItem, CatalogueQueryParams } from '@/types/listing';
import { PaginatedResponse, ApiError, User } from '@/types/domain';
import { getCatalogueCache, saveCatalogueCache } from '@/lib/storage/catalogue-cache';

// Simulated offline toggle for team demo and test verification
let simulatedOfflineMode = false;

export function setSimulatedOfflineMode(enabled: boolean): void {
  simulatedOfflineMode = enabled;
}

export function isSimulatedOfflineMode(): boolean {
  return simulatedOfflineMode;
}

export const MOCK_CATALOGUE_DATA: ListingItem[] = [
  {
    id: 'prod-101',
    title: 'Giáo trình Giải tích 1 & 2 (Kèm bài tập có giải)',
    description: 'Sách còn mới 95%, có ghi chú các dạng đề thi cuối kỳ trường Bách Khoa.',
    priceVnd: 75000,
    priceMinor: 75000,
    stock: 4,
    category: 'Sách giáo trình',
    sellerId: 'usr_seller_02',
    sellerName: 'Trần Thị Người Bán',
    campusLocation: 'Khu A - Toà Nhà Thư Viện',
    photoUri: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-24T10:00:00Z',
    updatedAt: '2026-10-24T10:00:00Z',
  },
  {
    id: 'prod-102',
    title: 'Máy tính bỏ túi Casio fx-580VN X',
    description: 'Máy dùng tốt mọi chức năng, còn nguyên tem bảo hành chính hãng Bitex.',
    priceVnd: 420000,
    priceMinor: 420000,
    stock: 2,
    category: 'Thiết bị học tập',
    sellerId: 'usr-003',
    sellerName: 'Trần Thị Mai',
    campusLocation: 'Khu B - Ký túc xá B4',
    photoUri: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-23T14:30:00Z',
    updatedAt: '2026-10-23T14:30:00Z',
  },
  {
    id: 'prod-103',
    title: 'Bàn học gấp gọn sinh viên chân sắt mặt gỗ',
    description: 'Bàn chân sắt chịu lực tốt, mặt gỗ chống nước, tiện xếp gọn khi không dùng.',
    priceVnd: 90000,
    priceMinor: 90000,
    stock: 8,
    category: 'Đồ dùng phòng trọ',
    sellerId: 'usr-004',
    sellerName: 'Võ Minh Quân',
    campusLocation: 'Cổng phụ KTX Khu A',
    photoUri: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-22T08:15:00Z',
    updatedAt: '2026-10-22T08:15:00Z',
  },
  {
    id: 'prod-104',
    title: 'Bộ vợt cầu lông Yonex Carbon kèm bao đựng',
    description: 'Đã căng cước 10.5kg, phù hợp luyện tập thể dục và thi đấu giải trường.',
    priceVnd: 280000,
    priceMinor: 280000,
    stock: 1,
    category: 'Thể thao & Giải trí',
    sellerId: 'usr-005',
    sellerName: 'Nguyễn Đăng Khoa',
    campusLocation: 'Nhà thi đấu trung tâm',
    photoUri: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-21T18:00:00Z',
    updatedAt: '2026-10-21T18:00:00Z',
  },
  {
    id: 'prod-105',
    title: 'Đèn bàn học chống cận LED Yeelight bảo vệ mắt',
    description: 'Đèn 3 chế độ sáng, chống mỏi mắt khi học đêm, cắm nguồn USB tiện lợi.',
    priceVnd: 150000,
    priceMinor: 150000,
    stock: 5,
    category: 'Thiết bị học tập',
    sellerId: 'usr-006',
    sellerName: 'Phạm Thuỳ Dung',
    campusLocation: 'KTX Toà C2 Phòng 408',
    photoUri: 'https://images.unsplash.com/photo-1534383433475-534964e5d521?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-20T11:20:00Z',
    updatedAt: '2026-10-20T11:20:00Z',
  },
  {
    id: 'prod-106',
    title: 'Ấm siêu tốc Inox 1.8L Sunhouse tiết kiệm điện',
    description: 'Ấm đun nhanh trong 3 phút, tự ngắt khi sôi, thích hợp nấu mì ăn liền.',
    priceVnd: 85000,
    priceMinor: 85000,
    stock: 0, // Đã hết hàng để demo kiểm tra badge stock
    category: 'Đồ dùng phòng trọ',
    sellerId: 'usr-007',
    sellerName: 'Đặng Quốc Anh',
    campusLocation: 'Khu dân cư làng đại học',
    photoUri: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-19T09:40:00Z',
    updatedAt: '2026-10-19T09:40:00Z',
  },
  {
    id: 'prod-107',
    title: 'Tai nghe Bluetooth True Wireless Baseus Bowie',
    description: 'Pin trâu 25 giờ kèm dock sạc, âm bass ấm, mic đàm thoại rõ ràng.',
    priceVnd: 310000,
    priceMinor: 310000,
    stock: 3,
    category: 'Thiết bị học tập',
    sellerId: 'usr-008',
    sellerName: 'Bùi Thanh Hằng',
    campusLocation: 'Căn tin Khu B',
    photoUri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-18T16:15:00Z',
    updatedAt: '2026-10-18T16:15:00Z',
  },
  {
    id: 'prod-108',
    title: 'Giáo trình Kinh tế vi mô & vĩ mô kèm slide',
    description: 'Bộ 2 cuốn nhập môn kinh tế, trình bày dễ hiểu, có highlight công thức.',
    priceVnd: 60000,
    priceMinor: 60000,
    stock: 7,
    category: 'Sách giáo trình',
    sellerId: 'usr-009',
    sellerName: 'Ngô Việt Hoàng',
    campusLocation: 'Toà H1 Trường Bách Khoa',
    photoUri: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-17T13:00:00Z',
    updatedAt: '2026-10-17T13:00:00Z',
  },
];

/**
 * Fetch catalogue listings with pagination, search, category filter, and offline simulation.
 */
export async function fetchCatalogueListings(
  params: CatalogueQueryParams = {}
): Promise<PaginatedResponse<ListingItem>> {
  const { page = 1, limit = 6, category, search } = params;

  // 1. Check for manual simulated offline mode (for demo and examiners)
  if (simulatedOfflineMode) {
    const offlineError: ApiError = {
      code: 'NETWORK_OFFLINE',
      message: 'Thiết bị đang ở chế độ ngoại tuyến hoặc mất kết nối máy chủ.',
      status: 0,
      timestamp: new Date().toISOString(),
    };
    throw offlineError;
  }

  // 2. If remote API is configured, attempt actual HTTP request
  if (isRemoteApiConfigured()) {
    try {
      const response = await apiClient.get<PaginatedResponse<ListingItem>>('/listings', {
        params: {
          page,
          limit,
          category: category && category !== 'Tất cả' ? category : undefined,
          search: search?.trim() || undefined,
        },
        requiresAuth: false,
      });

      if (response && Array.isArray(response.items)) {
        return response;
      }
    } catch (error) {
      if (!apiConfig.isMockFallbackEnabled) {
        throw error;
      }
      // Continue to mock fallback if allowed
    }
  }

  // 3. Realistic Mock Fallback with simulated server latency
  await new Promise((resolve) => setTimeout(resolve, 350));

  let items = [...MOCK_CATALOGUE_DATA];

  // Filter by category
  if (category && category !== 'Tất cả') {
    items = items.filter((item) => item.category === category);
  }

  // Filter by search keyword
  if (search && search.trim()) {
    const lower = search.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower)
    );
  }

  const total = items.length;
  const startIndex = (page - 1) * limit;
  const paginatedItems = items.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < total;

  return {
    items: paginatedItems,
    total,
    page,
    pageSize: limit,
    hasMore,
  };
}

/**
 * Fetch a single listing by its ID.
 * Queries remote API if configured, falls back to mock data or offline local storage.
 */
export async function fetchListingById(id: string): Promise<ListingItem | null> {
  // 1. Simulated offline mode check
  if (simulatedOfflineMode) {
    const cache = await getCatalogueCache();
    if (cache && Array.isArray(cache.items)) {
      const match = cache.items.find((item) => item.id === id);
      if (match) return match;
    }
    const offlineError: ApiError = {
      code: 'NETWORK_OFFLINE',
      message: 'Thiết bị đang ở chế độ ngoại tuyến và không tìm thấy bản lưu cho sản phẩm này.',
      status: 0,
      timestamp: new Date().toISOString(),
    };
    throw offlineError;
  }

  // 2. Remote API request if configured
  if (isRemoteApiConfigured()) {
    try {
      const response = await apiClient.get<ListingItem>(`/listings/${id}`, {
        requiresAuth: false,
      });
      if (response && response.id) {
        return response;
      }
    } catch (error) {
      if (!apiConfig.isMockFallbackEnabled) {
        throw error;
      }
    }
  }

  // 3. Fallback: Lookup in in-memory mock catalogue data
  await new Promise((resolve) => setTimeout(resolve, 200));

  const found = MOCK_CATALOGUE_DATA.find((item) => item.id === id);
  if (found) return found;

  // 4. Fallback: Lookup in local persistent cache
  const cache = await getCatalogueCache();
  if (cache && Array.isArray(cache.items)) {
    const cachedMatch = cache.items.find((item) => item.id === id);
    if (cachedMatch) return cachedMatch;
  }

  return null;
}

export interface CreateListingInput {
  title: string;
  category: string;
  priceVnd: number;
  stock: number;
  campusLocation: string;
  description: string;
  photoUri: string;
  compressedMetrics?: {
    rawBytes: number;
    compressedBytes: number;
    ratioPercent: number;
  };
}

/**
 * Upload a compressed photo to remote storage/API.
 * In offline/mock mode, simulates network delay and returns the photo URI.
 */
export async function uploadListingImage(compressedUri: string): Promise<string> {
  if (simulatedOfflineMode) {
    const offlineError: ApiError = {
      code: 'NETWORK_OFFLINE',
      message: 'Thiết bị đang ở chế độ ngoại tuyến, không thể tải ảnh lên máy chủ.',
      status: 0,
      timestamp: new Date().toISOString(),
    };
    throw offlineError;
  }

  if (isRemoteApiConfigured()) {
    const formData = new FormData();
    formData.append('file', {
      uri: compressedUri,
      type: 'image/jpeg',
      name: `listing-${Date.now()}.jpg`,
    } as unknown as Blob);

    // Content-Type is intentionally not set here: fetch adds multipart/form-data with its boundary.
    // When a real API is configured, upload errors are NOT swallowed by the mock fallback.
    // Otherwise the listing would be saved with a device-local file URI while the UI reports success.
    const response = await apiClient.post<{ url: string }>('/storage/upload', formData);
    if (!response || !response.url) {
      const invalidResponseError: ApiError = {
        code: 'UPLOAD_INVALID_RESPONSE',
        message: 'Máy chủ không trả về đường dẫn ảnh sau khi tải lên. Vui lòng thử lại.',
        status: 0,
        timestamp: new Date().toISOString(),
      };
      throw invalidResponseError;
    }
    return response.url;
  }

  // Demo mode (no EXPO_PUBLIC_API_URL configured): no remote storage exists,
  // so the compressed local URI is used. This is NOT a real upload.
  // Realistic simulated network upload delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return compressedUri;
}

/**
 * Submit a newly created listing with validated fields and compressed photo.
 */
export async function createListing(input: CreateListingInput): Promise<ListingItem> {
  // Validate title
  if (!input.title || !input.title.trim()) {
    const error: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Tên món đồ / giáo trình không được để trống.',
      status: 400,
      timestamp: new Date().toISOString(),
    };
    throw error;
  }

  // Validate price (Integer VND)
  const priceInt = Math.round(Number(input.priceVnd));
  if (isNaN(priceInt) || priceInt <= 0) {
    const error: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Giá bán phải là số nguyên dương tính theo VND.',
      status: 400,
      timestamp: new Date().toISOString(),
    };
    throw error;
  }

  // Validate stock (Non-negative integer)
  const stockInt = Math.round(Number(input.stock));
  if (isNaN(stockInt) || stockInt < 0) {
    const error: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Số lượng tồn kho phải là số nguyên không âm.',
      status: 400,
      timestamp: new Date().toISOString(),
    };
    throw error;
  }

  // Validate photo requirement
  if (!input.photoUri || !input.photoUri.trim()) {
    const error: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Vui lòng chọn hoặc chụp ít nhất 1 ảnh sản phẩm và nén trước khi đăng.',
      status: 400,
      timestamp: new Date().toISOString(),
    };
    throw error;
  }

  // Check offline mode
  if (simulatedOfflineMode) {
    const offlineError: ApiError = {
      code: 'NETWORK_OFFLINE',
      message: 'Thiết bị đang ở chế độ ngoại tuyến, không thể đăng tin lên chợ lúc này.',
      status: 0,
      timestamp: new Date().toISOString(),
    };
    throw offlineError;
  }

  // Submit to remote API if configured
  if (isRemoteApiConfigured()) {
    try {
      const response = await apiClient.post<ListingItem>('/listings', {
        ...input,
        priceVnd: priceInt,
        priceMinor: priceInt,
        stock: stockInt,
      });
      if (response && response.id) {
        return response;
      }
    } catch (error) {
      if (!apiConfig.isMockFallbackEnabled) {
        throw error;
      }
    }
  }

  // Mock server delay & prepend to MOCK_CATALOGUE_DATA for immediate availability
  await new Promise((resolve) => setTimeout(resolve, 600));

  const newListing: ListingItem = {
    id: `prod-${Date.now()}`,
    title: input.title.trim(),
    description: input.description?.trim() || 'Chưa có mô tả chi tiết.',
    priceVnd: priceInt,
    priceMinor: priceInt,
    stock: stockInt,
    category: input.category || 'Sách giáo trình',
    sellerId: 'usr-001',
    sellerName: 'Nguyễn Thanh Long',
    campusLocation: input.campusLocation || 'KTX Khu B',
    photoUri: input.photoUri,
    imageUrl: input.photoUri,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_CATALOGUE_DATA.unshift(newListing);
  return newListing;
}

/**
 * Backend authorization enforcement:
 * Updates the stock of a listing.
 * Enforces:
 * 1. User must be authenticated (401 Unauthorized)
 * 2. User must be a seller or admin, and must be the owner of the listing if not admin (403 Forbidden)
 * 3. Stock must be a non-negative integer (400 Validation Error)
 */
export async function updateListingStock(
  listingId: string,
  newStock: number,
  currentUser?: User | null
): Promise<ListingItem> {
  // 1. Authenticate user
  if (!currentUser) {
    const err: ApiError = {
      code: 'UNAUTHORIZED',
      message: 'Yêu cầu đăng nhập: Bạn cần đăng nhập tài khoản để thực hiện thao tác quản lý kho.',
      status: 401,
      timestamp: new Date().toISOString(),
    };
    throw err;
  }

  // 2. Validate input
  const stockInt = Math.round(Number(newStock));
  if (isNaN(stockInt) || stockInt < 0) {
    const err: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Số lượng tồn kho phải là số nguyên không âm.',
      status: 400,
      timestamp: new Date().toISOString(),
    };
    throw err;
  }

  // 3. Find target listing
  const listingIndex = MOCK_CATALOGUE_DATA.findIndex((item) => item.id === listingId);
  const listing = listingIndex !== -1 ? MOCK_CATALOGUE_DATA[listingIndex] : null;

  if (!listing) {
    const err: ApiError = {
      code: 'NOT_FOUND',
      message: `Không tìm thấy tin đăng với mã "${listingId}".`,
      status: 404,
      timestamp: new Date().toISOString(),
    };
    throw err;
  }

  // 4. Enforce authorization: user must be seller and owner (or admin)
  const isOwner = listing.sellerId === currentUser.id;
  const isAdmin = currentUser.role === 'admin';
  const isAuthorizedSeller = currentUser.role === 'seller' && isOwner;

  if (!isAdmin && !isAuthorizedSeller) {
    const err: ApiError = {
      code: 'FORBIDDEN',
      message: 'Từ chối quyền truy cập (403): Chỉ người bán sở hữu tin đăng này mới có quyền cập nhật tồn kho.',
      status: 403,
      timestamp: new Date().toISOString(),
    };
    throw err;
  }

  // 5. Remote API call if configured
  if (isRemoteApiConfigured()) {
    try {
      const response = await apiClient.patch<ListingItem>(
        `/listings/${listingId}/stock`,
        { stock: stockInt },
        { requiresAuth: true }
      );
      if (response && response.id) {
        return response;
      }
    } catch (error) {
      if (!apiConfig.isMockFallbackEnabled) {
        throw error;
      }
    }
  }

  // 6. Local simulated server update with delay
  await new Promise((resolve) => setTimeout(resolve, 250));
  const updatedListing: ListingItem = {
    ...listing,
    stock: stockInt,
    updatedAt: new Date().toISOString(),
  };

  MOCK_CATALOGUE_DATA[listingIndex] = updatedListing;

  // Also update persistent cache if item exists in cache
  const cache = await getCatalogueCache();
  if (cache && Array.isArray(cache.items)) {
    const cacheIdx = cache.items.findIndex((i) => i.id === listingId);
    if (cacheIdx !== -1) {
      cache.items[cacheIdx] = updatedListing;
      await saveCatalogueCache(cache);
    }
  }

  return updatedListing;
}

export interface UpdateListingInput {
  title?: string;
  priceVnd?: number;
  stock?: number;
  description?: string;
  category?: string;
  campusLocation?: string;
}

/**
 * Backend authorization enforcement:
 * Updates the details of a listing (e.g. price, stock, title).
 * Enforces 401 Unauthorized, 403 Forbidden, and 400 Validation.
 */
export async function updateListing(
  listingId: string,
  updates: UpdateListingInput,
  currentUser?: User | null
): Promise<ListingItem> {
  // 1. Authenticate user
  if (!currentUser) {
    const err: ApiError = {
      code: 'UNAUTHORIZED',
      message: 'Yêu cầu đăng nhập: Bạn cần đăng nhập tài khoản để chỉnh sửa tin đăng.',
      status: 401,
      timestamp: new Date().toISOString(),
    };
    throw err;
  }

  // 2. Find target listing
  const listingIndex = MOCK_CATALOGUE_DATA.findIndex((item) => item.id === listingId);
  const listing = listingIndex !== -1 ? MOCK_CATALOGUE_DATA[listingIndex] : null;

  if (!listing) {
    const err: ApiError = {
      code: 'NOT_FOUND',
      message: `Không tìm thấy tin đăng với mã "${listingId}".`,
      status: 404,
      timestamp: new Date().toISOString(),
    };
    throw err;
  }

  // 3. Enforce authorization
  const isOwner = listing.sellerId === currentUser.id;
  const isAdmin = currentUser.role === 'admin';
  const isAuthorizedSeller = currentUser.role === 'seller' && isOwner;

  if (!isAdmin && !isAuthorizedSeller) {
    const err: ApiError = {
      code: 'FORBIDDEN',
      message: 'Từ chối quyền truy cập (403): Chỉ người bán sở hữu tin đăng này mới có quyền chỉnh sửa thông tin.',
      status: 403,
      timestamp: new Date().toISOString(),
    };
    throw err;
  }

  // 4. Validate updates
  const patch: Partial<ListingItem> = {};

  if (updates.title !== undefined) {
    if (!updates.title.trim()) {
      const err: ApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Tiêu đề tin đăng không được để trống.',
        status: 400,
        timestamp: new Date().toISOString(),
      };
      throw err;
    }
    patch.title = updates.title.trim();
  }

  if (updates.priceVnd !== undefined) {
    const priceInt = Math.round(Number(updates.priceVnd));
    if (isNaN(priceInt) || priceInt <= 0) {
      const err: ApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Giá bán phải là số nguyên dương tính theo VND.',
        status: 400,
        timestamp: new Date().toISOString(),
      };
      throw err;
    }
    patch.priceVnd = priceInt;
    patch.priceMinor = priceInt;
  }

  if (updates.stock !== undefined) {
    const stockInt = Math.round(Number(updates.stock));
    if (isNaN(stockInt) || stockInt < 0) {
      const err: ApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Số lượng tồn kho phải là số nguyên không âm.',
        status: 400,
        timestamp: new Date().toISOString(),
      };
      throw err;
    }
    patch.stock = stockInt;
  }

  if (updates.description !== undefined) {
    patch.description = updates.description.trim();
  }
  if (updates.category !== undefined) {
    patch.category = updates.category;
  }
  if (updates.campusLocation !== undefined) {
    patch.campusLocation = updates.campusLocation;
  }

  // 5. Remote API call if configured
  if (isRemoteApiConfigured()) {
    try {
      const response = await apiClient.put<ListingItem>(
        `/listings/${listingId}`,
        patch,
        { requiresAuth: true }
      );
      if (response && response.id) {
        return response;
      }
    } catch (error) {
      if (!apiConfig.isMockFallbackEnabled) {
        throw error;
      }
    }
  }

  // 6. Local update
  await new Promise((resolve) => setTimeout(resolve, 300));
  const updatedListing: ListingItem = {
    ...listing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  MOCK_CATALOGUE_DATA[listingIndex] = updatedListing;

  const cache = await getCatalogueCache();
  if (cache && Array.isArray(cache.items)) {
    const cacheIdx = cache.items.findIndex((i) => i.id === listingId);
    if (cacheIdx !== -1) {
      cache.items[cacheIdx] = updatedListing;
      await saveCatalogueCache(cache);
    }
  }

  return updatedListing;
}
