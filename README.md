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
# 1. Chạy toàn bộ bộ kiểm thử tự động (Pure Logic, Auth, Session, Catalogue Offline, Search & Filter, Listing Detail & Create Listing, Favourites State & Persistence)
npm test

# 2. Chạy riêng bộ kiểm thử Favourites Shared State & Persistence (Prompt 7)
npm run test:favorites

# 3. Chạy riêng bộ kiểm thử Listing Detail, Nén ảnh & Tạo tin đăng (Prompt 6)
npm run test:listing

# 4. Chạy riêng bộ kiểm thử tính năng Tìm kiếm & Lọc Category (Prompt 5)
npm run test:filter

# 5. Kiểm tra tuân thủ mã màu Design Token và độ tương phản WCAG AA (>= 4.5:1)
npm run audit:theme

# 6. Kiểm tra tĩnh TypeScript strict
npm run typecheck

# 7. Chạy toàn bộ kiểm tra tổng thể cùng lúc
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

---

## 7. Kiến trúc Danh sách Yêu thích (Favourites: Shared State, Persistence & Hai màn hình - Prompt 7)

### 1. Nguyên lý Kiến trúc & Dữ liệu Tối thiểu (Zero State Duplication)
- **Tối giản State Client**: Zustand store (`store/favorites-store.ts`) chỉ lưu trữ duy nhất tập hợp mã định danh sản phẩm yêu thích: `favoriteIds: string[]`.
- **Tuyệt đối không lưu lặp lại đối tượng `ListingItem` vào store client**: Toàn bộ chi tiết món đồ (tiêu đề, giá bán, ảnh, người bán, tồn kho) được truy vấn hoặc dẫn xuất động từ TanStack Query / cache / API khi cần hiển thị trên màn hình Yêu thích (`useQuery` với queryKey `['favorites', 'details', favoriteIds]`).
- **Hiệu năng tối ưu**: Cung cấp selectors chuyên biệt (`selectFavoriteIds`, `selectFavoritesCount`, `selectIsFavorite(id)`) và React hook `useIsFavorite(listingId)`. Khi một món đồ thay đổi trạng thái yêu thích, chỉ đúng component nút bấm đó re-render, toàn bộ danh sách Catalogue FlatList không bị re-render thừa.

### 2. Lưu trữ Bền vững (Persistence qua App Restart)
- Sử dụng `@react-native-async-storage/async-storage` với khóa lưu trữ chuẩn `campus_marketplace_favorite_ids`.
- Cơ chế khởi động tự động (`hydrateFavorites`): Khôi phục mảng `favoriteIds` ngay khi mở ứng dụng.
- Tương thích ngược: Tự động phát hiện và chuyển đổi (migration) định dạng cũ nếu có, loại bỏ các ID trùng lặp, bảo vệ chống crash khi dữ liệu lưu trữ bị lỗi/corrupt JSON.

### 3. Đồng bộ Trạng thái Giữa Hai Màn hình Riêng biệt
- **Màn hình 1 - Thẻ sản phẩm Catalogue (`CatalogueCard.tsx`)**:
  - Tích hợp nút tim yêu thích `FavoriteToggleButton` nằm nổi bật ở góc trên bên phải ảnh minh hoạ.
  - Xử lý chặn sự kiện nổi bọt (`e.stopPropagation()`) để khi bấm nút tim không kích hoạt điều hướng mở chi tiết thẻ.
- **Màn hình 2 - Chi tiết sản phẩm (`listing/[id].tsx`)**:
  - Nút bấm yêu thích dạng pill với biểu tượng trái tim và nhãn trạng thái (`Đã lưu` / `Yêu thích`).
  - Đồng bộ tức thì 2 chiều: Toggle trên Catalogue Card thì Listing Detail cập nhật ngay, và ngược lại.

### 4. Màn hình Favorites (`app/(app)/(tabs)/favorites.tsx`) & Xử lý An toàn
- Dẫn xuất danh sách chi tiết an toàn từ cache hoặc remote API qua TanStack Query.
- **Xử lý món đồ không còn khả dụng hoặc đã bị xoá**:
  - Sản phẩm còn hàng (`stock > 0`): Badge xanh `Còn hàng`, cho phép xem chi tiết và mua hàng.
  - Sản phẩm hết hàng (`stock === 0`): Badge đỏ `Hết hàng / Tạm ngưng`, cảnh báo rõ ràng.
  - Sản phẩm đã bị xóa khỏi sàn (`item === null`): Hiển thị thông báo `Đã bị xoá / Không khả dụng` kèm nút bấm `Bỏ lưu` để sinh viên dọn dẹp danh mục mà không làm sập ứng dụng (No white screen crash).
- **Phủ đủ 4 trạng thái giao diện**:
  - `loading`: Skeleton / spinner tải danh sách khi đang hydrate hoặc fetch dữ liệu.
  - `empty`: Giao diện trống thân thiện ("Bạn chưa lưu tin đăng nào") kèm nút CTA "Khám phá chợ ngay".
  - `error`: Thông báo lỗi mạng kèm nút **"Thử lại"** (`onRetry`).
  - `content`: Danh sách FlatList mượt mà với tính năng kéo để làm mới (`RefreshControl`).

### 5. Chính sách Lưu trữ Favourites khi Đăng xuất (Sign-out Policy)
> **CHÍNH SÁCH ĐÃ CHỐT CỦA NHÓM:**
> - **Quy định**: Khi người dùng Đăng xuất (`signOut`), danh sách sản phẩm yêu thích (`favoriteIds`) **ĐƯỢC GIỮ LẠI TRÊN THIẾT BỊ (Device-level Persistence)** và **KHÔNG BỊ XÓA**.
> - **Cơ sở kỹ thuật & Trải nghiệm Người dùng (UX)**:
>   1. **Dữ liệu phi nhạy cảm**: Danh sách yêu thích chỉ chứa các chuỗi ID tham chiếu công khai, không chứa thông tin riêng tư hay tài chính.
>   2. **Trải nghiệm sinh viên liền mạch**: Sinh viên thường lưu lại các cuốn giáo trình cần mua trước khi đăng nhập hoặc khi chuyển đổi giữa các tài khoản kiểm thử (Buyer / Seller). Việc giữ lại giúp họ không bị mất danh sách đã chọn.
>   3. **Bảo mật tuyệt đối**: Toàn bộ dữ liệu nhạy cảm (JWT Token, User Session, Refresh Token) được lưu trữ riêng trong `expo-secure-store` và được **xóa triệt để** khi đăng xuất (`clearSensitiveUserData`), đồng thời TanStack Query cache người dùng bị xoá sạch (`queryClient.clear()`).
>   4. **Quyền chủ động của người dùng**: Người dùng có thể tự xóa từng món đồ bằng nút `Bỏ lưu` hoặc sử dụng hàm `clearFavorites()` khi muốn xóa sạch hoàn toàn danh sách yêu thích trên thiết bị.

### 6. Khả năng Tiếp cận (Accessibility WCAG AA)
- Mọi nút toggle yêu thích và nút bỏ lưu đều đạt chuẩn touch target tối thiểu **>= 44×44px** (`theme.layout.minTouchTarget`).
- `accessibilityRole="button"`.
- `accessibilityState={{ selected: isFavorite }}`.
- Nhãn `accessibilityLabel` biến đổi động theo ngữ cảnh trạng thái:
  - Khi chưa yêu thích: `"Lưu sản phẩm [Tên sản phẩm] vào danh sách yêu thích"`.
  - Khi đã yêu thích: `"Bỏ lưu sản phẩm [Tên sản phẩm] khỏi danh sách yêu thích"`.


---

## 8. Kiến trúc Giỏ hàng, Quy tắc Quản lý Tồn kho & Tổng kết Thanh toán (Prompt 8)

### 1. Kiến trúc Client State Tối giản & Tính toán Tiền tệ Số nguyên (Integer VND)
- **State Client tinh gọn**: Zustand cart store (`store/cart-store.ts`) chỉ lưu trữ mảng định danh và số lượng: `items: { listingId: string; quantity: number }[]`, kèm `selectedDeliveryRuleId`.
- **Không duplicate server state**: Tuyệt đối không lưu đối tượng `Listing` cũ làm nguồn dữ liệu duy nhất. Giá bán, tiêu đề và số lượng tồn kho luôn được đối chiếu trực tiếp từ TanStack Query cache / remote API (`useQuery(['cart', 'stock-reconciliation'])`).
- **Toán tử số nguyên an toàn**: Toàn bộ phép tính tiền `subtotalMinor`, `deliveryFeeMinor`, `discountMinor`, `totalMinor` sử dụng hàm thuần khiết `calculateCheckoutSummary` tính toán bằng số nguyên VND (`Math.floor` / `Math.round`), tuyệt đối không dùng số thực `floating-point` để loại bỏ 100% lỗi làm tròn xu/hào.

### 2. Quy tắc Quản lý Tồn kho (Stock Rules) & Tự động Điều chỉnh
- **Kiểm soát số lượng chặt chẽ**:
  - Không cho phép số lượng đặt mua vượt quá tồn kho thực tế (`quantity <= stock`).
  - Thêm sản phẩm từ trang chi tiết hoặc tăng số lượng trong giỏ hàng sẽ bị chặn nếu vượt mức tồn kho hiện có.
- **Phát hiện biến động tồn kho**:
  - Nếu sản phẩm bị người bán xóa hoặc không còn tồn tại $\rightarrow$ Trạng thái `deleted` (Badge đỏ cảnh báo).
  - Nếu sản phẩm hết hàng (`stock === 0`) $\rightarrow$ Trạng thái `out_of_stock` (Badge đỏ cảnh báo).
  - Nếu số lượng đặt vượt quá tồn kho hiện có $\rightarrow$ Trạng thái `exceeds_stock` (Badge cam cảnh báo).
- **Banner cảnh báo & Nút Tự động điều chỉnh (Auto-adjust)**:
  - Khi phát hiện tồn kho không hợp lệ, xuất hiện banner thông báo rõ ràng kèm nút **"Tự động điều chỉnh theo tồn kho"** (`autoAdjustCartItems`).
  - Hàm tự động cân bằng số lượng về mức tồn kho tối đa có sẵn và loại bỏ các món đã hết hàng hoặc bị xóa.

### 3. Chính sách Giao nhận Minh bạch trong Khuôn viên (Delivery Rules)
Hệ thống hiển thị rõ ràng 3 phương thức giao nhận phù hợp với môi trường đại học:
1. **Hẹn gặp trong khuôn viên (Thư viện / Canteen)** (`direct_meetup`):
   - Phí: **0 đ (Miễn phí 100%)**
   - Áp dụng: Gặp trực tiếp bạn học trao đổi đồ tại sảnh trường, canteen hoặc thư viện.
2. **Giao tận Ký túc xá sinh viên** (`dorm_delivery`):
   - Phí: **10.000 đ**
   - Ngưỡng miễn phí: **Miễn phí giao KTX cho đơn hàng từ 100.000 đ trở lên** (`subtotalMinor >= 100000`).
   - Có dòng nhắc nhở thông minh: *"Thêm X đ để được Miễn phí giao tận phòng KTX"*.
3. **Nhận tại Trạm đồ sinh viên tự quản** (`campus_pickup`):
   - Phí: **5.000 đ**
   - Ngưỡng miễn phí: **Miễn phí tại Trạm đồ cho đơn hàng từ 50.000 đ trở lên** (`subtotalMinor >= 50000`).

### 4. Quy tắc An toàn Checkout & Hẹn Giao dịch
- **Vô hiệu hóa Checkout khi giỏ không hợp lệ**: Nút thanh toán bị vô hiệu hóa (`disabled`) và hiển thị thông báo nếu trong giỏ có món vượt tồn kho, hết hàng hoặc đã bị xóa.
- **Không giả vờ tạo order ảo**: Vì đồ án là sàn trao đổi đồ sinh viên và backend chưa có endpoint đặt hàng phức tạp, thao tác xác nhận hẹn giao dịch gửi thông báo hẹn gặp người bán kèm tóm tắt chi phí rõ ràng để thanh toán trực tiếp khi gặp mặt.
- **Xử lý trạng thái Loading & Success**: Nút hiển thị spinner khi đang gửi yêu cầu và thông báo popup xác nhận thành công trước khi dọn giỏ hàng.

### 5. Bộ Kiểm thử Giỏ hàng Tự động (Prompt 8 Test Suite)
Chạy lệnh:
```bash
npm run test:cart
```
Bao phủ 26 test cases đạt 100% green:
- Thuật toán tính toán tiền tệ integer VND, ngưỡng miễn phí KTX và Trạm đồ.
- Logic kiểm định tồn kho: `valid`, `exceeds_stock`, `out_of_stock`, `deleted`.
- Khả năng tự động điều chỉnh số lượng tồn kho `autoAdjustCartItems`.
- Lưu trữ bền vững cart qua AsyncStorage, phục hồi hydration và tương thích format cũ.
- Đối chiếu stock động theo thời gian thực (Server stock drop protection).
- Chuẩn tiếp cận WCAG AA (touch target >= 44x44, nhãn a11y động).
