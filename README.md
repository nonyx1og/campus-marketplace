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
# 1. Chạy toàn bộ 8 bộ kiểm thử tự động (157/157 tests green)
npm test

# 2. Chạy riêng bộ kiểm thử Seller/Buyer View & Backend Auth (Prompt 9)
npm run test:seller-buyer

# 3. Chạy riêng bộ kiểm thử Thông báo cục bộ giảm giá (Prompt 9)
npm run test:notifications

# 4. Chạy riêng bộ kiểm thử Pull-to-Refresh & Cache (Prompt 9)
npm run test:pull-to-refresh

# 5. Chạy riêng bộ kiểm thử Giỏ hàng & Tồn kho (Prompt 8)
npm run test:cart

# 6. Chạy riêng bộ kiểm thử Danh sách yêu thích (Prompt 7)
npm run test:favorites

# 7. Chạy riêng bộ kiểm thử Listing Detail & Nén ảnh (Prompt 6)
npm run test:listing

# 8. Chạy riêng bộ kiểm thử Tìm kiếm & Lọc danh mục (Prompt 5)
npm run test:filter

# 9. Kiểm tra tuân thủ mã màu Design Token và độ tương phản WCAG AA (>= 4.5:1)
npm run audit:theme

# 10. Kiểm tra tĩnh TypeScript strict
npm run typecheck

# 11. Chạy toàn bộ kiểm tra tổng thể cùng lúc
npm run check:all
```

---

## 6. PROMPT 9 — CÁC TÍNH NĂNG SHOULD HAVE ĐỂ VƯỢT MỐC 8

### 1. Phân tách Giao diện Seller / Buyer (Role-Based Detail View)
- **Tự động nhận diện vai trò**: Cùng một màn hình chi tiết sản phẩm (`app/(app)/listing/[id].tsx`), giao diện và các hành động tự động thích ứng theo vai trò tài khoản đăng nhập:
  - **Buyer View**: Hiển thị nút "Yêu thích" (❤️ / 🤍), nút "Thêm vào giỏ" (tự động khóa khi hết hàng `stock === 0`) và nút "Nhắn người bán".
  - **Seller View (Chủ tin đăng)**: Ẩn nút "Yêu thích" và "Thêm vào giỏ", hiển thị huy hiệu `🏷️ Tin đăng của bạn`, bổ sung bảng điều khiển Quản lý tồn kho với bộ đếm `[-] / [+]`, phím đặt nhanh `⚡ Đặt hết hàng (0)` và `⚡ Nhập thêm (+5)`.
- **Thực thi phân quyền tại Backend (Authorization Enforcement)**:
  - Backend API (`updateListingStock`, `updateListing` trong `lib/api/catalogue.ts`) thực thi kiểm tra chặt chẽ:
    - Chưa đăng nhập -> Trả về `401 UNAUTHORIZED`.
    - Người mua hoặc Người bán khác cố tình sửa kho hàng -> Trả về `403 FORBIDDEN`.
    - Số lượng kho âm -> Trả về `400 VALIDATION_ERROR`.
  - Có nút thử nghiệm `🛡️ Kiểm thử Backend 403` để chứng minh trên UI rằng backend thực sự từ chối yêu cầu trái phép.
- **Role Preview Switcher**: Hỗ trợ thanh chuyển đổi chế độ xem `Tự động | Người mua | Người bán` phục vụ chấm điểm viva nhanh chóng.

### 2. Thông báo Cục bộ Giảm Giá (Local Notification)
- **Theo dõi lịch sử giá**: Lưu vết giá sản phẩm yêu thích trong `AsyncStorage` (`campus_marketplace_favorite_prices`).
- **Phát hiện giảm giá tức thì**: Khi giá sản phẩm người dùng đã lưu giảm xuống, hệ thống tạo thông báo cục bộ kèm số tiền tiết kiệm được tính bằng số nguyên VND.
- **Quy tắc Chống Spam Tuyệt Đối**:
  - Khi giá sản phẩm không thay đổi -> Hoàn toàn không phát sinh thông báo lặp lại gây phiền toái.
  - Khi lưu sản phẩm lần đầu -> Chỉ ghi nhận mức giá cơ sở, không spam thông báo.
- **Quy trình Xin quyền Minh bạch & Xử lý Từ chối**:
  - Hiển thị banner xin quyền trên màn hình Yêu thích (`NotificationPermissionBanner`).
  - Khi người dùng bấm "Để sau (Từ chối)", trạng thái `denied` được ghi nhớ, không tiếp tục quấy rầy. Người dùng có thể bấm "Bật lại thông báo" bất cứ lúc nào.
  - Cung cấp nút `⚡ Mô phỏng giảm giá (Test Notif)` và `🔍 Quét giá (Test không spam)` cho giám khảo viva.
- **Giới hạn nền tảng (Platform Limitations)**:
  - Nền tảng Web: Sử dụng API trình duyệt `window.Notification` gửi thông báo desktop thực tế.
  - Nền tảng Mobile (Expo Go): Do xung đột peer dependency npm giữa React 19 và native package `expo-notifications`, hệ thống tích hợp Banner / In-App Alert chuyên dụng và lưu trữ lịch sử notification, đồng thời ghi rõ mã `TODO` kiến trúc cho bản build standalone EAS.

### 3. Kéo để Làm mới & Bảo toàn Cache (Pull-to-Refresh)
- **Hỗ trợ kéo làm mới mượt mà**: FlatList tích hợp `RefreshControl` chuẩn token màu primary.
- **Hiển thị thời gian cập nhật thành công**:
  - Thanh trạng thái `🕒 Cập nhật lần cuối: HH:mm:ss DD/MM/YYYY` hiển thị thời gian sau mỗi lần fetch thành công.
  - Không bị mất timestamp khi mạng chập chờn.
- **Bảo toàn Cache khi gặp lỗi (Cache Preservation on Error)**:
  - Khi kéo làm mới trong lúc mất mạng hoặc máy chủ ngoại tuyến, hệ thống bắt lỗi an toàn và hiển thị cảnh báo đỏ thân thiện.
  - **Toàn bộ danh sách sản phẩm và cache hiện tại được giữ nguyên vẹn 100%, không bị xóa trắng hay mất dữ liệu.**
  - Nút `⚡ Test Lỗi Refresh` trên thanh Demo giúp kiểm chứng tính năng bảo toàn cache chỉ với 1 chạm.
