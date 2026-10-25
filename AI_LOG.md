# Nhật ký AI (AI_LOG.md) - Đồ án Campus Marketplace

## Sprint 01 - Khởi tạo Skeleton Kiến trúc Nền tảng (Expo SDK 58, TypeScript Strict, Expo Router)

- **Thời gian**: 2026-10-25
- **Vai trò**: Senior React Native / Expo Engineer
- **Thành viên phụ trách review**: Nhóm sinh viên Campus Marketplace

### 1. User Prompt (Yêu cầu đầu vào)
> "Dựa trên quy tắc chung, hãy khởi tạo skeleton cho Campus Marketplace bằng Expo SDK 56+, TypeScript strict và Expo Router.
> Tạo route tối thiểu:
> - app/(auth)/sign-in.tsx
> - app/(app)/(tabs)/index.tsx — catalogue
> - app/(app)/(tabs)/favorites.tsx
> - app/(app)/(tabs)/cart.tsx
> - app/(app)/listing/[id].tsx — dynamic route
> - app/(app)/modal/create-listing.tsx — modal route
> - app/+not-found.tsx
> Tạo App layout có loading trong khi khôi phục session và route protection giữa auth/app. Chưa cần hoàn thiện business logic.
> Yêu cầu: Có navigation hoạt động trên iOS/Android; Không dùng class component; Mỗi placeholder screen đã có đủ bốn nhánh loading, empty, error có nút Retry, content để làm mẫu; Tạo thư mục rõ ràng cho components, features, lib, store, types, constants; Bật TypeScript strict; Không hard-code màu trong screen.
> Trước khi kết thúc, hãy liệt kê file tạo mới, lệnh chạy, và các điểm nhóm phải review bằng tay."

---

### 2. Phần code đã nhận (Accepted Code)
1. **Thiết lập dự án & cấu hình**:
   - `package.json`: Tích hợp Expo SDK 58, Expo Router, `@tanstack/react-query`, `zustand`, `expo-secure-store`, `@expo/vector-icons`.
   - `app.json`: Cấu hình routing scheme `campusmarketplace`, plugins `expo-router` và `expo-secure-store`.
   - `tsconfig.json`: Kích hoạt `strict: true`, path alias `@/*`.
2. **Hệ thống Design Tokens**:
   - `constants/tokens.ts`: Tập trung 100% mã màu (`Colors`), khoảng cách (`Spacing`), kích thước font (`Typography`), bo góc (`BorderRadius`) và kích thước cảm ứng tối thiểu `minTouchTarget: 44`.
3. **Tiện ích & Quản lý trạng thái (State & Libs)**:
   - `lib/currency.ts`: Hàm tính toán & định dạng tiền VND số nguyên (integer), tuyệt đối không dùng floating-point.
   - `lib/secure-store.ts`: Wrapper lưu trữ an toàn session/token/secret với typed keys theo đúng quy tắc bảo mật.
   - `lib/query-client.ts`: Cấu hình `@tanstack/react-query` offline-first cache dài hạn (`gcTime: 24h`, `staleTime: 5m`).
   - `store/auth-store.ts`: Zustand store quản lý xác thực kèm session restore từ SecureStore và **selectors** chống thừa re-render.
   - `store/cart-store.ts`: Zustand store giỏ hàng sinh viên với selectors và tính toán tiền integer.
   - `types/auth.ts`, `types/listing.ts`: Strict types cho User, ListingItem, ScreenViewState.
4. **Components cốt lõi**:
   - `components/common/Button.tsx`: Đảm bảo `accessibilityRole="button"`, `accessibilityLabel`, touch target tối thiểu 44x44, dùng token màu.
   - `components/common/ScreenStateView.tsx`: Chuẩn hóa 4 trạng thái bắt buộc (`loading`, `empty`, `error` có nút Retry, `content`) kèm thanh Review State Switcher giúp nhóm/giảng viên chuyển đổi nhanh trạng thái để chấm điểm.
5. **Cấu trúc Navigation & Screens**:
   - `app/_layout.tsx`: Root Layout chứa `QueryClientProvider`, tự động khôi phục session từ SecureStore, hiển thị màn hình loading khởi tạo, và bảo vệ phân quyền chuyển hướng (Route Protection) giữa `(auth)` và `(app)`.
   - `app/(auth)/_layout.tsx`: Stack navigator cho auth.
   - `app/(auth)/sign-in.tsx`: Màn hình đăng nhập sinh viên (.edu.vn), mẫu 4 trạng thái, lưu token vào SecureStore.
   - `app/(app)/_layout.tsx`: Stack navigator cho app chính, cấu hình dynamic route và presentation modal.
   - `app/(app)/(tabs)/_layout.tsx`: Tab navigator 3 tab chuẩn a11y và token màu.
   - `app/(app)/(tabs)/index.tsx`: Catalogue catalogue offline-first, dữ liệu tìm kiếm/lọc được tính toán dẫn xuất (derived) từ `sourceData` + `inputs` qua `useMemo`, hiển thị tiền integer VND.
   - `app/(app)/(tabs)/favorites.tsx`: Màn hình yêu thích với 4 trạng thái.
   - `app/(app)/(tabs)/cart.tsx`: Màn hình giỏ hàng với 4 trạng thái và Zustand selectors.
   - `app/(app)/listing/[id].tsx`: Dynamic route xem chi tiết sản phẩm.
   - `app/(app)/modal/create-listing.tsx`: Modal route đăng tin bán đồ dùng sinh viên mới.
   - `app/+not-found.tsx`: Màn hình xử lý 404 thân thiện.
   - `features/README.md`: Hướng dẫn cấu trúc phân bổ module domain.

---

### 3. Phần đã từ chối (Rejected Code) và Lý do
- **Từ chối lưu trữ token trong AsyncStorage / Context API thường**:
  - *Lý do*: Vi phạm quy tắc bảo mật bắt buộc của đồ án (`Session/token/secret chỉ được lưu bằng SecureStore`). Đã chuyển sang dùng `expo-secure-store` và sync vào Zustand store.
- **Từ chối tạo thêm state trung gian `filteredList` dạng `useState` trong màn hình Catalogue**:
  - *Lý do*: Vi phạm quy tắc số 6 (`Không coi dữ liệu tìm kiếm/lọc là state dẫn xuất; phải tính từ source data và input hiện tại`). Đã dùng `useMemo` tính trực tiếp từ `catalogueData`, `searchQuery` và `selectedCategory`.
- **Từ chối hardcode mã hex `#...` trong file screen/component**:
  - *Lý do*: Vi phạm quy tắc token màu (`Màu phải lấy từ một token file; không viết hex ngoài token file`). Toàn bộ style chỉ truy cập qua `Tokens.colors.*`.
- **Từ chối dùng kiểu số thực (`float`) cho giá bán**:
  - *Lý do*: Tránh lỗi làm tròn tiền tệ; toàn bộ giá bán được chuẩn hóa `integer` VND qua `lib/currency.ts`.
- **Xóa bỏ `App.tsx` và `index.ts` mẫu của template ban đầu**:
  - *Lý do*: Dự án dùng Expo Router file-based routing (`main: "expo-router/entry"`), tránh xung đột điểm khởi chạy.

---

### 4. Kết quả kiểm tra tự động
- `npx tsc --noEmit`: **PASSED** (0 lỗi, chế độ `strict: true`).
- Kiểm tra mã màu hex ngoài token: **PASSED** (0 mã hex ngoài `constants/tokens.ts`).

---

## Sprint 02 - Đưa mã nguồn lên Remote Repository GitHub

- **Thời gian**: 2026-10-25
- **Thành viên yêu cầu**: Nhóm đồ án Campus Marketplace
- **Remote Repo**: `https://github.com/nonyx1og/campus-marketplace`

### 1. User Prompt (Yêu cầu đầu vào)
> "https://github.com/nonyx1og/campus-marketplace đưa nó lên trang git này và ghi commnit là bảo"

### 2. Phần code đã nhận (Accepted Code)
- Khởi tạo local Git repository với branch mặc định `main`.
- Thêm remote `origin` trỏ về `https://github.com/nonyx1og/campus-marketplace.git`.
- Tạo commit với message `"bảo"`.
- Đẩy toàn bộ source code sạch (loại trừ `node_modules` theo `.gitignore`) lên branch `main`.

### 3. Phần đã từ chối (Rejected Code) và Lý do
- **Không commit thư mục `node_modules` hay `.expo`**:
  - *Lý do*: Thư mục thư viện cài đặt và file cache phát sinh phải được loại trừ bằng `.gitignore`.

---

## Sprint 02.1 - Cập nhật thông tin Author commit chính chủ

- **Thời gian**: 2026-10-25
- **Yêu cầu**: Cập nhật Author commit chính chủ GitHub: `Zerolexs <tienbaoluu@gmail.com>` để hiển thị đúng avatar và username trên GitHub.
- **Thực hiện**:
  - Thiết lập local git config `user.name "Zerolexs"` và `user.email "tienbaoluu@gmail.com"`.
  - Thực hiện `git commit --amend --author="Zerolexs <tienbaoluu@gmail.com>"` giữ nguyên commit message `"bảo"`.
  - Force push cập nhật branch `main` lên repository: `https://github.com/nonyx1og/campus-marketplace`.

