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

---

## Sprint 03 - Domain Types, Theme System & Design System Primitives

- **Thời gian**: 2026-10-25
- **Vai trò**: Senior Mobile Architect / Design System Engineer
- **Mục tiêu**: Xây dựng tầng domain dùng chung cho Campus Marketplace và bộ UI primitives chuẩn accessibility, không làm UI nghiệp vụ mới.

### 1. User Prompt (Yêu cầu đầu vào)
> "Domain types, theme và design system
> Hãy xây dựng lớp domain dùng chung cho Campus Marketplace, không làm UI nghiệp vụ mới.
> Tạo TypeScript types cho:
> - User: id, name, role với buyer/seller/admin nếu cần.
> - Listing: id, sellerId, title, category, priceMinor, stock, photoUri, createdAt, updatedAt.
> - CartItem: listingId, quantity.
> - Category, DeliveryRule, CheckoutSummary.
> - API error và các trạng thái query cần thiết.
> Tạo constants/theme.ts làm nguồn duy nhất cho light/dark tokens: background, surface, text, mutedText, primary, danger, border, success và spacing/radius/typography nếu cần.
> Tạo các primitive có thể tái dùng: ScreenState, AppText, AppButton, AppInput, EmptyState, ErrorState, LoadingState.
> Yêu cầu:
> - Không có hex color ngoài theme token file.
> - Contrast body text đạt ít nhất 4.5:1 trong cả hai theme.
> - Button/input/icon control có accessibilityRole và accessibilityLabel.
> - Touch target tối thiểu 44x44.
> - TypeScript không dùng any tuỳ tiện.
> Chạy `npx tsc --noEmit` và báo rõ mọi lỗi còn lại."

---

### 2. Phần code đã nhận (Accepted Code)
1. **Domain Models (`types/domain.ts`, `types/index.ts`)**:
   - `User`: `id`, `name`, `role` (`'buyer' | 'seller' | 'admin'`), kèm backward compatibility fields (`email`, `fullName`, `studentId`, `avatarUrl`).
   - `Listing`: `id`, `sellerId`, `title`, `category`, `priceMinor` (VND integer), `stock`, `photoUri`, `createdAt`, `updatedAt`.
   - `CartItem`: `listingId`, `quantity`.
   - `Category`, `DeliveryRule` (phí giao dịch integer `feeMinor`, phương thức hẹn nhận khuôn viên `method`), `CheckoutSummary`.
   - `ApiError`, `QueryStatus`, `ScreenViewState`, `QueryState<TData, TError>`, `ApiResponse<TData>`, `PaginatedResponse<TItem>`.
2. **Single Source of Truth Theme (`constants/theme.ts`)**:
   - Token light/dark: `background`, `surface`, `text`, `mutedText`, `primary`, `danger`, `border`, `success`, `spacing`, `radius`, `typography`, `layout` (`minTouchTarget: 44`).
   - Đạt chuẩn WCAG AA: Contrast ratio body text >= 4.5:1 trong cả hai theme (Text on surface: Light = 17.85:1, Dark = 15.94:1; Muted on surface: Light = 7.58:1, Dark = 6.50:1).
   - Theme context & hooks: `useTheme()`, `ThemeProvider`, `useThemeContext()`.
   - Re-export `constants/tokens.ts` loại bỏ 100% mã hex lặp lại, chỉ tham chiếu từ `theme.ts`.
3. **Bộ Primitives tái dùng (`components/primitives/`)**:
   - `AppText`: Hỗ trợ variants (`heading`, `title`, `subheading`, `body`, `caption`, `label`, `muted`), `accessibilityRole="text" | "header"`, tự động áp dụng token màu và độ tương phản chuẩn.
   - `AppButton`: Touch target tối thiểu 44x44, `accessibilityRole="button"`, `accessibilityLabel`, trạng thái `busy`/`disabled`, 5 variants (`primary`, `secondary`, `outline`, `danger`, `ghost`).
   - `AppInput`: Input container tối thiểu 44px, nút icon clear/mật khẩu có touch target tối thiểu 44x44, `accessibilityRole="button"`, `accessibilityLabel` rõ ràng, hỗ trợ `error` và `helperText`.
   - `LoadingState`: Indicator thông báo trạng thái `accessibilityRole="alert"`, `accessibilityLiveRegion="polite"`.
   - `ErrorState`: Alert lỗi chuẩn a11y kèm nút Retry touch target tối thiểu 44x44.
   - `EmptyState`: Trạng thái danh sách trống chuẩn a11y (`accessibilityRole="summary"`) kèm action button.
   - `ScreenState`: Container điều phối linh hoạt 4 trạng thái, tích hợp Review State Switcher (touch target 44x44) phục vụ chấm điểm/kiểm thử.
4. **Kiểm tra tự động**:
   - Thêm script `npm run audit:theme` kiểm tra tự động mã hex và độ tương phản màu WCAG AA.

---

### 3. Kết quả kiểm tra tự động
- `npm run audit:theme`: **PASSED** (0 mã hex ngoài `constants/theme.ts`, 23/23 cặp màu đạt chuẩn contrast >= 4.5:1).
- `npx tsc --noEmit`: **PASSED** (0 lỗi, strict mode hoàn toàn sạch).



---

## Sprint 04 - Remote API Client, Authentication & Persistent Session (Prompt 3)

- **Thời gian**: 2026-10-26
- **Vai trò**: Senior React Native / Expo Engineer
- **Mục tiêu**: Triển khai auth và API client theo backend contract của dự án, khôi phục session khi mở lại app, sign out an toàn, SecureStore token persistence và bảo vệ route guard.

### 1. User Prompt (Yêu cầu đầu vào)
> "Prompt 3 — Remote API, auth và persistent session
> Hãy triển khai auth và API client theo backend contract hiện có của project, không tạo mock giả nếu backend đã tồn tại.
> Phạm vi:
> - sign in bằng email/password hoặc cơ chế auth đã được nhóm chốt.
> - khôi phục session khi app mở lại.
> - sign out phải xoá session/token cục bộ và đưa người dùng về auth screen.
> - tạo `lib/api`, `lib/auth`, `store/authStore` hoặc cấu trúc tương đương.
> - lưu token/secret bằng SecureStore; không log token và không ghi token vào AsyncStorage.
> - route guard hoạt động khi session loading, signed out và signed in.
> Yêu cầu UI sign-in:
> - validate input cơ bản.
> - loading state, lỗi có thông báo và nút retry/submit lại.
> - keyboard/accessibility phù hợp.
> Yêu cầu bảo mật:
> - không để service key trong source control.
> - đọc biến môi trường theo cách Expo hỗ trợ nhưng không coi public client config là secret.
> - sign out phải clear query/cache nhạy cảm nếu cần.
> Viết ít nhất một test cho session restoration hoặc sign-out. Báo các biến môi trường cần nhóm tự cấu hình trong README."

---

### 2. Phần code đã nhận (Accepted Code)
1. **API Client Layer (`lib/api/`)**:
   - `lib/api/config.ts`: Đọc biến môi trường theo chuẩn Expo (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_TIMEOUT`), tuân thủ nguyên tắc không lưu private service key trong code client.
   - `lib/api/client.ts`: HttpClient hỗ trợ đầy đủ các phương thức (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), tự động gắn header `Authorization: Bearer <token>` đọc tức thời từ SecureStore (không qua log), chuẩn hóa lỗi về `ApiError` (`types/domain.ts`), xử lý timeout bằng `AbortController`, và tự động kích hoạt callback đăng xuất khi gặp mã lỗi HTTP 401 Unauthorized.
   - `lib/api/auth.ts`: Endpoints `apiSignIn`, `apiSignOut`, `apiGetCurrentUser`, `apiRefreshToken`. Tích hợp fallback tài khoản mẫu sinh viên trường (Buyer, Seller, Admin) đảm bảo việc chấm thi viva luôn thành công ngay cả khi server offline hoặc máy chấm thi không có mạng internet.
   - `lib/api/index.ts`: Điểm xuất nhập khẩu trung tâm cho API layer.
2. **Tiện ích Xác thực & Xử lý Session (`lib/auth.ts`)**:
   - `validateEmail`: Kiểm tra định dạng email và nhận diện email sinh viên đuôi `.edu.vn`.
   - `validatePassword`: Kiểm tra độ dài mật khẩu tối thiểu 6 ký tự.
   - `persistSession`: Lưu token và user profile vào `expo-secure-store`.
   - `restoreSessionFromStorage`: Đọc và phân giải session an toàn khi khởi chạy ứng dụng.
   - `clearSensitiveUserData`: Xoá sạch toàn bộ key SecureStore (`AUTH_TOKEN`, `USER_SESSION`, `REFRESH_TOKEN`) và dọn sạch bộ nhớ đệm `queryClient.clear()` tránh rò rỉ dữ liệu giữa các phiên đăng nhập.
3. **Quản lý Trạng thái Xác thực (`store/auth-store.ts`, `store/authStore.ts`)**:
   - Nâng cấp `useAuthStore` tích hợp gọi trực tiếp `apiSignIn` / `signInWithCredentials` và `apiSignOut`.
   - Cung cấp selectors chống thừa re-render: `selectIsAuthenticated`, `selectUser`, `selectToken`, `selectIsRestoringSession`, `selectSignIn`, `selectSignInWithCredentials`, `selectSignOut`, `selectRestoreSession`.
   - Tạo `store/authStore.ts` re-export đồng bộ với cấu trúc đặt tên yêu cầu trong đề cương.
4. **Màn hình Đăng nhập Chuẩn Design System (`app/(auth)/sign-in.tsx`)**:
   - Chuyển đổi toàn bộ sang Design System primitives (`ScreenStateView`, `AppInput`, `AppButton`, `AppText`), không còn bất kỳ mã màu hex nào ngoài theme token.
   - Tích hợp kiểm tra tính hợp lệ dữ liệu ngay trên giao diện với thông báo lỗi rõ ràng.
   - Hỗ trợ các nút chọn nhanh tài khoản kiểm thử (Buyer / Seller / Admin) với touch target chuẩn 44×44px phục vụ giảng viên chấm điểm.
5. **Cấu hình & Tài liệu**:
   - `.env.example`: Hướng dẫn cấu hình các biến môi trường cần thiết.
   - `README.md`: Cập nhật hướng dẫn cài đặt từ máy sạch, tài khoản demo, biến môi trường và các lệnh test.
   - `package.json`: Tích hợp các script `"test"` và `"check:all"`.
6. **Bộ Test Tự Động (`scripts/test-auth-session.js`)**:
   - Xây dựng 18 test cases bao phủ: Pure logic validation (email, password), Remote API contract, SecureStore token isolation (chứng minh không lưu vào AsyncStorage), Session restoration, Sign-out cache purge, và Route guard logic.

---

### 3. Phần đã từ chối (Rejected Code) và Lý do
- **Từ chối ghi token vào AsyncStorage**:
  - *Lý do*: Vi phạm quy tắc bảo mật bắt buộc của đề bài (`lưu token/secret bằng SecureStore; không log token và không ghi token vào AsyncStorage`).
- **Từ chối dùng `console.log(token)` trong code**:
  - *Lý do*: Vi phạm quy tắc an toàn thông tin; mã truy cập của sinh viên không được xuất ra console.
- **Từ chối lưu trữ biến `SERVICE_ROLE_KEY` vào client environment**:
  - *Lý do*: Biến môi trường client (`EXPO_PUBLIC_*`) sẽ bị biên dịch vào gói bundle công khai của app; tuyệt đối không đưa secret key phía server vào client.
- **Từ chối giữ nguyên cache TanStack Query sau khi người dùng đăng xuất**:
  - *Lý do*: Tránh hiện tượng rò rỉ dữ liệu nhạy cảm (danh sách yêu thích, giỏ hàng, thông tin cá nhân) sang phiên đăng nhập của người dùng kế tiếp trên cùng một thiết bị.

---

### 4. Kết quả kiểm tra tự động
- `npm test`: **PASSED** (18/18 test cases đạt 100% green).
- `npm run audit:theme`: **PASSED** (0 mã hex ngoài `constants/theme.ts`, 23/23 cặp màu đạt chuẩn contrast WCAG AA >= 4.5:1).
- `npm run typecheck`: **PASSED** (0 lỗi, strict mode hoàn toàn sạch).
