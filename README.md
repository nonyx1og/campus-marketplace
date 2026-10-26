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
# 1. Chạy bộ kiểm thử tự động (Pure Logic, Auth, Session, Catalogue Offline, Search & Filter, Listing Detail & Create Listing)
npm test

# 2. Chạy riêng bộ kiểm thử Listing Detail, Nén ảnh & Tạo tin đăng (Prompt 6)
npm run test:listing

# 3. Chạy riêng bộ kiểm thử tính năng Tìm kiếm & Lọc Category (Prompt 5)
npm run test:filter

# 4. Kiểm tra tuân thủ mã màu Design Token và độ tương phản WCAG AA (>= 4.5:1)
npm run audit:theme

# 5. Kiểm tra tĩnh TypeScript strict
npm run typecheck

# 6. Chạy toàn bộ kiểm tra tổng thể cùng lúc
npm run check:all
```

---

## 6. Hướng dẫn Demo Tính năng Nén ảnh trước khi Upload (Prompt 6)

### Cơ chế kỹ thuật bắt buộc:
1. **Pipeline nén chuẩn**: Sử dụng `expo-image-manipulator` để xử lý resize kích thước (tối đa chiều ngang `width: 1024px`) và nén JPEG chất lượng `compress: 0.7`.
2. **Quy tắc tuyệt đối**: Không chấp nhận tải ảnh raw nguyên bản từ camera điện thoại (thường 2MB – 10MB) lên server. Nút submit bị vô hiệu hoá (`disabled`) cho đến khi ảnh đã qua xử lý nén thành công.
3. **Đo lường & Bằng chứng minh bạch**:
   - Tự động đo kích thước byte thực tế trước nén (`rawBytes`) và sau nén (`compressedBytes`).
   - Hiển thị bảng thông số nén **Compression Proof Card** ngay trên màn hình đăng tin để giám khảo và người dùng quan sát trực quan.
   - Ghi log an toàn ra console terminal:
     `[ImageCompression Proof] Raw Size: 2.29 MB (2400000 bytes) -> Compressed: 234.4 KB (240000 bytes). Saved: 90%. Output: 1024x768px.`
     *(Chỉ log kích thước byte và tỉ lệ tiết kiệm, tuyệt đối không log token, mật khẩu hay dữ liệu nhạy cảm)*.

### Các bước thực hiện Demo chấm điểm:
1. Mở ứng dụng, vào tab **Sản phẩm (Catalogue)**.
2. Bấm nút **"+ Đăng tin"** trên thanh tiêu đề để mở modal `app/(app)/modal/create-listing.tsx`.
3. Bấm **"Thư viện ảnh"** (hoặc **"Chụp ảnh mới"**): 
   - Ứng dụng yêu cầu quyền truy cập media/camera (có xử lý báo lỗi permission rõ ràng nếu bị từ chối).
   - Chọn một bức ảnh chụp từ thiết bị.
4. Quan sát thẻ **"✓ Bằng chứng nén ảnh (Compression Proof)"** xuất hiện:
   - Hiển thị rõ: **Dung lượng gốc** (ví dụ: `2.4 MB`) $\rightarrow$ **Dung lượng sau nén** (ví dụ: `215 KB`), **Tỷ lệ tiết kiệm** (ví dụ: `Giảm 91%`).
   - Badge kiểm định màu xanh: `✓ Đạt chuẩn: Không upload ảnh raw chưa qua compression`.
5. Điền thông tin: Tên sản phẩm, giá bán VND (số nguyên), số lượng tồn kho (>= 0), danh mục, địa điểm nhận hàng.
6. Bấm **"Đăng tin ngay"**:
   - Ứng dụng tải ảnh nén lên server/storage và gửi dữ liệu listing.
   - Sau khi tạo thành công, tự động gọi `queryClient.invalidateQueries({ queryKey: ['catalogue'] })` và đóng modal.
   - Tin đăng mới lập tức xuất hiện ở vị trí đầu tiên của Catalogue với ảnh nén sắc nét và thông tin đầy đủ.
7. Bấm vào tin vừa đăng (hoặc bất kỳ sản phẩm nào như `prod-101`, `prod-106`) để vào màn hình **Listing Detail (`listing/[id].tsx`)**:
   - Xem đầy đủ 4 trạng thái (loading, content, empty, error có nút thử lại).
   - Kiểm tra hiển thị trạng thái stock: sản phẩm có hàng hiển thị badge xanh `Còn hàng`, sản phẩm `prod-106` hiển thị badge đỏ `Hết hàng / Tạm ngưng` và nút "Thêm vào giỏ" bị vô hiệu hoá.
   - Bấm nút **"Yêu thích"** (icon trái tim): trạng thái lập tức đồng bộ sang tab **Yêu thích (Favorites)** thông qua shared store Zustand.
