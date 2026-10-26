# Campus Marketplace 🎓

Đồ án học phần **Lập trình Thiết bị Di động (TH7011101)**  
Sàn giao dịch đồ dùng sinh viên an toàn trong khuôn viên trường đại học (tập trung vào sách giáo trình, dụng cụ học tập và thiết bị phòng trọ).

---

## 1. Công nghệ sử dụng & Kiến trúc nền tảng

- **Mobile Framework**: Expo SDK 58+, React Native 0.88, React 19 (Function components & Hooks).
- **Navigation**: Expo Router (File-based Routing, Route Groups `(auth)` / `(app)`, Dynamic Route `listing/[id]`, Modal Route `modal/create-listing`, `+not-found.tsx`).
- **Ngôn ngữ**: TypeScript ở chế độ `strict: true`, không dùng `any` tuỳ tiện.
- **Server Data Caching**: TanStack Query (`@tanstack/react-query`) cấu hình offline-first dài hạn.
- **Shared Client State**: Zustand với **selectors** chống thừa re-render.
- **Bảo mật lưu trữ**: `expo-secure-store` lưu trữ token/session/refresh-token. Tuyệt đối không log token và không lưu token vào `AsyncStorage`.
- **Hệ thống Design Token**: `constants/theme.ts` là Single Source of Truth; 0 mã màu hex ngoài token file; đạt chuẩn tương phản WCAG AA >= 4.5:1 cho cả Light và Dark mode. Touch target tối thiểu 44×44px cho mọi nút bấm và ô nhập liệu.

---

## 2. Hướng dẫn cài đặt & Khởi chạy từ máy sạch

### Yêu cầu môi trường
- Node.js >= 20.x
- npm >= 10.x
- Ứng dụng Expo Go (Android / iOS) hoặc trình giả lập

### Các bước cài đặt
```bash
# 1. Clone mã nguồn
git clone https://github.com/nonyx1og/campus-marketplace.git
cd campus-marketplace

# 2. Cài đặt thư viện dependencies
npm install --legacy-peer-deps

# 3. Thiết lập biến môi trường
cp .env.example .env

# 4. Khởi chạy ứng dụng Expo
npm start
```

---

## 3. Cấu hình Biến Môi Trường (Environment Variables)

Hệ thống đọc cấu hình qua các biến môi trường chuẩn của Expo (`EXPO_PUBLIC_*`). Nhóm cấu hình trong file `.env`:

| Tên biến | Mặc định | Ý nghĩa |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | `https://api.campusmarketplace.edu.vn/api/v1` | URL gốc của remote API backend |
| `EXPO_PUBLIC_API_TIMEOUT` | `15000` | Thời gian chờ tối đa cho request (ms) |
| `EXPO_PUBLIC_ENABLE_MOCK_FALLBACK` | `true` | Cho phép dùng tài khoản mẫu khi server trường offline/chưa bật |

> **LƯU Ý BẢO MẬT BẮT BUỘC**:  
> Các biến `EXPO_PUBLIC_*` được nhúng trực tiếp vào bundle JavaScript client của app di động. **Tuyệt đối KHÔNG đưa Service Role Key, Database Secret hoặc Private API Key vào file `.env` hoặc mã nguồn client!**

---

## 4. Tài khoản kiểm thử nhanh (Demo Viva / Chấm điểm)

Trên màn hình Đăng nhập (`app/(auth)/sign-in.tsx`), ứng dụng đã tích hợp sẵn các nút chọn nhanh tài khoản với phân quyền rõ ràng:

| Vai trò | Email đăng nhập | Mật khẩu | Mục đích kiểm thử |
| :--- | :--- | :--- | :--- |
| **Người mua (Buyer)** | `sinhvien@campus.edu.vn` | `password123` | Xem catalogue, lọc sách, giỏ hàng, checkout |
| **Người bán (Seller)** | `seller@campus.edu.vn` | `password123` | Tạo bài đăng, quản lý hàng hoá, xem tin đã đăng |
| **Quản trị viên (Admin)** | `admin@campus.edu.vn` | `adminpassword` | Quản lý kiểm duyệt danh mục đồ dùng trường |

---

## 5. Các lệnh kiểm tra & Bộ Test tự động

```bash
# 1. Chạy bộ kiểm thử tự động (Pure Logic, Auth Contract, Session Restore, Sign Out, Route Guard, Catalogue Offline, Search & Filter)
npm test

# 2. Chạy riêng bộ kiểm thử tính năng Tìm kiếm & Lọc Category (Prompt 5)
npm run test:filter

# 3. Kiểm tra tuân thủ mã màu Design Token và độ tương phản WCAG AA (>= 4.5:1)
npm run audit:theme

# 4. Kiểm tra tĩnh TypeScript strict
npm run typecheck

# 5. Chạy toàn bộ kiểm tra tổng thể cùng lúc
npm run check:all
```
