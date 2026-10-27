# Nhật Ký Làm Việc Cùng Trí Tuệ Nhân Tạo (AI_LOG.md)
> **Dự án**: Sàn Giao Dịch Đồ Dùng Sinh Viên — Campus Marketplace  
> **Học phần**: Lập trình Thiết bị Di động (TH7011101)  
> **Nguyên tắc ghi chép**: Ghi chép trung thực, minh bạch 100% lịch sử tương tác AI; không bịa đặt lịch sử; không ghi rằng con người tự viết nếu thực tế có AI hỗ trợ.

---

## PHẦN I: TỔNG QUAN PHÂN CÔNG THÀNH VIÊN & THEO DÕI ĐÓNG GÓP

| STT | MSSV | Họ và tên | GitHub & Email | Vai trò phân công chính | Các Sprint & Prompt phụ trách |
| :---: | :---: | :--- | :--- | :--- | :--- |
| 1 | `1923050409` | **Nguyễn Thành Long** | [@nonyx1og](https://github.com/nonyx1og)<br>`nguyentlong9305@gmail.com` | **Nhóm trưởng & Backend/Flow Lead**: Phụ trách Remote API client, Xác thực & khôi phục phiên SecureStore, Dynamic Route Listing Detail, Create Listing Modal có ảnh nén & Thẻ bằng chứng compression, Giỏ hàng & Tồn kho, Delivery Rules, 4-States Audit. | - **Sprint 04** (Prompt 3 - Auth & SecureStore)<br>- **Sprint 06** (Prompt 6 - Listing Detail & Image Compression)<br>- **Sprint 08** (Prompt 8 - Cart, Stock Rules & Delivery Rules)<br>- **Sprint 10** (Prompt 10 - 4 States & A11y Audit Checklist) |
| 2 | `1923040479` | **Lưu Tiến Bảo** | [@Zerolexs](https://github.com/Zerolexs)<br>`tienbaoluu@gmail.com` | **Mobile Architect & Testing Lead**: Phụ trách Khởi tạo kiến trúc Expo Router, Routing groups, Favourites Zustand store & selectors, Đồng bộ 2 màn hình, Role-based Seller/Buyer view, Local notifications giảm giá, Pull-to-refresh & bảo tồn cache, Automated test suites & Fix lint. | - **Sprint 01 & 02** (Khởi tạo Skeleton kiến trúc Expo Router & Git setup)<br>- **Sprint 07** (Prompt 7 - Favourites Shared State & Selectors)<br>- **Sprint 09** (Prompt 9 - Seller/Buyer View, Local Notifications, Pull-to-refresh)<br>- **Sprint 11** (Prompt 11 - Automated Tests, Pure Logic, Component, Critical-Path & Fix Lint) |
| 3 | `1923050024` | **Trà Thanh** | [@Impossibility000](https://github.com/Impossibility000)<br>`trathanhclassic2005@gmail.com` | **Design System & Logic Lead**: Phụ trách Domain models & TypeScript strict types, Single Source of Truth Theme (`theme.ts`) WCAG AA >= 4.5:1, Design primitives (`AppText`, `AppButton`, `AppInput`, `ScreenState`), Tìm kiếm văn bản & Lọc danh mục catalogue tính toán thuần tuý in-render. | - **Sprint 03** (Domain Types, Theme Single Source & Primitives)<br>- **Sprint 05** (Prompt 5 - Search & Category Filter Pure Logic) |

---

## PHẦN II: NHẬT KÝ TƯƠNG TÁC AI THEO TỪNG THÀNH VIÊN

---

### THÀNH VIÊN 1: NGUYỄN THÀNH LONG (MSSV: `1923050409`, GitHub: `@nonyx1og`)

#### Phiên 1.1 — Ngày 2026-10-26: Triển khai Remote API Client, Authentication & Persistent Session (Prompt 3)
- **Mục đích hỏi AI / Prompt**:  
  > "Prompt 3 — Remote API, auth và persistent session. Hãy triển khai auth và API client theo backend contract hiện có của project, không tạo mock giả nếu backend đã tồn tại. Phạm vi: sign in bằng email/password, khôi phục session khi app mở lại, sign out phải xoá session/token cục bộ và đưa về auth screen. Lưu token bằng SecureStore; không log token và không ghi token vào AsyncStorage. Route guard hoạt động khi session loading, signed out và signed in. Viết test cho session restoration và sign-out."
- **Phần code / ý tưởng đã chấp nhận**:
  - `lib/api/config.ts`: Đọc biến môi trường chuẩn Expo (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_TIMEOUT`), không lưu private key trên client.
  - `lib/api/client.ts`: HttpClient hỗ trợ `GET/POST/PUT/DELETE`, tự động inject header `Authorization: Bearer <token>` đọc trực tiếp từ `expo-secure-store`, xử lý timeout bằng `AbortController`, chuẩn hóa lỗi `ApiError`.
  - `lib/api/auth.ts`: Endpoints `apiSignIn`, `apiSignOut`, `apiGetCurrentUser` kèm mock fallback tài khoản mẫu (`sinhvien@campus.edu.vn`, `seller@campus.edu.vn`, `admin@campus.edu.vn`) cho môi trường offline.
  - `lib/auth.ts`: Hàm `persistSession`, `restoreSessionFromStorage`, `clearSensitiveUserData` xoá sạch SecureStore và gọi `queryClient.clear()`.
  - `store/auth-store.ts`: Zustand store với selectors `selectIsAuthenticated`, `selectUser`, `selectIsRestoringSession`.
  - `app/(auth)/sign-in.tsx`: Form đăng nhập đạt chuẩn touch target 44×44px, có validation và các nút chọn nhanh tài khoản kiểm thử.
  - `scripts/test-auth-session.js`: 18 test cases kiểm thử tự động.
- **Phần đã từ chối và lý do**:
  - *Từ chối*: AI ban đầu viết logic lưu trữ JWT token vào `AsyncStorage` và dùng `console.log('User Token:', token)` trong `client.ts`.
  - *Lý do*: Vi phạm quy tắc bảo mật bắt buộc của đề tài (`lưu token/secret bằng SecureStore; không log token và không ghi token vào AsyncStorage`).
- **Lỗi do AI tạo ra & Cách nhóm phát hiện / sửa chữa**:
  - *Lỗi 1*: AI tạo code gọi `AsyncStorage.setItem('AUTH_TOKEN', token)`.  
    *Phát hiện*: Long review code và phát hiện vi phạm yêu cầu đề bài.  
    *Cách sửa*: Yêu cầu AI chuyển hoàn toàn sang `expo-secure-store`, đồng thời nhóm tự bổ sung test case trong `scripts/test-auth-session.js` khẳng định `AsyncStorage.getItem('AUTH_TOKEN') === null`.
  - *Lỗi 2*: Khi sign-out, AI chỉ xoá token trong store mà không dọn dẹp bộ nhớ đệm TanStack Query.  
    *Phát hiện*: Khi đăng xuất Buyer và đăng nhập Seller, danh mục giỏ hàng của Buyer vẫn còn lưu tạm trong RAM.  
    *Cách sửa*: Thêm lệnh `queryClient.clear()` vào `clearSensitiveUserData` để xoá sạch cache nhạy cảm giữa các phiên.
- **Người review và hiểu phần code đó**:  
  - Nguyễn Thành Long (tự đọc hiểu toàn bộ luồng Auth, cấu trúc HttpClient, giải thích cặn kẽ cơ chế `SecureStore` và `AbortController`).  
  - Lưu Tiến Bảo chéo review, chạy `npm run test:auth` xác nhận 18/18 tests pass.

---

#### Phiên 1.2 — Ngày 2026-10-27: Listing Detail Dynamic Route, Modal Đăng Tin Có Ảnh Nén & Thẻ Bằng Chứng Compression (Prompt 6)
- **Mục đích hỏi AI / Prompt**:  
  > "Prompt 6 — Listing detail và tạo listing có ảnh nén. Route động `listing/[id].tsx` đọc id từ Expo Router, query chi tiết hoặc dùng cache, có đủ 4 trạng thái, hiển thị stock và trạng thái available/unavailable, nút Add to Favorites và Add to Cart. Create listing modal: title, category, price, stock, ảnh camera/picker; trước khi upload dùng expo-image-manipulator resize/compress. Bắt buộc có cơ chế đo/prove kích thước raw byte size vs compressed byte size trước khi upload, không log nhạy cảm. Không chấp nhận upload raw phone photo trực tiếp nếu chưa qua compression."
- **Phần code / ý tưởng đã chấp nhận**:
  - `features/listing/imageCompression.ts`: Hàm thuần `calculateCompressionMetrics` tính dung lượng gốc, dung lượng nén, phần trăm tiết kiệm; pipeline `compressListingImage` dùng `expo-image-manipulator` resize width 1024px và compress JPEG 0.7; log đo lường an toàn `[ImageCompression Proof]`.
  - `app/(app)/listing/[id].tsx`: Dynamic route `listing/[id]`, TanStack Query `useQuery`, đủ 4 states, hiển thị badge stock (`Còn hàng: X món` vs `Hết hàng / Tạm ngưng`), vô hiệu hoá nút thêm giỏ khi hết hàng.
  - `app/(app)/modal/create-listing.tsx`: Form đăng tin có chọn ảnh camera/library, tích hợp **Thẻ Bằng Chứng Nén Ảnh (Compression Proof Card)** hiển thị ảnh preview, raw size, compressed size, phần trăm giảm (90%+), huy hiệu đạt chuẩn.
  - `scripts/test-listing-flow.js`: 18 test cases tự động.
- **Phần đã từ chối và lý do**:
  - *Từ chối*: AI ban đầu chỉ giả lập việc nén ảnh bằng cách gán `compressedSize = rawSize * 0.2` mà không thực sự gọi `expo-image-manipulator`.
  - *Lý do*: Vi phạm quy định nghiệm thu (`Không chấp nhận upload raw phone photo trực tiếp nếu chưa qua compression`). Cần nén ảnh thật để kích thước file gửi lên server thực sự nhẹ.
- **Lỗi do AI tạo ra & Cách nhóm phát hiện / sửa chữa**:
  - *Lỗi*: AI quên xử lý trường hợp người dùng từ chối cấp quyền truy cập Camera / Thư viện ảnh, dẫn đến ứng dụng bị treo mà không có thông báo.  
    *Phát hiện*: Long test trên điện thoại thật và từ chối quyền camera khi popup hiện lên.  
    *Cách sửa*: Thêm khối `try/catch` kiểm tra `status !== 'granted'`, hiển thị `ErrorState` thông báo quyền kèm nút "Thử lại" và hướng dẫn bật quyền.
- **Người review và hiểu phần code đó**:  
  - Nguyễn Thành Long (hiểu sâu sắc pipeline Image Manipulator, đo đạc byte size và cách invalidate TanStack Query).  
  - Trà Thanh review a11y của modal đăng tin.

---

#### Phiên 1.3 — Ngày 2026-10-27: Giỏ Hàng Sinh Viên, Quy Tắc Tồn Kho & Delivery Rules (Prompt 8)
- **Mục đích hỏi AI / Prompt**:  
  > "Prompt 8 — Cart, stock rule và checkout summary. Hãy triển khai cart và checkout summary bằng Zustand selectors, không dùng floating-point cho tiền. Add/remove item, tăng/giảm quantity không vượt stock hiện tại. Khi stock giảm hoặc item không còn available, cart phải tự điều chỉnh hoặc chặn checkout và hiện message rõ ràng. Checkout summary gồm subtotal, delivery rule và total. Tạo pure function tính summary bằng integer minor units. Delivery rule minh bạch (miễn phí từ ngưỡng X hoặc phí cố định). Disable checkout khi cart invalid; không giả vờ tạo order nếu backend chưa có order API. Cart không lưu listing object stale làm nguồn duy nhất; đối chiếu stock/price từ server/cache."
- **Phần code / ý tưởng đã chấp nhận**:
  - `features/cart/types.ts`: `StoredCartItem`, `EnrichedCartItem`, `CartValidationResult`.
  - `features/cart/deliveryRules.ts`: 3 phương thức giao nhận trong trường (`direct_meetup` 0đ, `dorm_delivery` 10k free từ 100k, `campus_pickup` 5k free từ 50k).
  - `features/cart/calculateCheckoutSummary.ts`: Pure function tính `subtotalMinor`, `deliveryFeeMinor`, `discountMinor`, `totalMinor` bằng số nguyên VND integer, kẹp tối thiểu 0đ.
  - `features/cart/stockRules.ts`: Pure function `validateCartAgainstStock` và `autoAdjustCartItems`.
  - `store/cart-store.ts`: Zustand store chỉ lưu `{ listingId, quantity }` và `selectedDeliveryRuleId`, không lưu stale listing object.
  - `app/(app)/(tabs)/cart.tsx`: Màn hình giỏ hàng phủ 4 states, đối chiếu tồn kho realtime qua TanStack Query, banner cảnh báo tồn kho, nút auto-adjust, tóm tắt thanh toán minh bạch, vô hiệu hoá đặt hẹn khi giỏ không hợp lệ.
  - `scripts/test-cart-flow.js`: 26 test cases tự động.
- **Phần đã từ chối và lý do**:
  - *Từ chối*: AI tính phí giao hàng bằng phép nhân số thực: `fee = subtotal * 0.05` và trả về số thập phân.
  - *Lý do*: Vi phạm quy tắc bắt buộc của đề bài (`không dùng floating-point cho tiền`). Toàn bộ tính toán tiền tệ phải là số nguyên VND (`integer minor units`).
  - *Từ chối*: AI tự tạo một mock API `POST /api/orders` trả về fake order id thành công.
  - *Lý do*: Vi phạm quy tắc (`không giả vờ tạo order nếu backend chưa có order API`). Nghiệp vụ của sàn trường học là hẹn gặp trực tiếp tại Canteen/KTX, do đó giao dịch được xử lý là gửi lịch hẹn gặp và xóa giỏ hàng an toàn.
- **Lỗi do AI tạo ra & Cách nhóm phát hiện / sửa chữa**:
  - *Lỗi*: Khi người dùng bấm tăng số lượng `+` ở sản phẩm có `stock: 1`, AI vẫn cho phép tăng lên `2` ở client store và chỉ báo lỗi khi vào trang thanh toán.  
    *Phát hiện*: Long test luồng thêm vào giỏ và phát hiện số lượng hiển thị vượt quá tồn kho.  
    *Cách sửa*: Viết lại action `incrementQuantity` trong `store/cart-store.ts` nhận tham số `maxStock` và chặn ngay tại nút `+` khi `currentQuantity >= maxStock`.
- **Người review và hiểu phần code đó**:  
  - Nguyễn Thành Long (nắm vững cơ chế đối chiếu tồn kho realtime, thuật toán auto-adjust và quy tắc tính phí giao nhận).  
  - Lưu Tiến Bảo kiểm thử và chạy `npm run test:cart` (26/26 tests green).

---

#### Phiên 1.4 — Ngày 2026-10-27: Phủ Bốn Trạng Thái Toàn Bộ Tuyến Đường & Báo Cáo Kiểm Toán Accessibility (Prompt 10)
- **Mục đích hỏi AI / Prompt**:  
  > "Prompt 10 — Phủ bốn trạng thái, theme và accessibility audit. Audit toàn bộ route/screen hiện tại: loading, empty đúng ngữ cảnh, error với Retry thực sự gọi lại query/action, content. Audit light/dark theme từ một token file; không có hex ngoài token file; Button/Pressable/TextInput có accessibilityRole và accessibilityLabel; touch target tối thiểu 44x44; text tương phản >=4.5:1; không có text quan trọng chỉ truyền đạt bằng màu; +not-found.tsx có nội dung và đường về hợp lý; không có blank screen. Tạo checklist dạng bảng trong `docs/accessibility-and-state-audit.md`."
- **Phần code / ý tưởng đã chấp nhận**:
  - Bổ sung và chuẩn hóa 4 trạng thái cho cả 7 màn hình (`sign-in.tsx`, `index.tsx`, `favorites.tsx`, `cart.tsx`, `listing/[id].tsx`, `create-listing.tsx`, `+not-found.tsx`).
  - Sửa toàn bộ các nút bấm và chip bộ lọc nhỏ hơn 44px thành `minHeight: 44, minWidth: 44`.
  - Tạo tài liệu kiểm toán chi tiết `docs/accessibility-and-state-audit.md`.
  - Bộ kiểm thử tự động `scripts/test-prompt10-audit.js` (18 test cases).
- **Phần đã từ chối và lý do**:
  - *Từ chối*: AI đề xuất ẩn nút "Thử lại" (Retry) trong ErrorState trên màn hình chi tiết khi mạng lỗi và chỉ hiển thị thông báo text tĩnh.
  - *Lý do*: Vi phạm tiêu chí chấm điểm (`error state với Retry thực sự gọi lại action/query`). Nút Retry bắt buộc phải kích hoạt `refetch()`.
- **Lỗi do AI tạo ra & Cách nhóm phát hiện / sửa chữa**:
  - *Lỗi*: AI viết nhầm touch target của nút "Xóa bộ lọc" (`clearFilterBtnStyle`) là 32px.  
    *Phát hiện*: Chạy script kiểm toán `npm run test:audit` phát hiện lỗi touch target < 44px.  
    *Cách sửa*: Điều chỉnh style thành `minHeight: 44, minWidth: 44`.
- **Người review và hiểu phần code đó**:  
  - Nguyễn Thành Long (rà soát bảng kiểm toán, xác nhận cả 7 screens đều phủ 4 trạng thái).  
  - Trà Thanh đối chiếu độ tương phản token màu.

---

### THÀNH VIÊN 2: LƯU TIẾN BẢO (MSSV: `1923040479`, GitHub: `@Zerolexs`)

#### Phiên 2.1 — Ngày 2026-10-25: Khởi Tạo Skeleton Kiến Trúc Expo SDK 58, Expo Router & Remote Git (Sprint 01 & 02)
- **Mục đích hỏi AI / Prompt**:  
  > "Dựa trên quy tắc chung, hãy khởi tạo skeleton cho Campus Marketplace bằng Expo SDK 56+, TypeScript strict và Expo Router. Tạo route tối thiểu: app/(auth)/sign-in.tsx, app/(app)/(tabs)/index.tsx, favorites.tsx, cart.tsx, listing/[id].tsx, modal/create-listing.tsx, +not-found.tsx. Tạo App layout có loading trong khi khôi phục session và route protection. Mỗi screen có đủ 4 nhánh loading, empty, error có nút Retry, content để làm mẫu. Bật TypeScript strict; không hard-code màu trong screen."
- **Phần code / ý tưởng đã chấp nhận**:
  - Khởi tạo Expo SDK 58, React Native 0.88, React 19, TypeScript strict mode.
  - Cấu trúc thư mục chuẩn: `app/`, `components/`, `constants/`, `features/`, `lib/`, `store/`, `types/`.
  - File-based routing với Expo Router: `_layout.tsx`, `(auth)`, `(app)/(tabs)`.
  - Thiết lập remote GitHub `origin` trỏ về `https://github.com/nonyx1og/campus-marketplace.git` và đẩy commit ban đầu.
- **Phần đã từ chối và lý do**:
  - *Từ chối*: AI sinh ra component dạng class (`class App extends React.Component`).
  - *Lý do*: Vi phạm quy ước dự án hiện đại (`Không dùng class component; 100% Function components và React Hooks`).
- **Lỗi do AI tạo ra & Cách nhóm phát hiện / sửa chữa**:
  - *Lỗi*: AI sinh đồng thời cả file `App.tsx` ở thư mục gốc và file `app/_layout.tsx`, khiến Expo Router cảnh báo conflict entry point khi chạy `npx expo start`.  
    *Phát hiện*: Bảo chạy dev server thấy warning màu vàng trên terminal.  
    *Cách sửa*: Xoá bỏ hoàn toàn file `App.tsx` và cấu hình `package.json` trỏ `"main": "expo-router/entry"`.
- **Người review và hiểu phần code đó**:  
  - Lưu Tiến Bảo (nắm vững cơ chế file-based routing của Expo Router và lifecycle khởi động app).  
  - Nguyễn Thành Long kiểm tra cấu trúc thư mục.

---

#### Phiên 2.2 — Ngày 2026-10-27: Danh Sách Yêu Thích — Zustand Selectors, Persistence & Hai Màn Hình Đồng Bộ (Prompt 7)
- **Mục đích hỏi AI / Prompt**:  
  > "Prompt 7 — Favourites: shared state, persistence và hai màn hình. Triển khai favourites bằng Zustand với selectors và persistence. Store chỉ giữ dữ liệu client cần thiết, tối thiểu tập hợp listingId yêu thích. Có selectors như useIsFavorite(listingId) và selector danh sách favourite. Persist qua app restart bằng AsyncStorage. Hiển thị và toggle favourite ở listing card/catalogue và listing detail (hai màn hình khác nhau). Màn Favorites query/derive listing details từ cache/API an toàn; xử lý listing đã bị xoá. Phủ 4 trạng thái. Toggle có dynamic a11y label, touch target >= 44x44. Kiểm tra sign out giữ hay xoá favourites theo chính sách nhóm."
- **Phần code / ý tưởng đã chấp nhận**:
  - `store/favorites-store.ts`: Store tối giản chỉ chứa `favoriteIds: string[]`, lưu vào AsyncStorage key `campus_marketplace_favorite_ids`, có deduplication bằng `Set`.
  - Selectors & hooks: `selectFavoriteIds`, `selectFavoritesCount`, `selectIsFavorite`, `useIsFavorite(id)` (đăng ký lắng nghe có chọn lọc, chống re-render toàn bộ danh sách).
  - `components/favorites/FavoriteToggleButton.tsx`: Nút tim đạt chuẩn touch target >= 44×44px, `stopPropagation()` chống nhảy màn hình khi bấm trên card, dynamic `accessibilityLabel`.
  - Tích hợp 2 màn hình riêng biệt: `features/catalogue/components/CatalogueCard.tsx` và `app/(app)/listing/[id].tsx`.
  - `app/(app)/(tabs)/favorites.tsx`: Query chi tiết an toàn qua TanStack Query, xử lý tin đăng bị xoá (`status: 'deleted'`) hiển thị nút bỏ lưu thân thiện không gây crash.
  - Chính sách Sign-out: Giữ danh sách yêu thích trên thiết bị (Device-level persistence) khi đăng xuất.
  - `scripts/test-favorites-flow.js`: 22 test cases tự động.
- **Phần đã từ chối và lý do**:
  - *Từ chối*: AI định lưu toàn bộ mảng đối tượng `ListingItem[]` vào Zustand Store yêu thích.
  - *Lý do*: Vi phạm quy tắc kiến trúc (`store chỉ giữ dữ liệu client cần thiết, tối thiểu tập hợp listingId yêu thích`, `không tạo duplicate state giữa card/detail/favorites`).
- **Lỗi do AI tạo ra & Cách nhóm phát hiện / sửa chữa**:
  - *Lỗi*: Khi bấm nút yêu thích trên thẻ sản phẩm ở trang Catalogue, sự kiện click bị nổi bọt (event bubbling) khiến app vừa thêm yêu thích vừa mở trang chi tiết sản phẩm.  
    *Phát hiện*: Bảo thao tác thử trên màn hình và thấy bị chuyển hướng không mong muốn.  
    *Cách sửa*: Bổ sung `e.stopPropagation()` trong `FavoriteToggleButton` để cô lập hoàn toàn sự kiện tương tác.
  - *Lỗi*: Khi một sản phẩm yêu thích bị người bán xóa khỏi database, màn hình Favorites bị crash do `item.title` bị `undefined`.  
    *Phát hiện*: Bảo chạy test case sản phẩm bị xoá trong `test-favorites-flow.js`.  
    *Cách sửa*: Thêm nhánh phân loại an toàn: nếu `fetchListingById` trả về null, gán trạng thái `deleted`, hiển thị badge xám và nút "Bỏ lưu".
- **Người review và hiểu phần code đó**:  
  - Lưu Tiến Bảo (hiểu sâu sắc cơ chế Zustand selector tối ưu render và kỹ thuật event isolation).  
  - Trà Thanh review a11y và touch target của nút tim.

---

#### Phiên 2.3 — Ngày 2026-10-27: Các Tính Năng Should Have Vượt Mốc 8 — Seller/Buyer View, Local Notifications & Pull-to-Refresh (Prompt 9)
- **Mục đích hỏi AI / Prompt**:  
  > "Prompt 9 — Các tính năng SHOULD HAVE để vượt mốc 8. Bổ sung từng tính năng mà không làm hỏng MUST HAVE. 1. Seller/buyer view: cùng listing detail nhưng UI/action thay đổi theo role signed-in user; seller thấy edit/manage stock, buyer thấy add to cart/favorite; backend phải enforce authorization HTTP 403. 2. Local notification: khi giá listing đang favourite giảm, kích hoạt thông báo cục bộ; không spam khi giá không đổi; xin permission rõ ràng và xử lý từ chối. 3. Pull-to-refresh: catalogue hỗ trợ pull-to-refresh; hiện last-updated time sau lần fetch thành công; refresh error không xoá cache đang hiển thị. Ghi rõ giới hạn nền tảng."
- **Phần code / ý tưởng đã chấp nhận**:
  - Phân tách giao diện theo vai trò trên `app/(app)/listing/[id].tsx`: Buyer thấy nút yêu thích & thêm vào giỏ; Seller thấy bảng quản lý tồn kho `[-] / [+]`, đặt nhanh 0 / +5. Tích hợp thanh chuyển đổi nhanh vai trò phục vụ chấm điểm.
  - Phân quyền Backend tại `lib/api/catalogue.ts`: Kiểm tra `currentUser.id === listing.sellerId`, trả về `401 Unauthorized` nếu chưa đăng nhập, `403 Forbidden` nếu Buyer hoặc Seller khác cố sửa kho. Thêm nút `🛡️ Kiểm thử Backend 403` trên UI.
  - Local Notification giảm giá: `features/notifications/priceTracker.ts` theo dõi lịch sử giá trong AsyncStorage; hàm `evaluatePriceChanges` phát hiện giảm giá và chặn spam 100% khi giá giữ nguyên; `NotificationPermissionBanner` xử lý xin quyền và tôn trọng khi người dùng từ chối.
  - Pull-to-Refresh & Bảo toàn Cache: `FlatList RefreshControl`, thanh trạng thái `CatalogueHeaderFreshness` hiển thị `🕒 Cập nhật lần cuối: HH:mm:ss`, cơ chế giữ nguyên 100% dữ liệu cache khi làm mới gặp lỗi mạng kèm nút demo `⚡ Test Lỗi Refresh`.
  - Bộ 3 kịch bản kiểm thử: `test-seller-buyer-flow.js` (17 tests), `test-notifications-flow.js` (10 tests), `test-pull-to-refresh.js` (7 tests).
- **Phần đã từ chối và lý do**:
  - *Từ chối*: AI đề xuất ép cài native package `expo-notifications` bằng `npm install --force`.
  - *Lý do*: Vi phạm tính ổn định của môi trường chấm thi Expo Go do xung đột peer dependency giữa React 19 và native package. Nhóm chọn giải pháp an toàn đa nền tảng: dùng `window.Notification` thật trên Web và Banner/In-app modal trên Mobile, ghi chú TODO kiến trúc cho bản EAS build.
- **Lỗi do AI tạo ra & Cách nhóm phát hiện / sửa chữa**:
  - *Lỗi*: Trong hàm xử lý pull-to-refresh, khi gặp lỗi mạng, AI viết `setListings([])` trong block `catch`, khiến toàn bộ danh sách sản phẩm trên màn hình bị biến mất.  
    *Phát hiện*: Bảo bấm thử nút `⚡ Test Lỗi Refresh` và thấy màn hình trắng xoá.  
    *Cách sửa*: Xoá bỏ lệnh clear dữ liệu; trong block `catch` chỉ hiển thị banner cảnh báo lỗi và giữ nguyên mảng dữ liệu đang hiển thị từ TanStack Query cache.
- **Người review và hiểu phần code đó**:  
  - Lưu Tiến Bảo (hiểu rõ cơ chế phân quyền RBAC ở cả 2 đầu client/server, thuật toán so sánh giá và Stale-While-Revalidate).  
  - Nguyễn Thành Long review backend authorization HTTP 403.

---

#### Phiên 2.4 — Ngày 2026-10-27: Automated Tests, Sửa Lỗi Linter & Đảm Bảo Chất Lượng Build (Prompt 11)
- **Mục đích hỏi AI / Prompt**:  
  > "Prompt 11 — Automated tests và chất lượng build. Hãy xây dựng bộ kiểm thử tối thiểu có ý nghĩa: Pure-logic test (filterListings hoặc calculateCheckoutSummary bao phủ edge cases), Component test (FavoriteToggleButton), Critical-path test (sign-in/session restore -> catalogue -> add favorite/cart -> checkout summary). Test ổn định, mock đúng chỗ. Sửa lỗi thật khi chạy `npx tsc --noEmit` và `npx expo lint`, không tắt rule lint hoặc dùng `as any` để che lỗi."
- **Phần code / ý tưởng đã chấp nhận**:
  - `scripts/test-prompt11-pure-logic.js`: 15 test cases bao phủ edge cases (null, undefined, rỗng, không phân biệt hoa thường, ngưỡng freeship 100k/50k, clamp âm tiền).
  - `scripts/test-prompt11-component.js`: 10 test cases kiểm tra hành vi thực của `FavoriteToggleButton` (a11y role, dynamic label, touch target >= 44x44, stopPropagation, store invocation, theme colors).
  - `scripts/test-prompt11-critical-path.js`: 11 test cases kiểm tra luồng nghiệp vụ xuyên suốt 5 giai đoạn có mock SecureStore/API sạch sẽ.
  - Tích hợp scripts vào `package.json`: `test:prompt11:logic`, `test:prompt11:component`, `test:prompt11:critical-path`, `test:prompt11`.
- **Phần đã từ chối và lý do**:
  - *Từ chối*: AI gợi ý đặt `/* eslint-disable react-hooks/exhaustive-deps */` và dùng ép kiểu `(item as any)` để dập tắt các cảnh báo lint.
  - *Lý do*: Vi phạm quy tắc liêm chính học thuật và yêu cầu kỹ thuật (`sửa lỗi thật, không tắt rule lint hoặc dùng as any để che lỗi`).
- **Lỗi do AI tạo ra & Cách nhóm phát hiện / sửa chữa**:
  - *Lỗi 1*: Trong `app/(app)/(tabs)/favorites.tsx`, AI gán trực tiếp thuộc tính đối tượng `target.priceVnd = newPrice`, gây lỗi vi phạm React Compiler immutability.  
    *Phát hiện*: Chạy `npm run lint` (`expo lint`) phát hiện lỗi.  
    *Cách sửa*: Thay thế bằng cú pháp cập nhật bất biến (immutable update) dạng `.map(item => item.id === id ? { ...item, priceMinor: newPrice } : item)`.
  - *Lỗi 2*: Trong `app/(app)/(tabs)/index.tsx`, AI viết `useEffect` gọi `setLastSuccessfulFetch` đồng bộ gây re-render cascading lặp vô tận.  
    *Phát hiện*: `expo lint` cảnh báo rule `react-hooks/set-state-in-effect`.  
    *Cách sửa*: Chuyển thành giá trị dẫn xuất (derived value) `effectiveLastUpdated = customRefreshTime ?? lastUpdated` và xóa `useEffect`.
- **Người review và hiểu phần code đó**:  
  - Lưu Tiến Bảo (trực tiếp kiểm thử, chạy linter, typecheck và xác nhận toàn bộ 36/36 tests của Prompt 11 đạt 100% green).  
  - Nguyễn Thành Long và Trà Thanh cùng review kết quả tổng hợp 211 tests.

---

### THÀNH VIÊN 3: TRÀ THANH (MSSV: `1923050024`, GitHub: `@Impossibility000`)

#### Phiên 3.1 — Ngày 2026-10-25: Domain Types, Hệ Thống Theme Single Source & Bộ Primitives Chuẩn Accessibility (Sprint 03)
- **Mục đích hỏi AI / Prompt**:  
  > "Domain types, theme và design system. Xây dựng lớp domain dùng chung cho Campus Marketplace, không làm UI nghiệp vụ mới. Tạo TypeScript types cho: User, Listing, CartItem, Category, DeliveryRule, CheckoutSummary, ApiError, QueryStatus. Tạo constants/theme.ts làm nguồn duy nhất cho light/dark tokens: background, surface, text, mutedText, primary, danger, border, success và layout minTouchTarget: 44. Tạo các primitive có thể tái dùng: ScreenState, AppText, AppButton, AppInput, EmptyState, ErrorState, LoadingState. Yêu cầu: Không có hex color ngoài theme token file; Contrast body text đạt ít nhất 4.5:1 trong cả hai theme; Button/input/icon control có accessibilityRole và accessibilityLabel; Touch target tối thiểu 44x44; TypeScript không dùng any tuỳ tiện."
- **Phần code / ý tưởng đã chấp nhận**:
  - `types/domain.ts` & `types/index.ts`: Định nghĩa chặt chẽ `User`, `Listing`, `CartItem`, `DeliveryRule`, `CheckoutSummary`, `ApiError`, `QueryStatus`.
  - `constants/theme.ts`: Nguồn chân lý duy nhất (Single Source of Truth) cho bảng màu Light & Dark mode, độ tương phản chuẩn WCAG AA >= 4.5:1 (Text on surface: Light = 17.85:1, Dark = 15.94:1; Muted on surface: Light = 7.58:1, Dark = 6.50:1), quy định `minTouchTarget: 44`.
  - Bộ Primitives tái dùng (`components/primitives/`): `AppText`, `AppButton`, `AppInput`, `ScreenState`, `LoadingState`, `ErrorState`, `EmptyState`.
  - Script kiểm toán độc quyền `scripts/audit-domain-theme.js` (`npm run audit:theme`).
- **Phần đã từ chối và lý do**:
  - *Từ chối*: AI đề xuất dùng `any` cho kiểu dữ liệu response của API: `type ApiResponse = any`.
  - *Lý do*: Vi phạm quy tắc TypeScript strict mode (`TypeScript không dùng any tuỳ tiện`). Nhóm yêu cầu tạo kiểu generic an toàn `ApiResponse<TData>`.
- **Lỗi do AI tạo ra & Cách nhóm phát hiện / sửa chữa**:
  - *Lỗi*: Mã màu phụ `mutedText` ở Dark Mode mà AI chọn ban đầu là `#64748B`, khi đo tỷ lệ tương phản trên nền `#1E293B` chỉ đạt 3.8:1 (dưới chuẩn tối thiểu 4.5:1 của WCAG AA).  
    *Phát hiện*: Thanh chạy script `npm run audit:theme` và terminal báo FAIL ở kiểm tra contrast.  
    *Cách sửa*: Thay thế mã màu `mutedText` trong Dark theme thành `#94A3B8`, nâng độ tương phản lên 6.50:1 (đạt chuẩn AA xuất sắc).
- **Người review và hiểu phần code đó**:  
  - Trà Thanh (hiểu rõ thuật toán tính độ tương phản WCAG AA, công thức Luminance và kiến trúc Theme Tokens).  
  - Nguyễn Thành Long và Lưu Tiến Bảo kiểm tra type safety bằng `npm run typecheck`.

---

#### Phiên 3.2 — Ngày 2026-10-26: Tìm Kiếm Văn Bản & Lọc Danh Mục Catalogue Theo Kiến Trúc Derived State Thuần Túy (Prompt 5)
- **Mục đích hỏi AI / Prompt**:  
  > "Prompt 5 — Search và category filter đúng yêu cầu đề bài. Bổ sung tìm kiếm text và lọc category cho catalogue hiện tại. Yêu cầu bắt buộc: Có search input và category selector/chips; Kết quả lọc phải được tính trong render hoặc selector thuần từ listings + searchText + selectedCategory; Không lưu filteredListings, searchResults hoặc dữ liệu dẫn xuất tương tự vào state; Search không phân biệt hoa thường; xử lý khoảng trắng đầu/cuối; Có empty state riêng khi có catalogue nhưng không có kết quả phù hợp; Giữ loading/error/offline states của catalogue; Control có a11y label/role; category selector có trạng thái selected dễ nhận biết. Viết pure function filterListings và test các edge cases."
- **Phần code / ý tưởng đã chấp nhận**:
  - `features/catalogue/filterListings.ts`: Pure function `filterListings(listings, searchText, selectedCategory)` chuẩn hoá `trim()`, `toLowerCase()`, nhận diện category rỗng (`''`, `'Tất cả'`, `'All'`), an toàn tuyệt đối trước dữ liệu thiếu thuộc tính.
  - Kiến trúc Derived State tại `app/(app)/(tabs)/index.tsx`: Tính toán kết quả trực tiếp qua `useMemo(() => filterListings(...), [...])`, không lưu vào bất kỳ `useState` hay Zustand store nào.
  - Phân định 2 kịch bản Empty State: Empty catalogue ("Chợ chưa có sản phẩm") vs Empty kết quả tìm kiếm ("Không tìm thấy sản phẩm phù hợp" kèm nút "Xóa bộ lọc").
  - Category Chips: Đạt chuẩn a11y, touch target >= 44×44px, ký hiệu `✓` trước nhãn khi được chọn.
  - `scripts/test-search-filter.js`: 28 test cases tự động.
- **Phần đã từ chối và lý do**:
  - *Từ chối*: AI viết code khai báo `const [filteredListings, setFilteredListings] = useState<ListingItem[]>([])` và dùng `useEffect` lắng nghe `searchQuery` để `setFilteredListings`.
  - *Lý do*: Vi phạm quy tắc cấm kỵ của đề bài (`Không coi dữ liệu tìm kiếm/lọc là state; không lưu filteredListings, searchResults hoặc dữ liệu dẫn xuất tương tự vào state`).
- **Lỗi do AI tạo ra & Cách nhóm phát hiện / sửa chữa**:
  - *Lỗi*: Hàm lọc ban đầu của AI gọi thẳng `item.title.toLowerCase()` mà không kiểm tra thuộc tính. Khi test với sản phẩm bị thiếu trường `title` hoặc có `title: null`, ứng dụng bị sập với lỗi `TypeError: Cannot read properties of undefined (reading 'toLowerCase')`.  
    *Phát hiện*: Thanh viết kịch bản test dữ liệu khuyết thiếu trong `scripts/test-search-filter.js` và phát hiện runtime crash.  
    *Cách sửa*: Viết lại hàm lọc với toán tử safe navigation `(item?.title ?? '').toLowerCase()`, áp dụng tương tự cho `category` và `description`.
- **Người review và hiểu phần code đó**:  
  - Trà Thanh (nắm vững nguyên lý Pure Function, Immutability và cách tính Derived State trong React render cycle).  
  - Nguyễn Thành Long chạy `npm run test:filter` (28/28 tests green).

---

#### Phiên 3.3 — Ngày 2026-10-27: Tương Thích Nền Tảng Web, Khắc Phục Lỗi DOM Nesting & Hoàn Thiện Thêm Vào Giỏ Hàng
- **Mục đích hỏi AI / Prompt**:  
  > "Khắc phục lỗi Console Error `<button> cannot contain a nested <button>` trên nền tảng Web và xử lý trường hợp thêm vào giỏ hàng chưa chạy trên Web."
- **Phần code / ý tưởng đã chấp nhận**:
  - `features/catalogue/components/CatalogueCard.tsx`: Chuyển đổi `accessibilityRole` thẻ bọc từ `"button"` sang `"link"` (render thành `<div role="link">` trên React Native Web), cho phép chứa nút `<button>` yêu thích và nút thêm nhanh mà không vi phạm chuẩn DOM nesting của React 19.
  - Bổ sung nút bấm thêm nhanh **`+ Giỏ`** trực tiếp trên từng thẻ sản phẩm kèm phản hồi trạng thái `✓ Đã thêm` trong 2 giây.
  - `app/(app)/listing/[id].tsx`: Bổ sung cơ chế phản hồi trực quan tức thì trên nút *"Thêm vào giỏ"*, hiển thị Floating Toast Banner với nút chuyển hướng **"Xem giỏ →"**, hỗ trợ fallback Web tương thích không bị nuốt bởi hàm rỗng `Alert.alert`.
  - `app/(app)/(tabs)/_layout.tsx`: Bổ sung badge hiển thị số lượng giỏ hàng thực tế trên icon Tab Bar.
  - `app/(app)/(tabs)/cart.tsx`: Bổ sung tương thích `window.confirm` / `window.alert` cho các thao tác tăng/giảm, xóa và xác nhận đặt hẹn giao dịch trên Web.
- **Phần đã từ chối và lý do**:
  - *Từ chối*: AI ban đầu gợi ý xóa bỏ nút tim hoặc nút thêm giỏ trên thẻ để tránh lồng nhau.
  - *Lý do*: Làm giảm trải nghiệm người dùng và vi phạm yêu cầu bài toán về tương tác danh mục.
- **Người review và hiểu phần code đó**:  
  - Cả 3 thành viên (Bảo, Long, Thanh) kiểm thử trực tiếp trên trình duyệt Web (`http://localhost:8081`) và xác nhận toàn bộ 211 test cases đạt 100% Green.

---

## PHẦN III: TIẾN TRÌNH KỸ THUẬT CHI TIẾT THEO TỪNG SPRINT (SPRINT 01 ĐẾN 11)

*(Toàn bộ các thông số kỹ thuật, quyết định thiết kế và kết quả kiểm thử của 11 Sprint trước đó vẫn được lưu trữ nguyên vẹn để phục vụ việc tra cứu chi tiết khi vấn đáp viva).*

### Tóm tắt kết quả kiểm thử tự động đạt được:
- **Tổng số test suites**: 10 bộ kiểm thử chuyên biệt.
- **Tổng số test cases**: **211/211 test cases PASSED (100% Green)**.
- **Kiểm tra kiểu dữ liệu (TypeScript Strict)**: `npm run typecheck` $\rightarrow$ **0 errors**.
- **Kiểm tra linter (Expo Lint)**: `npm run lint` $\rightarrow$ **0 errors, 0 warnings**.
- **Kiểm toán Theme & Accessibility**: `npm run audit:theme` $\rightarrow$ **0 hex colors outside token, 100% contrast >= 4.5:1**.
- **Kiểm toán 4 Trạng thái**: `npm run test:audit` $\rightarrow$ **18/18 audit checks passed**.

