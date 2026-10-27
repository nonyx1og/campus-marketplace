import { DeliveryRule } from '@/types/domain';

export const DORM_FREE_SHIPPING_THRESHOLD = 100000; // 100,000 VND integer threshold
export const CAMPUS_PICKUP_FREE_THRESHOLD = 50000;   // 50,000 VND integer threshold

export const CAMPUS_DELIVERY_RULES: DeliveryRule[] = [
  {
    id: 'direct_meetup',
    name: 'Hẹn gặp trong khuôn viên (Thư viện / Canteen)',
    method: 'direct_meetup',
    feeMinor: 0,
    campusLocationRequired: false,
    description: 'Gặp trực tiếp bạn học tại sảnh thư viện hoặc canteen, 100% miễn phí.',
    estimatedMinutes: 15,
  },
  {
    id: 'dorm_delivery',
    name: 'Giao tận Ký túc xá sinh viên',
    method: 'dorm_delivery',
    feeMinor: 10000,
    campusLocationRequired: true,
    description: 'Hỗ trợ giao tận sảnh KTX sinh viên (Miễn phí từ 100.000đ).',
    estimatedMinutes: 30,
  },
  {
    id: 'campus_pickup',
    name: 'Nhận tại Trạm đồ sinh viên tự quản',
    method: 'campus_pickup',
    feeMinor: 5000,
    campusLocationRequired: false,
    description: 'Gửi đồ tại tủ đồ thông minh khu tự học (Miễn phí từ 50.000đ).',
    estimatedMinutes: 20,
  },
];

export const DEFAULT_DELIVERY_RULE: DeliveryRule = CAMPUS_DELIVERY_RULES[0];

export function findDeliveryRuleById(id: string): DeliveryRule {
  return CAMPUS_DELIVERY_RULES.find((rule) => rule.id === id) || DEFAULT_DELIVERY_RULE;
}
