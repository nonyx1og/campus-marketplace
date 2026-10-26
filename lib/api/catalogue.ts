import { apiClient } from './client';
import { apiConfig, isRemoteApiConfigured } from './config';
import { ListingItem, CatalogueQueryParams } from '@/types/listing';
import { PaginatedResponse, ApiError } from '@/types/domain';

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
    sellerId: 'usr-002',
    sellerName: 'Lê Hoàng Nam',
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
