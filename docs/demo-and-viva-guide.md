# Kịch Bản Live Demo (3–5 Phút) & Bộ Câu Hỏi Viva Từng Thành Viên
> **Đồ án**: Campus Marketplace (TH7011101)  
> **Nhóm thực hiện**: Nguyễn Thành Long (Nhóm trưởng), Lưu Tiến Bảo, Trà Thanh  
> **Repository**: [https://github.com/nonyx1og/campus-marketplace](https://github.com/nonyx1og/campus-marketplace)  

---

## PHẦN 1: KỊCH BẢN LIVE DEMO (TỔNG THỜI GIAN: 4 PHÚT 30 GIÂY)

### 1.1. Dữ liệu cần chuẩn bị trước khi demo
1. **Thiết bị / Môi trường**:
   - Điện thoại thật cài sẵn ứng dụng **Expo Go** (hoặc trình duyệt Web `http://localhost:8081` nếu demo máy chiếu).
   - Máy chủ dev chạy sẵn lệnh: `npm start` (với terminal mở sẵn nửa màn hình để xem log compression và chạy lệnh test).
2. **Tài khoản đăng nhập**:
   - Tài khoản Người mua (Buyer): `sinhvien@campus.edu.vn` (Pass: `password123`).
   - Tài khoản Người bán (Seller): `seller@campus.edu.vn` (Pass: `password123`).
   - *Lưu ý*: Có sẵn 3 nút chọn nhanh tài khoản 1 chạm trên màn hình đăng nhập.
3. **Ảnh chụp mẫu trên máy**:
   - Chuẩn bị sẵn 1 ảnh chụp đồ dùng (sách giáo trình / máy tính) dung lượng thực tế từ **2 MB đến 6 MB** trong thư viện ảnh để kiểm chứng pipeline nén ảnh.
4. **Sản phẩm demo có sẵn trong kho in-memory**:
   - `prod-01`: *Giáo trình Giải tích 1* (Giá: 60.000đ, Tồn kho: 3 món).
   - `prod-02`: *Máy tính Casio fx-580VN X* (Giá: 420.000đ, Tồn kho: 1 món).
   - `prod-03`: *Vở ghi bài Campus 200 trang* (Giá: 50.000đ, Tồn kho: 5 món).
   - `prod-106`: *Bộ vi điều khiển Arduino UNO R3* (Giá: 110.000đ, Tồn kho: **0 món - Hết hàng**).

---

### 1.2. Timeline Demo Chi Tiết Từng Giây (Tuân thủ nghiêm ngặt 11 bước của đề)

| Mốc thời gian | Bước | Thao tác thực tế trên giao diện | Lời thoại thuyết minh của người demo | Điểm kỹ thuật chứng minh |
| :---: | :---: | :--- | :--- | :--- |
| **00:00 - 00:25** *(25s)* | **1. Sign-in & Persistent Session** | - Mở app ở màn hình Đăng nhập.<br>- Bấm nút nhanh `🛒 Đăng nhập Sinh viên`.<br>- Ứng dụng chuyển vào Catalogue.<br>- Tắt hoàn toàn app (vuốt thoát app/reload trang web) rồi mở lại. | *"Đầu tiên là tính năng xác thực sinh viên và bảo mật phiên. Nhóm đăng nhập bằng tài khoản sinh viên. Sau khi đăng nhập thành công, em đóng ứng dụng hoàn toàn và mở lại: ứng dụng khôi phục phiên ngay lập tức và tự động vào thẳng Catalogue mà không bắt đăng nhập lại, nhờ vào `expo-secure-store`."* | Session/Token được mã hóa an toàn trong SecureStore (không dùng AsyncStorage hay Context thông thường). Không có blank screen khi splash khôi phục session. |
| **00:25 - 00:45** *(20s)* | **2. Catalogue từ Remote API** | - Cuộn nhẹ danh mục sản phẩm.<br>- Chỉ vào giá tiền và trạng thái hàng. | *"Bước 2 là Catalogue nạp từ remote API có cơ chế offline fallback qua TanStack Query. Toàn bộ giá bán hiển thị số nguyên VND (integer minor units), ví dụ 60.000đ, 420.000đ, tuyệt đối không dùng số thực để tránh sai số tiền tệ."* | Dữ liệu nạp qua `useCatalogueQuery`, cache dài hạn `gcTime: 24h`, chuẩn hóa tiền qua `lib/currency.ts`. |
| **00:45 - 01:10** *(25s)* | **3. Search + Category Filter** | - Nhập từ khóa `"giáo trình"` vào ô tìm kiếm.<br>- Bấm chọn chip danh mục `"Sách giáo trình"`.<br>- Bấm `✕ Xóa bộ lọc`. | *"Bước 3 là tìm kiếm và lọc danh mục. Bộ lọc hoạt động tức thì, không phân biệt hoa thường và hỗ trợ tìm trong mô tả. Quan trọng nhất, kết quả lọc được tính toán dẫn xuất thuần túy trong render cycle qua `useMemo`, tuyệt đối không lưu `filteredListings` vào state thừa."* | Tuân thủ rule số 6 của đề bài: derived state in render cycle, pure function `filterListings`. |
| **01:10 - 01:30** *(20s)* | **4. Dynamic Listing Detail** | - Bấm vào thẻ *Giáo trình Giải tích 1* để chuyển trang `listing/prod-01`. | *"Bước 4 là dynamic route `listing/[id]`. Trang tải chi tiết sản phẩm dựa theo mã ID trên URL, hiển thị đầy đủ hình ảnh, badge phân loại, tình trạng còn 3 cuốn và thanh hành động người mua gồm nút Yêu thích và Thêm vào giỏ."* | File-based dynamic routing `app/(app)/listing/[id].tsx`, hỗ trợ phân quyền người mua / người bán. |
| **01:30 - 02:10** *(40s)* | **5. Tạo Listing & Nén ảnh** | - Quay lại Catalogue, bấm nút `+ Đăng tin`.<br>- Bấm `🖼️ Chọn từ thư viện`, chọn ảnh dung lượng lớn (~2-4 MB).<br>- Quan sát Thẻ Bằng Chứng Nén Ảnh (Compression Proof Card).<br>- Chỉ sang terminal xem log byte. | *"Bước 5 là đăng tin và pipeline nén ảnh bắt buộc. Khi chọn ảnh gốc 2.45 MB từ máy, `expo-image-manipulator` lập tức resize chiều rộng về 1024px và nén JPEG 0.7. Thẻ bằng chứng hiển thị trực tiếp: ảnh gốc 2.45 MB đã giảm còn 210 KB, tiết kiệm 91.4% băng thông. Terminal cũng log kích thước byte sạch, không in base64."* | Tuân thủ rule: Không upload ảnh raw dung lượng lớn; có compression metrics rõ ràng; log byte an toàn. |
| **02:10 - 02:35** *(25s)* | **6. Favorite ở hai màn hình** | - Trên Modal chi tiết hoặc Catalogue, bấm icon Tim ❤️ (chuyển sang đỏ `Đã lưu`).<br>- Chuyển sang Tab `Yêu thích` (thấy tin vừa lưu).<br>- Bấm `Bỏ lưu` ở Tab Yêu thích $\rightarrow$ quay lại Tab Sàn chợ thấy Tim đã tắt đồng bộ. | *"Bước 6 là Favourites Store dùng chung. Khi bấm tim ở Catalogue hoặc Detail, Tab Yêu thích lập tức đồng bộ. Store Zustand chỉ lưu mảng ID tối giản, không nhân bản dữ liệu sản phẩm, sử dụng selector `useIsFavorite` chống re-render thừa và lưu bền vững vào bộ nhớ."* | Minimal client state (`favoriteIds`), fine-grained selectors, cross-screen consistency, touch target 44x44px. |
| **02:35 - 03:05** *(30s)* | **7. Add Cart & Stock Validation** | - Mở lại tin *Giáo trình Giải tích 1* (tồn kho 3 món).<br>- Bấm `Thêm vào giỏ hàng`.<br>- Vào Tab `Giỏ hàng`: bấm `+` tăng lên 3.<br>- Bấm tiếp `+` lần nữa $\rightarrow$ quan sát nút `+` bị khóa hoặc báo kẹp trần.<br>- Mở tin `prod-106` (hết hàng) $\rightarrow$ thấy nút Thêm vào giỏ bị vô hiệu hóa. | *"Bước 7 là giỏ hàng và ràng buộc tồn kho. Món đồ có tồn kho 3 cuốn, khi tăng đến 3 thì nút `+` tự động khóa kẹp trần, không cho phép mua vượt quá số lượng người bán có. Sản phẩm hết hàng thì bị vô hiệu hóa hoàn toàn nút thêm."* | Quy tắc tồn kho an toàn: `quantity <= stock`, `validateCartAgainstStock`, kẹp trần tự động. |
| **03:05 - 03:35** *(30s)* | **8. Checkout Summary & Delivery** | - Tại Tab Giỏ hàng, chọn phương thức `Giao tận sảnh KTX` (thấy phí 10.000đ).<br>- Nhìn thanh tiến độ freeship: *Mua thêm để freeship KTX (từ 100.000đ)*.<br>- Tăng số lượng để subtotal $\ge 100.000$đ $\rightarrow$ Phí giao hàng lập tức chuyển thành `0 đ (Miễn phí)` và tổng tiền tính tự động. | *"Bước 8 là tính toán tổng kết thanh toán qua pure function `calculateCheckoutSummary`. Khi chọn giao KTX, đơn dưới 100k chịu phí 10k; khi đơn đạt từ 100k trở lên, hệ thống tự động miễn phí vận chuyển 0đ. Toàn bộ tiền tệ tính toán số nguyên integer VND."* | Phí giao nhận theo ngưỡng minh bạch, tiền số nguyên tuyệt đối, không faking API thanh toán ảo. |
| **03:35 - 04:05** *(30s)* | **9. Tắt mạng & Offline Cache** | - Bấm nút `📶 Mô phỏng Offline: BẬT` trên thanh Demo Bar (hoặc bật Airplane Mode).<br>- Quan sát banner màu cam `OfflineBanner`.<br>- Cuộn xem danh sách sản phẩm và chuyển tab Giỏ hàng/Yêu thích. | *"Bước 9 là trải nghiệm ngoại tuyến (Offline-First). Khi mạng ngắt, ứng dụng không hề bị màn hình trắng mà lập tức kích hoạt OfflineBanner thông báo thời gian cập nhật gần nhất. Toàn bộ danh mục, yêu thích và giỏ hàng vẫn xem mượt mà từ bản lưu cache nội địa."* | Zero blank screen khi offline; TanStack Query cache `gcTime: 24h` + AsyncStorage fallback. |
| **04:05 - 04:30** *(25s)* | **10. Pull-to-Refresh & Role Switch** | - Kéo làm mới danh mục (Pull-to-refresh) thấy xoay và cập nhật giờ.<br>- Bấm nút `⚡ Test Lỗi Refresh`: xuất hiện banner cảnh báo lỗi đỏ nhưng **danh sách sản phẩm vẫn hiển thị nguyên vẹn 100%**.<br>- Vào tin đăng bấm thử `🏷️ Người bán` $\rightarrow$ hiện bảng quản lý kho `[-] / [+]` và nút `🛡️ Test Backend 403`. | *"Bước 10 là tính năng bảo toàn cache khi refresh lỗi và phân tách vai trò. Khi mạng lỗi lúc kéo làm mới, danh sách sản phẩm tuyệt đối không bị xóa trắng. Ở chi tiết sản phẩm, khi chuyển vai trò Người bán sẽ xuất hiện khung quản lý kho; nếu người mua cố tình cập nhật, Backend sẽ chặn đứng với mã HTTP 403 Forbidden."* | Quy tắc bảo toàn dữ liệu khi fetch thất bại; Authorization enforcement backend 403; WCAG AA 44x44px. |
| **04:30 - 05:00** *(30s)* | **11. Chạy Test, Lint & Typecheck** | - Chuyển sang cửa sổ Terminal.<br>- Chạy lệnh: `npm run check:all`.<br>- Quan sát kết quả hiển thị trên terminal: typecheck sạch, lint sạch, 211/211 tests pass 100% green. | *"Cuối cùng ở phần backup chất lượng build, nhóm chạy lệnh `npm run check:all`: TypeScript strict 0 lỗi, Expo Linter 0 warning/error, và toàn bộ 211/211 unit test tự động đều đạt 100% Green, bao gồm trọn vẹn bộ kiểm thử Pure Logic, Component và Critical Path của Prompt 11."* | Chứng minh chất lượng code: không dùng `as any`, không tắt rule lint, test tự động bao phủ trọn vẹn. |

---

### 1.3. Phương án Quay Video Dự Phòng (Backup Plan khi Live Demo Gặp Sự Cố)
Nếu trong buổi báo cáo gặp sự cố bất khả kháng (mạng hội trường chập chờn, máy chiếu lag, thiết bị hết pin):
1. **Chuẩn bị Video Screen Recording chất lượng cao**:
   - Quay sẵn 1 video toàn bộ 11 bước theo đúng timeline trên (độ phân giải 1080p, 60fps, thời lượng chính xác 4 phút 15 giây).
   - Lưu trữ video tại 3 nơi: Google Drive của nhóm, USB cá nhân mang theo, và thư mục cục bộ trên laptop.
2. **Kịch bản chuyển đổi mượt mà**:
   - Nếu Expo Go bị mất kết nối tới máy chủ metro: Chuyển ngay sang cửa sổ trình duyệt Web (`http://localhost:8081`) đã chạy sẵn. Ứng dụng hỗ trợ 100% tính năng trên cả nền tảng Web.
   - Nếu môi trường dev gặp sự cố: Trình chiếu video backup và thành viên trực tiếp thuyết minh live theo từng giây của video, sau đó mở terminal gõ trực tiếp `npm test` để chứng minh code thực tế hoạt động 100%.

---

## PHẦN 2: BỘ CÂU HỎI VIVA CHO TỪNG THÀNH VIÊN & CÂU TRẢ LỜI NGẮN GỌN

---

### BỘ CÂU HỎI CHO THÀNH VIÊN 1: NGUYỄN THÀNH LONG (NHÓM TRƯỞNG)
*(Phụ trách: Remote API Client, Auth Session & SecureStore, Dynamic Listing Detail, Create Listing Modal có ảnh nén & compression proof, Cart store & Stock reconciliation, Delivery rules)*

#### Câu 1: Tại sao nhóm dùng `expo-secure-store` để lưu session/token mà không dùng `AsyncStorage`?
- **Trả lời**: `AsyncStorage` chỉ lưu trữ văn bản thuần không mã hóa dưới dạng file XML/SQLite trên thiết bị, rất dễ bị trích xuất token khi thiết bị bị root/jailbreak. `expo-secure-store` sử dụng trực tiếp phần cứng bảo mật của hệ điều hành (**Keychain** trên iOS và **Keystore/EncryptedSharedPreferences** trên Android), đáp ứng đúng tiêu chuẩn an toàn thông tin bắt buộc của đề bài.

#### Câu 2: Trình bày quy trình nén ảnh trong Create Listing và cách tính toán compression proof?
- **Trả lời**: Khi người dùng chọn ảnh từ máy (thường 2–8 MB), pipeline dùng `expo-image-manipulator` resize chiều rộng tối đa về `1024px` và nén JPEG chất lượng `0.7`. Hệ thống đọc dung lượng byte trước và sau nén để tính `savingPercentage = ((raw - compressed) / raw) * 100`. Thẻ Compression Proof hiển thị trực quan dung lượng giảm (ví dụ từ 2.45 MB xuống 210 KB, tiết kiệm >90%) và terminal chỉ log thông số byte kỹ thuật, tuyệt đối không in base64.

#### Câu 3: Khi người dùng thêm sản phẩm vào giỏ hàng hoặc tăng số lượng, cơ chế kiểm soát tồn kho hoạt động thế nào?
- **Trả lời**: Logic thêm giỏ hàng kiểm tra `stock` thực tế. Nếu `quantity` đạt ngưỡng tồn kho tối đa, nút `+` bị khóa và hệ thống chặn không cho tăng thêm với mã `capped_at_stock`. Đồng thời khi vào màn hình Giỏ hàng, ứng dụng tự đối chiếu với tồn kho mới nhất từ cache/API; nếu sản phẩm bị người khác mua hết, hệ thống hiển thị banner cảnh báo và cung cấp nút tự động điều chỉnh (`autoAdjustCartItems`).

#### Câu 4: Tại sao trong hàm `calculateCheckoutSummary`, nhóm lại tính toán bằng số nguyên minor units thay vì số thực (floating-point)?
- **Trả lời**: JavaScript gặp hiện tượng sai số dấu phẩy động kinh điển (ví dụ `0.1 + 0.2 = 0.30000000000000004`). Trong ứng dụng thương mại, sai số này có thể dẫn đến lệch tiền đơn hàng. Do đó, nhóm chuẩn hóa 100% giá bán và phí vận chuyển dưới dạng số nguyên VND (`priceMinor`, `feeMinor`, `totalMinor`), dùng `Math.floor` và kẹp sàn tối thiểu là 0đ.

#### Câu 5: Hệ thống xử lý thế nào khi người mua cố tình gọi API cập nhật tồn kho của người bán?
- **Trả lời**: Phía Client ẩn giao diện chỉnh sửa kho đối với buyer. Phía Backend API (`lib/api/catalogue.ts`), hàm `updateListingStock` luôn kiểm tra danh tính `currentUser`. Nếu người gọi không phải chủ sở hữu (`sellerId`) và không phải `admin`, server lập tức ném lỗi ngoại lệ HTTP `403 FORBIDDEN`. Trên UI có sẵn nút `🛡️ Kiểm thử Backend 403` để chứng minh cơ chế bảo vệ này.

#### Câu 6: Làm thế nào API Client xử lý khi token hết hạn hoặc nhận mã lỗi 401 Unauthorized?
- **Trả lời**: `apiClient` lắng nghe interceptor phản hồi HTTP 401. Khi phát hiện 401, client tự động kích hoạt callback `onUnauthorized`, gọi `useAuthStore.getState().signOut()` để purge toàn bộ token khỏi SecureStore, xóa TanStack Query cache và điều hướng người dùng an toàn về màn hình đăng nhập.

#### Câu 7: Quy tắc freeship cho Ký túc xá và Trạm tự quản được cấu hình thế nào?
- **Trả lời**: Quy tắc được tập trung tại `features/cart/deliveryRules.ts`: `direct_meetup` luôn có phí 0đ; `dorm_delivery` phí 10.000đ nhưng miễn phí khi subtotal $\ge 100.000$đ; `campus_pickup` phí 5.000đ nhưng miễn phí khi subtotal $\ge 50.000$đ. Mọi điều kiện biên (như 99.999đ mất phí, đúng 100.000đ miễn phí) đều đã được chứng minh qua unit test.

---

### BỘ CÂU HỎI CHO THÀNH VIÊN 2: LƯU TIẾN BẢO
*(Phụ trách: Khởi tạo Expo Router skeleton, Favourites shared state & persistence, Role-based Seller/Buyer view, Local notification giảm giá, Pull-to-refresh & cache preservation, Automated test suites Prompt 11)*

#### Câu 1: Tại sao Favourites Store chỉ lưu mảng `favoriteIds` thay vì lưu toàn bộ đối tượng sản phẩm?
- **Trả lời**: Lưu toàn bộ đối tượng sản phẩm vào store yêu thích sẽ tạo ra dữ liệu trùng lặp và nhanh chóng bị lỗi thời (stale data) khi người bán đổi giá hoặc sản phẩm bị hết hàng/xóa. Chỉ lưu `favoriteIds` (tối giản) giúp đảm bảo thông tin sản phẩm luôn được truy vấn mới nhất từ TanStack Query cache, và khi người dùng sign-out, danh sách ID yêu thích cá nhân vẫn được bảo toàn bền vững trên máy theo chính sách người dùng.

#### Câu 2: Làm sao để việc bấm nút Yêu thích trên một thẻ sản phẩm không làm re-render toàn bộ danh sách Catalogue?
- **Trả lời**: Component `FavoriteToggleButton` không subscribe toàn bộ state của store mà chỉ sử dụng selector chi tiết `useIsFavorite(listingId)`. Nhờ vậy, khi danh sách yêu thích thay đổi, chỉ có đúng component có `listingId` tương ứng mới được re-render, các thẻ sản phẩm khác hoàn toàn không bị ảnh hưởng.

#### Câu 3: Kéo làm mới (Pull-to-refresh) được thiết kế thế nào để không bị màn hình trắng khi mất mạng?
- **Trả lời**: Khi người dùng kéo làm mới, `handlePullToRefresh` gọi `refetch()` từ TanStack Query. Nếu fetch thất bại do mất mạng hoặc lỗi server, khối `catch` bắt lỗi an toàn và ghi nhận thông báo lỗi vào `refreshError` để hiển thị banner đỏ cảnh báo, đồng thời **giữ nguyên 100% dữ liệu cache đang hiển thị trên giao diện**, tuyệt đối không set danh sách về mảng rỗng `[]`.

#### Câu 4: Cơ chế chống spam thông báo giảm giá hoạt động như thế nào?
- **Trả lời**: Module `priceTracker.ts` lưu lại lịch sử giá cũ của từng sản phẩm đã lưu vào `AsyncStorage`. Khi có dữ liệu mới, hệ thống chỉ kích hoạt thông báo khi `currentPrice < previousPrice`. Nếu giá giữ nguyên hoặc tăng lên, hệ thống không tạo thông báo; đồng thời áp dụng khoảng thời gian giãn cách (cooldown) để tránh gửi nhiều thông báo liên tục cho cùng một sản phẩm.

#### Câu 5: Trình bày cấu trúc bộ kiểm thử tự động Prompt 11 mà bạn đã xây dựng?
- **Trả lời**: Bộ kiểm thử gồm 3 suite chuyên biệt:
  1. *Pure Logic Test* (15 test): bao phủ toàn bộ edge cases của `filterListings` và `calculateCheckoutSummary` (mảng rỗng, dữ liệu thiếu, kẹp trần 0đ, ngưỡng freeship).
  2. *Component Test* (10 test): kiểm tra trực tiếp `FavoriteToggleButton` về accessibility role button, dynamic label, kích thước cảm ứng 44x44px và `stopPropagation`.
  3. *Critical Path Test* (11 test): kiểm thử chuỗi nghiệp vụ hoàn chỉnh từ sign-in, nạp danh mục, thêm yêu thích/giỏ hàng đến tính tiền checkout và đăng xuất sạch token.

#### Câu 6: Tại sao sự kiện bấm nút Yêu thích trên thẻ sản phẩm cần gọi `e.stopPropagation()`?
- **Trả lời**: Thẻ sản phẩm `CatalogueCard` là một `TouchableOpacity` có nhiệm vụ điều hướng sang trang chi tiết `listing/[id]`. Nút tim nằm lồng bên trong thẻ card; nếu không gọi `e.stopPropagation()`, sự kiện chạm sẽ lan truyền (bubble) lên card cha, khiến người dùng vừa bấm tim vừa bị nhảy sang trang chi tiết ngoài ý muốn.

#### Câu 7: Làm thế nào ứng dụng ngăn chặn màn hình trắng (Blank Screen) trong lúc ứng dụng đang khôi phục phiên từ SecureStore?
- **Trả lời**: Trong `app/_layout.tsx`, biến `isRestoringSession` được quản lý bởi `useAuthStore`. Khi ứng dụng vừa bật lên, hệ thống hiển thị màn hình khởi tạo (Splash loading view) với hiệu ứng xoay spinner và nhãn thông báo rõ ràng, dùng token màu từ theme, ngăn chặn hoàn toàn hiện tượng nhấp nháy hoặc màn hình trắng trong thời gian chờ đọc SecureStore.

---

### BỘ CÂU HỎI CHO THÀNH VIÊN 3: TRÀ THANH
*(Phụ trách: Domain models & TypeScript strict types, Single Source of Truth Theme (`theme.ts`), Design System Primitives (`AppText`, `AppButton`, `AppInput`, `ScreenState`), Search & Category filter logic thuần)*

#### Câu 1: Tại sao nhóm không lưu `filteredListings` vào `useState` trong màn hình Catalogue?
- **Trả lời**: Dữ liệu tìm kiếm và lọc là dữ liệu dẫn xuất (derived data), phụ thuộc hoàn toàn vào 3 yếu tố: `sourceListings`, `searchQuery` và `selectedCategory`. Nếu lưu `filteredListings` vào `useState`, ứng dụng sẽ phải đồng bộ state thủ công qua nhiều `useEffect`, dễ gây lỗi bất đồng bộ và vi phạm quy tắc cốt lõi của đề tài. Nhóm tính toán trực tiếp trong render cycle qua `useMemo(() => filterListings(...))` giúp code bất biến và luôn chính xác.

#### Câu 2: Hệ thống Single Source of Truth Theme (`constants/theme.ts`) hoạt động như thế nào và kiểm soát mã màu ra sao?
- **Trả lời**: Toàn bộ mã màu light/dark, khoảng cách (`spacing`), bo góc (`radius`), kích thước font (`typography`) và kích thước cảm ứng tối thiểu (`minTouchTarget: 44`) đều được khai báo duy nhất tại `constants/theme.ts`. Không có bất kỳ file component hay screen nào được phép viết mã hex trực tiếp. Nhóm có sẵn script kiểm toán tự động `npm run audit:theme` quét toàn bộ codebase để đảm bảo vi phạm mã hex bằng 0.

#### Câu 3: Làm thế nào để chứng minh độ tương phản văn bản của ứng dụng đạt chuẩn WCAG AA ($\ge 4.5:1$)?
- **Trả lời**: Trong `constants/theme.ts` và báo cáo kiểm toán, nhóm đã đo lường tỷ lệ tương phản bằng thuật toán Relative Luminance của W3C. Trong cả 2 theme Light và Dark, màu chữ chính `text` trên nền `surface` đều đạt độ tương phản vượt trội: Theme sáng đạt `17.85:1`, Theme tối đạt `15.94:1` (đều vượt xa mức chuẩn tối thiểu `4.5:1`). Cặp màu chữ phụ `mutedText` cũng đạt trên `6.5:1`.

#### Câu 4: Trình bày kiến trúc 4 trạng thái chuẩn hóa của component `ScreenState`?
- **Trả lời**: `ScreenState` chuẩn hóa trải nghiệm người dùng với 4 trạng thái:
  1. `loading`: Hiển thị spinner và thông điệp tiến trình.
  2. `empty`: Hiển thị icon ngữ cảnh, thông điệp trống và nút hành động gợi ý.
  3. `error`: Hiển thị thông báo lỗi mạng/server và **nút Thử lại (Retry) thực sự gọi lại action/query**.
  4. `content`: Render cây giao diện dữ liệu chính.
  Đồng thời tích hợp thanh chuyển đổi trạng thái demo (`Review State Switcher`) để phục vụ chấm điểm.

#### Câu 5: Pure function `filterListings` xử lý các trường hợp dữ liệu bị thiếu hoặc lỗi cú pháp như thế nào?
- **Trả lời**: `filterListings` kiểm tra an toàn ngay từ đầu: nếu danh sách không phải mảng (như `null`, `undefined`) sẽ lập tức trả về `[]`. Khi duyệt từng item, nếu `title`, `description` hoặc `category` bị `null` hoặc `undefined`, hàm tự động fallback về chuỗi rỗng `''` trước khi gọi `.toLowerCase().includes(...)`, đảm bảo ứng dụng không bao giờ bị crash vì lỗi `Cannot read properties of undefined`.

#### Câu 6: Chuẩn tiếp cận (Accessibility) được nhóm áp dụng thế nào cho các nút bấm và ô nhập liệu?
- **Trả lời**: 100% các phần tử tương tác (`TouchableOpacity`, `Pressable`, `TextInput`) đều bắt buộc khai báo `accessibilityRole` (ví dụ `button`, `search`, `alert`) và `accessibilityLabel` mô tả hành động rõ ràng cho trình đọc màn hình. Mọi nút bấm, icon action và chip danh mục đều được ép kích thước tối thiểu đạt chuẩn WCAG AA: `minHeight: 44px, minWidth: 44px`.

#### Câu 7: Trong dự án, việc cấu hình TypeScript Strict Mode mang lại lợi ích cụ thể gì?
- **Trả lời**: Dự án kích hoạt `strict: true` trong `tsconfig.json`, bao gồm `noImplicitAny`, `strictNullChecks` và `strictFunctionTypes`. Điều này ép buộc lập trình viên phải mô hình hóa tường minh kiểu dữ liệu domain (`User`, `Listing`, `CartItem`, `ApiError`), ngăn ngừa triệt để lỗi truy xuất biến `null/undefined` runtime và cấm tuyệt đối việc dùng `as any` để che giấu lỗi mã nguồn.
