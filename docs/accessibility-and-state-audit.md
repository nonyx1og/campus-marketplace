# Báo cáo Kiểm thử Trạng thái Giao diện, Hệ thống Theme & Khả năng Tiếp cận (WCAG AA)
# Project: Campus Marketplace (Đồ án Lập trình Thiết bị Di động)

Tài liệu này tổng hợp toàn bộ kết quả audit chi tiết theo yêu cầu của **Prompt 10** trong đề bài đồ án Campus Marketplace.

---

## 1. Bảng Tổng hợp Độ Phủ 4 Trạng thái (Four States Matrix)

Đề bài yêu cầu mọi route/screen đều phải phủ đủ 4 trạng thái:
1. **Loading state**: Hiển thị chỉ báo tải dữ liệu trực quan hoặc skeleton;
2. **Empty state**: Thông báo rỗng đúng ngữ cảnh kèm nút điều hướng hành động;
3. **Error state + Retry**: Báo lỗi thân thiện kèm nút "Thử lại" thực sự kích hoạt lại query/action;
4. **Content state**: Dữ liệu hiển thị hoàn chỉnh, tương tác mượt mà.

| STT | Tên Màn hình / Route | Loading State | Empty State (Đúng ngữ cảnh) | Error State + Retry (Hành vi thực) | Content State | Thanh Switcher Chấm điểm (Demo Viva) |
|---|---|---|---|---|---|---|
| 1 | **Đăng nhập**<br>`app/(auth)/sign-in.tsx` | `ActivityIndicator` kèm thông báo "Đang xác thực thông tin tài khoản qua remote API..." | Icon 🎓 "Chưa có phiên làm việc" + Nút "Điền thông tin đăng nhập" | Icon ⚠️ Alert lỗi chi tiết từ API + Nút "Thử lại" cho phép nhập lại | Form đăng nhập chuẩn WCAG AA, phím chọn tài khoản nhanh Buyer/Seller/Admin | Có sẵn (`ScreenStateView` switcher) |
| 2 | **Catalogue Sản phẩm**<br>`app/(app)/(tabs)/index.tsx` | Skeleton loading động (`CatalogueSkeleton` 3 thẻ mờ dần) khi chưa có cache | **2 Kịch bản:**<br>1. Toàn bộ catalogue trống<br>2. Bộ lọc không khớp từ khoá/danh mục -> Icon 🔍 + Nút "Xóa bộ lọc" | Báo lỗi kết nối + Nút "Thử lại" (`refetch()`). Nếu offline: hiện `OfflineBanner` bảo toàn cache | Danh sách thẻ `CatalogueCard`, bộ lọc danh mục, thanh tìm kiếm, pull-to-refresh, header cập nhật lần cuối | Có sẵn (`ScreenState` switcher: content/loading/empty/error) |
| 3 | **Yêu thích**<br>`app/(app)/(tabs)/favorites.tsx` | Spinner "Đang tải danh sách đồ dùng đã lưu..." trong khi truy vấn TanStack Query | Icon 📦 "Chưa có sản phẩm yêu thích" + Nút "Khám phá chợ ngay" chuyển tab Catalogue | Báo lỗi lấy chi tiết tin đăng + Nút "Thử lại" gọi `refetch()` | Danh sách đồ đã lưu, nút xóa yêu thích 44x44, badge Còn hàng/Hết hàng/Đã xoá, banner thông báo giá | Có sẵn (`ScreenState` switcher) |
| 4 | **Giỏ hàng & Thanh toán**<br>`app/(app)/(tabs)/cart.tsx` | Spinner "Đang kiểm tra tồn kho và đối chiếu giỏ hàng sinh viên..." | Icon 🛒 "Giỏ hàng trống" + Nút "Khám phá Chợ Campus" | Báo lỗi đối chiếu tồn kho từ máy chủ + Nút "Thử lại" gọi `refetch()` | Danh sách hàng, bộ tăng giảm số lượng chặn stock, cảnh báo tồn kho, chọn điểm nhận KTX/Trạm, tổng kết tiền integer VND | Có sẵn (`ScreenState` switcher) |
| 5 | **Chi tiết Sản phẩm**<br>`app/(app)/listing/[id].tsx` | Spinner "Đang tải thông tin chi tiết món đồ..." | Icon 📦 "Không tìm thấy sản phẩm" + Nút "Quay lại danh mục" (`router.back()`) | Lỗi nạp thông tin từ server + Nút "Thử lại" gọi `refetch()` | Ảnh sản phẩm, giá bán, badge tồn kho, vai trò Người mua (Thêm giỏ) vs Người bán (Quản lý kho) | Có sẵn (`ScreenState` switcher) |
| 6 | **Modal Đăng tin có ảnh nén**<br>`app/(app)/modal/create-listing.tsx` | Spinner "Đang nén ảnh & tải tin đăng lên chợ..." hoặc thanh tiến trình nén ảnh | "Chưa có thông tin tin đăng" + Nút "Nhập thông tin" quay lại biểu mẫu | Báo lỗi upload ảnh / tạo bài đăng + Nút "Thử lại" quay lại form | Biểu mẫu nhập liệu, chọn ảnh camera/library, thẻ bằng chứng nén ảnh (giảm >90%), nút Đăng tin | Có sẵn (`ScreenState` switcher) |
| 7 | **Trang 404 Điều hướng**<br>`app/+not-found.tsx` | Spinner "Đang kiểm tra đường dẫn liên kết..." | "Không tìm thấy trang yêu cầu" + Nút "Về trang chủ" | "Lỗi định tuyến" + Nút "Về trang chủ" (`router.replace('/')`) | Icon 🔍, tiêu đề "404 - Không tìm thấy trang", mô tả rõ ràng + Nút link touch target 44x44 "Quay về trang chủ" | Có sẵn (`ScreenState` switcher) |

---

## 2. Kiểm toán Hệ thống Theme & Mã màu Token (Theme System Audit)

### 2.1. Nguồn Chân lý Duy nhất (Single Source of Truth)
- Toàn bộ màu sắc của ứng dụng được tập trung duy nhất tại: `constants/theme.ts`.
- File `constants/tokens.ts` re-export đồng bộ từ `theme.ts`, đảm bảo tính kế thừa kiến trúc.
- **Kết quả kiểm tra quét tự động**: **0 mã màu hex** xuất hiện ngoài file `constants/theme.ts`.

### 2.2. Bảng Đối chiếu Tỷ lệ Tương phản WCAG AA (Contrast Ratio >= 4.5:1)

| Cặp màu kiểm tra | Mã Hex Foreground | Mã Hex Background | Tỷ lệ tương phản đo được | Tiêu chuẩn WCAG AA | Kết quả |
|---|---|---|---|---|---|
| **Light Theme: Body Text trên Surface** | `#0F172A` | `#FFFFFF` | **17.85 : 1** | >= 4.5 : 1 | **ĐẠT (Vượt trội)** |
| **Light Theme: Body Text trên Background** | `#0F172A` | `#F8FAFC` | **17.06 : 1** | >= 4.5 : 1 | **ĐẠT (Vượt trội)** |
| **Light Theme: Muted Text trên Surface** | `#475569` | `#FFFFFF` | **7.58 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Light Theme: Muted Text trên Background** | `#475569` | `#F8FAFC` | **7.24 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Light Theme: Primary Brand trên Surface** | `#1D4ED8` | `#FFFFFF` | **6.70 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Light Theme: Danger Red trên Surface** | `#B91C1C` | `#FFFFFF` | **6.47 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Light Theme: Success Green trên Surface** | `#15803D` | `#FFFFFF` | **5.02 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Light Theme: Text Trắng trên Nút Primary** | `#FFFFFF` | `#1D4ED8` | **6.70 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Light Theme: Text Trắng trên Nút Danger** | `#FFFFFF` | `#B91C1C` | **6.47 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Light Theme: Text Trắng trên Nút Success** | `#FFFFFF` | `#15803D` | **5.02 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Dark Theme: Body Text trên Surface** | `#F8FAFC` | `#161E2E` | **15.94 : 1** | >= 4.5 : 1 | **ĐẠT (Vượt trội)** |
| **Dark Theme: Body Text trên Background** | `#F8FAFC` | `#0B0F17` | **18.33 : 1** | >= 4.5 : 1 | **ĐẠT (Vượt trội)** |
| **Dark Theme: Muted Text trên Surface** | `#94A3B8` | `#161E2E` | **6.50 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Dark Theme: Muted Text trên Background** | `#94A3B8` | `#0B0F17` | **7.48 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Dark Theme: Primary Brand trên Surface** | `#60A5FA` | `#161E2E` | **6.56 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Dark Theme: Primary Brand trên Background** | `#60A5FA` | `#0B0F17` | **7.54 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Dark Theme: Danger Red trên Surface** | `#F87171` | `#161E2E` | **6.03 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Dark Theme: Danger Red trên Background** | `#F87171` | `#0B0F17` | **6.93 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Dark Theme: Success Green trên Surface** | `#4ADE80` | `#161E2E` | **9.57 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Dark Theme: Success Green trên Background** | `#4ADE80` | `#0B0F17` | **11.01 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Dark Theme: Text Trắng trên Nút PrimaryBg** | `#FFFFFF` | `#2563EB` | **5.17 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Dark Theme: Text Trắng trên Nút DangerBg** | `#FFFFFF` | `#DC2626` | **4.83 : 1** | >= 4.5 : 1 | **ĐẠT** |
| **Dark Theme: Text Trắng trên Nút SuccessBg** | `#FFFFFF` | `#15803D` | **5.02 : 1** | >= 4.5 : 1 | **ĐẠT** |

### 2.3. Chuyển đổi Theme Động (Live Theme Switching)
- Ứng dụng đã được bọc `ThemeProvider` ở cấp root (`app/_layout.tsx`), tự động phát hiện `useColorScheme()` của hệ điều hành.
- Trên giao diện tab Catalogue (`app/(app)/(tabs)/index.tsx`), đã tích hợp nút chuyển đổi nhanh:
  `☀️ Giao diện Sáng` $\longleftrightarrow$ `🌙 Giao diện Tối`
  giúp giám khảo viva kiểm tra ngay lập tức mà không cần chỉnh cài đặt điện thoại.
- Trạng thái `StatusBar` tự động chuyển `light` khi ở theme Dark và `dark` khi ở theme Light.

---

## 3. Kiểm toán Khả năng Tiếp cận (Accessibility - WCAG AA)

### 3.1. Phủ đầy đủ `accessibilityRole` & `accessibilityLabel`
Đã quét toàn bộ 63 file `.tsx` trong dự án. **100% các phần tử tương tác** (`TouchableOpacity`, `Pressable`, `TextInput`) đều khai báo đầy đủ `accessibilityRole` và `accessibilityLabel`:
- Nút bấm: `accessibilityRole="button"`, kèm mô tả hành động rõ nghĩa (ví dụ: *"Nhấn để đăng nhập vào tài khoản sinh viên"*, *"Lưu sản phẩm Giáo trình Giải tích vào danh sách yêu thích"*).
- Ô nhập liệu: `accessibilityRole="text"` hoặc `accessibilityRole="search"`, nhãn mô tả định dạng và yêu cầu nhập.
- Tab bar: `tabBarAccessibilityLabel` trên cả 3 tab (Sản phẩm, Yêu thích, Giỏ hàng).
- Trạng thái lựa chọn: `accessibilityState={{ selected: isSelected }}` trên danh mục, phương thức giao hàng, nút yêu thích.

### 3.2. Chuẩn kích thước Vùng Cảm ứng (Touch Target >= 44x44 px)
Tất cả các phần tử chạm bấm đều sử dụng token chuẩn `theme.layout.minTouchTarget = 44`:
1. `AppButton`: `minHeight: 44, minWidth: 44` (đối với size sm/md/lg).
2. `AppInput`: `minHeight: 44`, các nút clear `✕` và con mắt `👁️` có vùng bấm `minHeight: 44, minWidth: 44`.
3. `FavoriteToggleButton`: nút tim dạng icon có kích thước `44x44px`, dạng button có `minHeight: 44, minWidth: 44`.
4. `clearFilterBtnStyle` (Nút Xóa bộ lọc trên Catalogue): Đã nâng cấp từ 32px lên `minHeight: 44, minWidth: 44`.
5. `demoChipStyle` (Các nút mô phỏng Demo trên Catalogue): Đã nâng cấp lên `minHeight: 44, minWidth: 44`.
6. `roleChipStyle` (Bộ chọn vai trò Người mua / Người bán trên Detail): Đã nâng cấp từ 32px lên `minHeight: 44, minWidth: 44`.
7. `dismissBtnStyle` (Nút đóng thông báo lỗi làm mới): Đã nâng cấp từ 32px lên `minHeight: 44, minWidth: 44`.
8. `presetChip` (Chọn tài khoản nhanh màn đăng nhập): Đã cố định `minHeight: 44, minWidth: 44`.

### 3.3. Không truyền đạt thông tin quan trọng CHỈ bằng màu sắc
Tuân thủ nguyên tắc WCAG AA "Use of Color":
- **Tình trạng tồn kho**: Bên cạnh màu sắc (xanh/đỏ/xám), luôn có nhãn chữ rõ ràng: `Còn hàng (X món)`, `Hết hàng / Tạm ngưng`, `Đã bị xoá`.
- **Cảnh báo tồn kho trong giỏ hàng**: Có icon cảnh báo `⚠️`, tiêu đề `⚠️ Thay đổi thông tin tồn kho` và dòng text mô tả chi tiết sản phẩm nào đã hết hoặc vượt tồn kho.
- **Danh mục đang chọn**: Hiển thị biểu tượng `✓` trước tên danh mục (`✓ Sách giáo trình`), font chữ in đậm, và thuộc tính `accessibilityState={{ selected: true }}`.
- **Phương thức giao nhận**: Hiển thị ký hiệu radio button văn bản (`✓ ` khi chọn, `○ ` khi chưa chọn).
- **Mức miễn phí giao hàng**: Hiển thị text chữ `✓ Đã đạt điều kiện Miễn phí giao KTX` thay vì chỉ bôi màu xanh lá.
- **Bằng chứng nén ảnh**: Hiển thị rõ số byte, tỷ lệ phần trăm `Giảm 91%` và huy hiệu `✓ Đạt chuẩn`.

### 3.4. Tránh che khuất Bàn phím & Nhãn Hỗ trợ (Keyboard & Screen Reader Safety)
- Màn hình đăng nhập (`sign-in.tsx`) và modal đăng tin (`create-listing.tsx`) đều được bọc `KeyboardAvoidingView` với cấu hình:
  - iOS: `behavior="padding"`, `keyboardVerticalOffset={64}` (đảm bảo không bị thanh tiêu đề hay bàn phím che mất nút bấm).
  - Android: `behavior=undefined` (cho phép hệ điều hành điều chỉnh layout tự nhiên).
  - `ScrollView` cấu hình `keyboardShouldPersistTaps="handled"` cho phép người dùng chạm bấm các nút hoặc chip mà không bị bàn phím nuốt mất sự kiện chạm.
- Mọi thông báo lỗi form xuất hiện ngay bên dưới ô nhập kèm `accessibilityRole="alert"` để trình đọc màn hình đọc to ngay lập tức khi phát hiện nhập sai.

### 3.5. Chống màn hình trắng (Zero Blank Screen Policy)
- **Khi khởi động & khôi phục phiên (Session Restore)**: `app/_layout.tsx` hiển thị Splash Screen tuân thủ token theme với `ActivityIndicator` màu primary, tiêu đề app, phụ đề "Đang khôi phục phiên làm việc..." và `accessibilityRole="alert"`. Không bao giờ chớp màn hình trắng.
- **Khi ngoại tuyến (Offline)**: Màn hình Catalogue tự động nạp từ bộ nhớ đệm `AsyncStorage` (`getCatalogueCache`), hiển thị toàn bộ danh sách đồ dùng cùng `OfflineBanner` màu vàng và thời điểm cập nhật lần cuối `lastUpdated`.
- **Khi mất mạng không có cache**: Hiển thị `ErrorState` có icon, mô tả lỗi mạng và nút "Thử lại", không văng app.
- **Khi lỗi pull-to-refresh**: Giữ nguyên 100% danh sách sản phẩm đang hiển thị, không xóa trắng màn hình.

---

## 4. Danh sách các File đã Sửa đổi & Bổ sung (Audit Trail)

| File thay đổi | Nội dung khắc phục / Nâng cấp |
|---|---|
| `app/_layout.tsx` | Bọc `ThemeProvider` ở root, đồng bộ `useTheme()` cho Splash Screen khôi phục phiên (tránh màn hình trắng, thích ứng dark mode), cập nhật màu `StatusBar` động. |
| `app/+not-found.tsx` | Bọc `ScreenState` hỗ trợ 4 trạng thái, tích hợp thanh Review Switcher phục vụ chấm điểm, đảm bảo nút link quay về `/` đạt chuẩn touch target 44x44px. |
| `app/(auth)/sign-in.tsx` | Bổ sung `emptyActionLabel` và `onEmptyAction` cho `ScreenStateView` để thoát trạng thái rỗng về lại form đăng nhập; tối ưu hóa `KeyboardAvoidingView`. |
| `app/(app)/(tabs)/index.tsx` | Tích hợp nút chuyển đổi giao diện Sáng / Tối (`☀️ / 🌙`) trên thanh Demo; sửa `clearFilterBtnStyle` và `demoChipStyle` từ kích thước nhỏ lên chuẩn touch target >= 44x44px. |
| `app/(app)/listing/[id].tsx` | Sửa `roleChipStyle` (bộ chọn vai trò Người mua / Người bán) từ minHeight 32px lên chuẩn touch target >= 44x44px. |
| `app/(app)/modal/create-listing.tsx` | Bổ sung `demoStateOverride` và thanh `ScreenState` switcher 4 trạng thái phục vụ viva chấm điểm; thêm `keyboardVerticalOffset` và `keyboardShouldPersistTaps="handled"`. |
| `components/common/ScreenStateView.tsx` | Mở rộng kiểu dữ liệu `ScreenStateViewProps` hỗ trợ `emptyActionLabel`, `onEmptyAction`, `retryLabel`, `errorTitle`. |
| `features/catalogue/components/CatalogueHeaderFreshness.tsx` | Sửa nút đóng thông báo lỗi làm mới `dismissBtnStyle` từ 32x32px lên chuẩn touch target >= 44x44px. |
| `scripts/patch-prompt10.js` | Script thực thi patch tự động các điểm nâng cấp đảm bảo an toàn cú pháp. |
| `scripts/audit-accessibility.js` | Tool kiểm tra tự động toàn bộ thuộc tính `accessibilityRole` và `accessibilityLabel` trên các thẻ JSX tương tác. |
| `scripts/test-prompt10-audit.js` | Bộ 18 test cases tự động kiểm tra: 4 trạng thái trên 7 screens, Theme Tokens, Contrast Ratio, A11y Roles/Labels, Touch Targets, Non-color Indicators, Keyboard, Routing. |
| `package.json` | Tích hợp script `"test:audit"` vào lệnh kiểm thử tổng quát `"test"` và `"check:all"`. |

---

## 5. Danh mục các mục CẦN Kiểm thử Trên Thiết bị Thật (Physical Device Testing Checklist)

Mặc dù toàn bộ code đã vượt qua 100% bài kiểm tra tự động (unit tests, static AST audit, contrast math audit, typecheck strict), các mục dưới đây liên quan trực tiếp đến phần cứng và hệ điều hành cần nhóm sinh viên kiểm tra thực tế trên điện thoại (Android & iOS):

| STT | Hạng mục cần test trên máy thật | Thiết bị áp dụng | Thao tác kiểm thử thủ công | Kết quả mong đợi |
|---|---|---|---|---|
| 1 | **Trình đọc màn hình TalkBack** | Điện thoại Android thật | Bật TalkBack trong Cài đặt Trợ năng, vuốt ngón tay qua từng thành phần trên màn hình Catalogue và Giỏ hàng | Đọc to nhãn `accessibilityLabel` của từng thẻ sản phẩm, nút tim, nút thêm giỏ, giá tiền integer VND; không bị kẹt focus. |
| 2 | **Trình đọc màn hình VoiceOver** | iPhone / iPad thật | Bật VoiceOver trong Trợ năng, chạm 2 lần vào nút "Lưu yêu thích" và các tab navigation | VoiceOver đọc to trạng thái thay đổi ("Đã chọn / Chưa chọn"), đọc rõ số lượng tồn kho và tổng tiền thanh toán. |
| 3 | **Phóng to chữ hệ thống (Font Scaling 200%)** | Android / iOS | Vào Cài đặt hiển thị trên máy -> Cỡ chữ -> Kéo lên mức tối đa (200%) | Chữ trong các thẻ sản phẩm, tiêu đề và nút bấm tự động co giãn / xuống dòng hợp lý, không bị vỡ layout hoặc cắt cụt chữ quan trọng. |
| 4 | **Bàn phím ảo phần cứng che ô nhập (Soft Keyboard)** | Điện thoại Android & iOS | Mở modal Đăng tin mới -> Chạm vào ô "Mô tả chi tiết tình trạng" ở dưới cùng | Màn hình tự động cuộn lên phía trên bàn phím; nút "Hủy bỏ" và "Đăng tin ngay" vẫn có thể cuộn tới và bấm được. |
| 5 | **Phân quyền Máy ảnh phần cứng (Camera Hardware Permission)** | Điện thoại thật | Lần đầu mở Modal Đăng tin -> Bấm "📷 Chụp ảnh mới" -> Chọn "Từ chối" quyền | Ứng dụng hiện banner cảnh báo màu đỏ thân thiện và nút "Thử cấp lại quyền" / "Mở Cài đặt"; khi cấp lại quyền, máy ảnh thật khởi động bình thường. |
| 6 | **Tai thỏ, Đảo động & Thanh điều hướng (SafeArea Insets)** | iPhone có Dynamic Island & Android có thanh vuốt đáy | Mở màn hình Chi tiết sản phẩm (`listing/[id].tsx`) và Giỏ hàng | Thanh CTA cố định ở đáy màn hình nằm trên thanh gạt Home Indicator, không bị mép màn hình hay tai thỏ che mất nội dung. |
| 7 | **Chế độ Tối toàn hệ thống (System Dark Mode Toggle)** | Android / iOS | Kéo thanh trạng thái điện thoại xuống -> Bật chế độ Tối (Dark Theme) của điện thoại | Ứng dụng tự động chuyển sang nền tối (`#0B0F17`), thanh tab và card chuyển `#161E2E`, chữ chuyển màu trắng sáng tương phản cao 18:1. |
| 8 | **Rung phản hồi xúc giác (Haptic Feedback)** *(nếu có)* | Thiết bị di động thật | Bấm nút Thêm vào giỏ hoặc chuyển tab | Nút bấm phản hồi ngay lập tức, không có độ trễ giật lag. |

---

## 6. Lệnh Xác minh & Chạy Kiểm thử Toàn bộ Dự án

Để kiểm tra lại toàn bộ hệ thống kiểm thử tự động của đồ án, chạy các lệnh sau từ thư mục `1923050409_NguyenThanhLong_FinalExam/campus-marketplace`:

```bash
# 1. Kiểm tra strict TypeScript compilation (phải 0 lỗi)
npm run typecheck

# 2. Kiểm tra quy tắc mã màu và độ tương phản WCAG AA
npm run audit:theme

# 3. Chạy riêng bộ kiểm toán Prompt 10 (4 states, a11y, touch target, keyboard)
npm run test:audit

# 4. Chạy toàn bộ 9 test suites của toàn dự án (175 test cases)
npm test

# 5. Lệnh tổng hợp nghiệm thu chất lượng (typecheck + theme audit + 9 test suites)
npm run check:all
```
