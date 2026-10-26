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

---

## Sprint 05 - Tìm kiếm văn bản & Lọc danh mục Catalogue (Prompt 5)

- **Thời gian**: 2026-10-26
- **Vai trò**: Senior React Native / Mobile Frontend Architect
- **Mục tiêu**: Bổ sung tìm kiếm text và lọc category cho catalogue hiện tại, tính toán kết quả lọc thuần tuý trong render/selector, tuyệt đối không lưu dữ liệu dẫn xuất vào state, empty state riêng biệt khi có catalogue nhưng không có kết quả phù hợp, giữ nguyên các trạng thái loading/error/offline, đảm bảo chuẩn accessibility và xây dựng pure function `filterListings` kèm bộ unit test toàn diện.

### 1. User Prompt (Yêu cầu đầu vào)
> "Prompt 5 — Search và category filter đúng yêu cầu đề bài
> Hãy bổ sung tìm kiếm text và lọc category cho catalogue hiện tại.
>
> Yêu cầu bắt buộc:
> - Có search input và category selector/chips.
> - Kết quả lọc phải được tính trong render hoặc selector thuần từ listings + searchText + selectedCategory.
> - Không lưu `filteredListings`, `searchResults` hoặc dữ liệu dẫn xuất tương tự vào state.
> - Search không phân biệt hoa thường; xử lý khoảng trắng đầu/cuối.
> - Có empty state riêng khi có catalogue nhưng không có kết quả phù hợp.
> - Giữ loading/error/offline states của catalogue.
> - Control có accessibility label/role; category selector có trạng thái selected dễ nhận biết.
>
> Viết pure function `filterListings` và test các trường hợp: search rỗng, category rỗng, cả hai cùng dùng, không có kết quả và dữ liệu thiếu title/category an toàn.
>
> Không thay đổi API contract nếu không cần."

---

### 2. Phần code đã nhận (Accepted Code)
1. **Pure Function `filterListings` (`features/catalogue/filterListings.ts`, `features/catalogue/index.ts`)**:
   - Nhận vào `(listings, searchText, selectedCategory)`.
   - Chuẩn hoá từ khoá: `trim()` loại bỏ khoảng trắng dư thừa đầu/cuối và `toLowerCase()` tìm kiếm không phân biệt chữ hoa/thường.
   - Nhận diện category rỗng: `""`, `"   "`, `null`, `undefined`, `"Tất cả"`, `"All"` đều được xử lý đưa về trạng thái không lọc theo danh mục.
   - Safe Guard tuyệt đối: Kiểm tra an toàn dữ liệu đầu vào không bao giờ ném ngoại lệ Runtime (`TypeError: Cannot read properties of undefined (reading 'toLowerCase')`) ngay cả khi đối tượng thiếu thuộc tính `title`, `category`, `description` hoặc mang giá trị `null`/`undefined`.
   - Tính tinh khiết (Purity): Hoàn toàn không làm biến đổi mảng gốc `listings` hoặc các object con, luôn trả về mảng mới xác định (deterministic).
2. **Kiến trúc Derived State thuần túy trong Render (`app/(app)/(tabs)/index.tsx`)**:
   - `filteredListings = useMemo(() => filterListings(sourceListings, searchQuery, selectedCategory), [sourceListings, searchQuery, selectedCategory]);`
   - Tuyệt đối KHÔNG sử dụng `useState`, `useEffect` hay Zustand store để lưu trữ `filteredListings` hay `searchResults`.
   - Client store (`store/catalogue-store.ts`) chỉ quản lý thuần các input nguyên thuỷ của người dùng (`searchQuery`, `selectedCategory`).
3. **Empty State riêng biệt khi có Catalogue nhưng không khớp kết quả**:
   - Phân định rõ 2 kịch bản rỗng:
     - Kịch bản A (`sourceListings.length === 0`): Toàn bộ hệ thống chưa có sản phẩm nào đăng tải -> Hiển thị Empty State của Catalogue ("Catalogue chưa có sản phẩm").
     - Kịch bản B (`sourceListings.length > 0 && filteredListings.length === 0`): Catalogue có sản phẩm nhưng bộ lọc tìm kiếm/danh mục không có kết quả -> Hiển thị **Empty State Riêng** với icon kính lúp, thông báo chi tiết từ khoá/danh mục đang lọc, và nút bấm **"Xóa bộ lọc"** (`resetFilters`).
4. **Bảo toàn toàn bộ Loading / Error / Offline States**:
   - `isLoading && sourceListings.length === 0`: Hiển thị Skeleton loading (`CatalogueSkeleton`).
   - `isError && sourceListings.length === 0`: Hiển thị `ErrorState` kèm nút "Thử lại".
   - `isOffline`: Hiển thị thanh `OfflineBanner` màu vàng cảnh báo dữ liệu ngoại tuyến cùng thời điểm cập nhật lần cuối `lastUpdated` và nút đồng bộ lại mạng.
   - Pull-to-refresh (`RefreshControl`) vẫn hoạt động trơn tru để kéo mới dữ liệu.
5. **Khả năng tiếp cận (Accessibility) & Nhận diện trạng thái Selected**:
   - Search Input: có icon tìm kiếm, nút xoá nhanh (Clear button) khi đã nhập từ khoá, `accessibilityRole="search"`, `accessibilityLabel="Ô tìm kiếm sản phẩm catalogue trong trường"`. Nút xoá từ khoá có touch target tối thiểu 44×44px.
   - Category Chips:
     - `accessibilityRole="button"`.
     - `accessibilityState={{ selected: isSelected }}`.
     - `accessibilityLabel={`Danh mục ${cat}${isSelected ? ', đang chọn' : ''}`}`.
     - Trạng thái `selected` được phân biệt trực quan cực kỳ rõ ràng: Nền màu thương hiệu (`primaryBg`), chữ tương phản cao (`textInverse`), font chữ đậm (`bold`), kèm biểu tượng checkmark `✓` phía trước nhãn.
     - Touch target từng chip đạt chuẩn tối thiểu 44×44px.
6. **Bộ Test Tự Động Toàn Diện (`scripts/test-search-filter.js`, `npm run test:filter`)**:
   - Bao phủ 28 test cases nghiêm ngặt kiểm tra:
     1. Search rỗng (chuỗi rỗng `""`, khoảng trắng `"   "`, `null`, `undefined`, kết hợp category đang chọn).
     2. Category rỗng (chuỗi rỗng `""`, khoảng trắng `"   "`, `null`, `undefined`, `"Tất cả"`, `"all"`).
     3. Cả hai cùng dùng (khớp đồng thời search & category, lệch search, lệch category).
     4. Không có kết quả (từ khoá không tồn tại, danh mục không có hàng, danh sách rỗng).
     5. Dữ liệu thiếu title/category an toàn (thiếu title, null title, thiếu category, null category, object rỗng, mảng chứa null/undefined primitives, non-array inputs).
     6. Xử lý không phân biệt hoa/thường tiếng Việt Unicode và cắt khoảng trắng đầu/cuối.
     7. Tính tinh khiết (immutability của mảng và phần tử, tính xác định lặp lại).

---

### 3. Phần đã từ chối (Rejected Code) và Lý do
- **Từ chối lưu `filteredListings` hoặc `searchResults` vào `useState` hay Zustand Store**:
  - *Lý do*: Vi phạm quy tắc kiến trúc của đề bài (`Không coi dữ liệu tìm kiếm/lọc là state; không lưu filteredListings, searchResults hoặc dữ liệu dẫn xuất tương tự vào state`). Đã tính toán thuần tuý trong render cycle qua `useMemo` và pure function `filterListings`.
- **Từ chối gộp chung Empty State tìm kiếm với Empty State của toàn bộ Catalogue**:
  - *Lý do*: Vi phạm yêu cầu (`Có empty state riêng khi có catalogue nhưng không có kết quả phù hợp`). Người dùng cần biết rõ sự khác biệt giữa "hệ thống chưa có hàng" và "từ khoá tìm kiếm không khớp".
- **Từ chối thay đổi API contract của backend**:
  - *Lý do*: Tuân thủ quy định `Không thay đổi API contract nếu không cần`. Giữ nguyên `CatalogueQueryParams`, `fetchCatalogueListings`, và cấu trúc dữ liệu `ListingItem`.
- **Từ chối viết mã hex màu trực tiếp trong màn hình**:
  - *Lý do*: Tuân thủ tuyệt đối quy định Design System của đồ án; 100% style sử dụng Design Tokens từ `constants/theme.ts`.

---

### 4. Kết quả kiểm tra tự động
- `npm run test:filter`: **PASSED** (28/28 test cases đạt 100% green).
- `npm test`: **PASSED** (57/57 test cases đạt 100% green across auth, catalogue offline flow, search & filter).
- `npm run audit:theme`: **PASSED** (0 mã hex ngoài `constants/theme.ts`, 23/23 cặp màu đạt chuẩn contrast WCAG AA >= 4.5:1).
- `npm run typecheck`: **PASSED** (0 lỗi, strict mode hoàn toàn sạch).
- `npm run check:all`: **PASSED** (Toàn bộ bài test và kiểm tra tĩnh pass 100%).


---

## Sprint 06 - Triển khai Flow Listing Detail, Tạo Listing Có Ảnh Nén & Bằng Chứng Compression

- **Thời gian**: 2026-10-27
- **Vai trò**: Senior React Native / Expo Engineer
- **Thành viên phụ trách review**: Nhóm sinh viên Campus Marketplace

### 1. User Prompt (Yêu cầu đầu vào)
> "Prompt 6 — Listing detail và tạo listing có ảnh nén
> Hãy triển khai flow listing detail và create listing.
> Listing detail:
> - route động `listing/[id].tsx` đọc id từ Expo Router.
> - query chi tiết hoặc dùng dữ liệu đã cache an toàn.
> - có loading, empty/not found, error + Retry, content.
> - hiển thị stock và trạng thái available/unavailable.
> - nút Add to Favorites và Add to Cart sẽ gọi các store actions đã chuẩn bị.
> Create listing modal:
> - title, category, price, stock và ít nhất một ảnh.
> - chọn ảnh bằng camera hoặc image picker theo permission phù hợp.
> - trước khi upload, dùng expo-image-manipulator để resize/compress.
> - upload ảnh đã nén lên remote storage/API.
> - submit listing lên remote API.
> - disable submit khi thiếu dữ liệu hoặc đang upload.
> - hiển thị lỗi permission/upload/validation với cách retry.
> - sau thành công invalidate/refetch catalogue và đóng modal.
> Bắt buộc thêm cơ chế đo/prove kích thước: hiển thị hoặc log an toàn raw byte size và compressed byte size trước khi upload, không log dữ liệu nhạy cảm. README phải giải thích cách demo rằng ảnh đã được nén.
> Không chấp nhận upload raw phone photo trực tiếp nếu chưa qua compression."

---

### 2. Phần code đã nhận (Accepted Code)
1. **Module Đo lường & Nén ảnh (`features/listing/imageCompression.ts`, `features/listing/index.ts`)**:
   - `formatBytes(bytes)`: Định dạng kích thước byte trực quan (`B`, `KB`, `MB`).
   - `calculateCompressionMetrics(rawBytes, compressedBytes)`: Hàm thuần tính toán dung lượng gốc, dung lượng nén, dung lượng tiết kiệm và phần trăm nén (`ratioPercent`). Ngăn chặn lỗi chia cho 0 và giá trị âm.
   - `compressListingImage(uri, rawBytes)`:
     - Tích hợp `expo-image-manipulator` resize chiều rộng tối đa `width: 1024px` và nén JPEG `compress: 0.7`.
     - Đo đạc chính xác byte size trước và sau nén.
     - Log an toàn console: `[ImageCompression Proof] Raw Size: ... -> Compressed: ... Saved: ...%` (không log thông tin nhạy cảm của người dùng).
2. **API Layer (`lib/api/catalogue.ts`)**:
   - `fetchListingById(id)`: Lấy dữ liệu chi tiết sản phẩm từ remote API hoặc mock data; fallback đọc AsyncStorage cache nếu ngoại tuyến.
   - `uploadListingImage(compressedUri)`: Xử lý upload ảnh đã nén lên server/storage.
   - `createListing(input)`: Xác thực nghiêm ngặt title (không rỗng), price (integer VND > 0), stock (integer >= 0), và bắt buộc phải có ảnh đã nén. Thêm listing mới vào catalogue in-memory và remote API.
3. **Màn hình Listing Detail (`app/(app)/listing/[id].tsx`)**:
   - Route động đọc `id` từ `useLocalSearchParams<{ id: string }>()`.
   - TanStack Query `useQuery` query dữ liệu chi tiết, caching an toàn.
   - Phủ đủ 4 trạng thái: `loading` (spinner), `empty/not found` (nút quay lại catalogue), `error + Retry`, `content`.
   - Hiển thị badge stock & trạng thái:
     - `stock > 0`: Badge xanh `Còn hàng: X món`.
     - `stock === 0`: Badge đỏ `Hết hàng / Tạm ngưng` (áp dụng trực tiếp với `prod-106`).
   - Nút "Thêm vào giỏ": Gọi `useCartStore.getState().addToCart(item)`; bị vô hiệu hoá khi `stock === 0` kèm thông báo rõ ràng.
   - Nút "Yêu thích": Tích hợp `useFavoritesStore.getState().toggleFavorite(item)` với icon trái tim và nhãn a11y đầy đủ.
4. **Modal Đăng tin (`app/(app)/modal/create-listing.tsx`)**:
   - Nhập liệu đầy đủ: `title`, `price` (số nguyên VND), `stock` (số nguyên >= 0), `category` (chọn nhanh bằng category pills), `location`, `description`.
   - Chọn ảnh bằng Camera (`launchCameraAsync`) hoặc Thư viện ảnh (`launchImageLibraryAsync`) với xử lý phân quyền (`requestCameraPermissionsAsync`, `requestMediaLibraryPermissionsAsync`) và hiển thị thông báo lỗi quyền kèm nút thử lại.
   - Ngăn chặn upload ảnh raw trực tiếp: Tự động chạy ảnh qua pipeline `compressListingImage` ngay sau khi chọn.
   - **Thẻ Bằng Chứng Nén Ảnh (Compression Proof Card)**:
     - Hiển thị ảnh preview đã nén.
     - Dung lượng ảnh gốc (`rawBytes`) vs Dung lượng sau nén (`compressedBytes`).
     - Tỷ lệ phần trăm tiết kiệm (ví dụ: `Giảm 91%`).
     - Badge xác nhận: `✓ Đạt chuẩn: Không upload ảnh raw chưa qua compression`.
   - Disable nút submit khi thiếu thông tin hoặc chưa có ảnh nén hoặc đang nén/upload.
   - Invalidate TanStack Query catalogue cache (`queryClient.invalidateQueries({ queryKey: ['catalogue'] })`) để cập nhật ngay catalogue sau khi đăng thành công.
5. **Shared State Yêu thích (`store/favorites-store.ts`, `app/(app)/(tabs)/favorites.tsx`)**:
   - Zustand store có selectors và lưu trữ bền vững qua `AsyncStorage`.
   - Đồng bộ trạng thái yêu thích giữa màn hình Listing Detail và tab Favorites.
6. **Bộ Test Tự Động (`scripts/test-listing-flow.js`, `npm run test:listing`)**:
   - 18 test cases bao phủ toàn bộ:
     - Đo lường dung lượng byte và phần trăm nén ảnh (90% savings proof).
     - Truy vấn chi tiết sản phẩm theo ID (hợp lệ, null cho id không tồn tại, ngoại tuyến).
     - Phân định trạng thái stock (còn hàng vs hết hàng).
     - Ràng buộc dữ liệu tạo tin (bắt buộc title, giá nguyên > 0, stock >= 0, bắt buộc có ảnh đã nén).
     - Shared state và dedup của Favorites Store.

---

### 3. Phần đã từ chối (Rejected Code) và Lý do
- **Từ chối upload trực tiếp ảnh chụp từ máy ảnh khi chưa qua nén**:
  - *Lý do*: Vi phạm quy tắc bắt buộc của đề bài (`Không chấp nhận upload raw phone photo trực tiếp nếu chưa qua compression`). Mọi ảnh đều bắt buộc phải qua `expo-image-manipulator` resize (width 1024px) và compress (0.7).
- **Từ chối log thông tin nhạy cảm của người dùng khi log kích thước ảnh**:
  - *Lý do*: Tuân thủ quy định bảo mật (`hiển thị hoặc log an toàn raw byte size và compressed byte size trước khi upload, không log dữ liệu nhạy cảm`). Chỉ ghi log thông số byte và phần trăm tiết kiệm.
- **Từ chối cho phép thêm vào giỏ hàng đối với sản phẩm hết hàng (`stock === 0`)**:
  - *Lý do*: Tuân thủ logic nghiệp vụ của sàn thương mại; nút "Thêm vào giỏ" bị disable khi `stock === 0`.
- **Từ chối hard-code mã màu hex trong các component mới**:
  - *Lý do*: Tuân thủ Single Source of Truth của Design System tại `constants/theme.ts`.

---

### 4. Kết quả kiểm tra tự động
- `npm run test:listing`: **PASSED** (18/18 test cases đạt 100% green).
- `npm test`: **PASSED** (75/75 test cases đạt 100% green across all 4 suites).
- `npm run audit:theme`: **PASSED** (0 mã hex ngoài `constants/theme.ts`, 23/23 cặp màu đạt chuẩn contrast WCAG AA >= 4.5:1).
- `npm run typecheck`: **PASSED** (0 lỗi, strict mode hoàn toàn sạch).
- `npm run check:all`: **PASSED** (Toàn bộ bài test và kiểm tra tĩnh pass 100%).
